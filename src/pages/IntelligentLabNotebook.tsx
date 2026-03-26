import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  FiSave,
  FiDownload,
  FiClock,
  FiSend,
  FiPlus,
  FiRefreshCw,
  FiBookOpen,
  FiMic,
  FiMicOff,
  FiTrash2,
} from 'react-icons/fi';
import { aiService } from '../services/aiService';
import { useTheme } from '../context/ThemeContext';
import TaskRecommendation from '../components/TaskRecommendation';
import type { TaskRecommendationItem } from '../components/TaskRecommendation';

interface Note {
  id: number;
  experimentId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AISuggestion {
  validation: string;
  followUpQuestions: string[];
  safetyWarnings: string[];
  relatedStandards: string[];
}

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function IntelligentLabNotebook() {
  const { isDark } = useTheme();
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
  const [experimentId] = useState<number>(1); // TODO: Get from context or URL params
  const [isDictating, setIsDictating] = useState(false);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hola. Soy tu asistente de laboratorio inteligente. Mientras escribes tus notas, analizaré el contenido y te daré sugerencias científicas. ¿Sobre qué experimento trabajas hoy?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isExtractingInsertable, setIsExtractingInsertable] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [experimentId]);

  const loadNotes = async () => {
    try {
      const response = await fetch(`/api/experiments/${experimentId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch {
      // notes endpoint not yet available
    }
  };

  const deleteNotebookNote = async (noteId: number) => {
    const note = notes.find((item) => item.id === noteId);
    const confirmed = window.confirm(
      `Se eliminará completamente esta nota${note ? ` (ID ${note.id})` : ''}. Esta acción no se puede deshacer. ¿Deseas continuar?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/experiments/${experimentId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar la nota');
      }

      setNotes((prev) => prev.filter((item) => item.id !== noteId));
      if (currentNoteId === noteId) {
        setCurrentNoteId(null);
        setNoteContent('');
        setMessages([messages[0]]);
      }
    } catch (error) {
      console.error('Error deleting notebook note:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const appendNoteContent = (chunk: string) => {
    setNoteContent((prev) => {
      const next = `${prev}${prev ? '\n' : ''}${chunk}`;
      return next;
    });
  };

  const normalizeNotebookText = (content: string) =>
    content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '- ')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .trim();

  const insertAssistantTextIntoNotebook = async (content: string) => {
    if (!content?.trim()) return;

    setIsExtractingInsertable(true);
    try {
      const extraction = await aiService.extractNotebookInsertable({
        assistantMessage: content,
        mode: 'auto',
        preserveFormatting: true,
        maxItems: 10,
        userPrompt: 'Extrae solo la parte que debe guardarse en el notebook, sin saludos ni relleno.',
      });

      const plainText = normalizeNotebookText(extraction.insertableText || '');
      if (!plainText) return;
      appendNoteContent(plainText);
    } catch (error) {
      console.error('Error extrayendo contenido insertable:', error);
      // Fallback local si la API no esta disponible
      const plainText = normalizeNotebookText(content);
      if (!plainText) return;
      appendNoteContent(plainText);
    } finally {
      setIsExtractingInsertable(false);
    }
  };

  // Handle note changes - only update local state, save only on button click
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setNoteContent(content);
  };

  const stopCurrentDictation = () => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startHandsFreeDictation = async () => {
    if (isDictating) {
      stopCurrentDictation();
      return;
    }

    setIsDictating(true);

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionCtor) {
      try {
        const recognition: BrowserSpeechRecognition = new SpeechRecognitionCtor();
        recognitionRef.current = recognition;
        recognition.lang = 'es-MX';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcripts: string[] = [];
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const transcript = event.results[i]?.[0]?.transcript?.trim();
            if (transcript) {
              transcripts.push(transcript);
            }
          }

          if (transcripts.length > 0) {
            const chunk = transcripts.join(' ');
            appendNoteContent(chunk);
          }
        };

        recognition.onerror = (event: any) => {
          const code = String(event?.error ?? 'unknown');
          if (code !== 'aborted') {
            console.error(`Error de dictado por voz (${code}).`);
          }
        };

        recognition.onend = () => {
          recognitionRef.current = null;
          setIsDictating(false);
          if (listeningTimeoutRef.current) {
            clearTimeout(listeningTimeoutRef.current);
            listeningTimeoutRef.current = null;
          }
        };

        recognition.start();

        listeningTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 30000);

        return;
      } catch (error) {
        recognitionRef.current = null;
      }
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));

      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(mediaStream, { mimeType: supportedMimeType })
        : new MediaRecorder(mediaStream);

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        mediaStream.getTracks().forEach((track) => track.stop());
        setIsDictating(false);
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current);
          listeningTimeoutRef.current = null;
        }

        try {
          const transcribedText = await aiService.speechToText(audioBlob);
          appendNoteContent(transcribedText);
        } catch (error) {
          console.error('Error al transcribir audio:', error);
        }
      };

      mediaRecorder.start();

      listeningTimeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 30000);
    } catch (error) {
      setIsDictating(false);
      console.error('Acceso al micrófono denegado:', error);
    }
  };

  const saveNote = async (content: string): Promise<number | null> => {
    try {
      if (currentNoteId) {
        // Update existing note
        const response = await fetch(`/api/experiments/${experimentId}/notes/${currentNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (response.ok) {
          const updated = await response.json();
          setNotes(prev =>
            prev.map(n => (n.id === currentNoteId ? { ...n, ...updated } : n))
          );
          return currentNoteId;
        }
      } else {
        // Create new note
        const response = await fetch(`/api/experiments/${experimentId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (response.ok) {
          const newNote = await response.json();
          setNotes([newNote, ...notes]);
          setCurrentNoteId(newNote.id);
          return newNote.id;
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }

    return currentNoteId;
  };

  const handleAnalyzeText = async () => {
    const savedNoteId = await saveNote(noteContent);
    const noteIdToAnalyze = savedNoteId ?? currentNoteId;

    if (!noteIdToAnalyze) {
      return;
    }

    await generateSuggestions(noteIdToAnalyze);
  };

  const generateSuggestions = async (noteId: number) => {
    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch(
        `/api/experiments/${experimentId}/notes/${noteId}/ai-suggestions`,
        { method: 'POST' }
      );
      if (response.ok) {
        const data = await response.json();

        // Add AI suggestions to chat
        const suggestionText = formatSuggestionsAsMarkdown(data.suggestions);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: suggestionText },
        ] as ChatMessage[]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const formatSuggestionsAsMarkdown = (sugg: AISuggestion): string => {
    return `## Análisis Automático de tu Nota

### Validación
${sugg.validation}

### Preguntas de Seguimiento
${sugg.followUpQuestions.map(q => `- ${q}`).join('\n')}

### Estándares Relacionados
${sugg.relatedStandards.map(s => `- ${s}`).join('\n')}

${sugg.safetyWarnings.length > 0 ? `### Advertencias de Seguridad\n${sugg.safetyWarnings.map(w => `- ${w}`).join('\n')}` : ''}`;
  };

  const generateTaskRecommendations = (assistantMessage: string): TaskRecommendationItem[] => {
    const recommendations: TaskRecommendationItem[] = [];
    const lowerMsg = assistantMessage.toLowerCase();

    // Generar tareas más agresivamente
    // 1. Si menciona acciones a tomar
    if (lowerMsg.includes('próximo paso') || lowerMsg.includes('siguiente') || 
        lowerMsg.includes('debería') || lowerMsg.includes('recomienda') ||
        lowerMsg.includes('sugiero') || lowerMsg.includes('hacer')) {
      recommendations.push({
        title: 'Executar Acciones Recomendadas',
        description: 'Completa las acciones sugeridas por el asistente inteligente del laboratorio.',
        aiAssigner: 'Asistente del Notebook',
      });
    }

    // 2. Si menciona validación
    if (lowerMsg.includes('validar') || lowerMsg.includes('verificar') || 
        lowerMsg.includes('confirmar') || lowerMsg.includes('comprobar')) {
      recommendations.push({
        title: 'Validar Datos Experimentales',
        description: 'Verifica que los datos y parámetros del experimento sean correctos.',
        aiAssigner: 'Asistente del Notebook',
      });
    }

    // 3. Si menciona preguntas de seguimiento
    if (lowerMsg.includes('pregunta') || lowerMsg.includes('considera') || 
        lowerMsg.includes('piensa en') || lowerMsg.includes('análisis')) {
      recommendations.push({
        title: 'Responder Preguntas de Seguimiento',
        description: 'El IA sugiere responder las preguntas para profundizar el análisis.',
        aiAssigner: 'Asistente del Notebook',
      });
    }

    // 4. Si menciona registrar o documentar
    if (lowerMsg.includes('registra') || lowerMsg.includes('documenta') || 
        lowerMsg.includes('anota') || lowerMsg.includes('detalla')) {
      recommendations.push({
        title: 'Documentar Resultados',
        description: 'Asegúrate de registrar todos los detalles importantes del experimento.',
        aiAssigner: 'Asistente del Notebook',
      });
    }

    return recommendations;
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoadingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }] as ChatMessage[]);
    setIsLoadingChat(true);

    try {
      const responseText = await generateChatResponse(userMessage, noteContent);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: responseText },
      ] as ChatMessage[]);
    } catch (error) {
      console.error('Error in chat:', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Error al procesar tu mensaje. Por favor intenta de nuevo.';
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error al procesar tu mensaje: ${message}`,
        },
      ] as ChatMessage[]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const generateChatResponse = async (userMessage: string, noteContext: string): Promise<string> => {
    try {
      const projectId = localStorage.getItem('sapientlab_project_id');
      console.log('🔍 Frontend: Retrieving projectId from localStorage:', projectId);
      
      const payload = {
        message: userMessage,
        objective: 'Asistencia para redactar, analizar y mejorar notas científicas de laboratorio.',
        preferConcise: true,
        projectId: projectId ? parseInt(projectId, 10) : undefined,
        notebook: {
          notebookId: currentNoteId ? String(currentNoteId) : undefined,
          notebookTitle: `Experimento #${experimentId}`,
          activeCellNumber: 1,
          cells: [
            {
              id: 'notebook-content',
              cellType: 'markdown' as const,
              language: 'text',
              source: noteContext || noteContent,
            },
          ],
        },
      };
      
      console.log('📤 Frontend: Sending payload to notebookChat:', payload);
      
      const data = await aiService.notebookChat(payload);

      const reply = data.rawModelResponse ?? data.response ?? data.message ?? data.content ?? null;
      if (!reply) return '> Sin respuesta disponible.';
      return reply;
    } catch (notebookError) {
      const contextualMessage = [
        'Usa este contexto del notebook para responder.',
        `Experimento: #${experimentId}`,
        `Nota actual: ${noteContext || noteContent || 'Sin contenido aún.'}`,
        `Pregunta: ${userMessage}`,
      ].join('\n');

      const fallback = await aiService.sendMessage(contextualMessage, [
        { role: 'user', content: contextualMessage },
      ]);

      const fallbackReply =
        fallback.rawModelResponse ?? fallback.response ?? fallback.message ?? fallback.content ?? null;

      if (!fallbackReply) {
        const reason = notebookError instanceof Error ? notebookError.message : 'Sin detalle adicional';
        throw new Error(`Notebook chat sin respuesta y fallback fallido. Motivo inicial: ${reason}`);
      }

      return fallbackReply;
    }
  };

  const createNewNote = () => {
    setNoteContent('');
    setCurrentNoteId(null);
    setMessages([messages[0]]); // Reset chat to initial message
  };

  const selectNote = (note: Note) => {
    setNoteContent(note.content);
    setCurrentNoteId(note.id);
    setShowHistory(false);
    setMessages([messages[0]]); // Reset chat
  };

  const downloadNoteAsPDF = () => {
    // TODO: Implement PDF export
    const element = document.createElement('a');
    const file = new Blob([noteContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `nota-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className={`h-full w-full overflow-hidden flex flex-col ${
        isDark ? 'bg-[#0d1726]' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${
          isDark
            ? 'bg-[#0d1726] border-[#223349]'
            : 'bg-white border-lab-border'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              <FiBookOpen className="w-5 h-5 text-accent" />
              Lab Notebook Inteligente
            </h1>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Experimento #{experimentId}
            </span>
            <button
              type="button"
              onClick={startHandsFreeDictation}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${
                isDictating
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-accent-light text-accent hover:bg-accent hover:text-white'
              }`}
              title={isDictating ? 'Detener dictado' : 'Trabajo sin manos'}
            >
              {isDictating ? <FiMicOff className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
              {isDictating ? 'Detener' : 'Trabajo sin manos'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createNewNote}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm"
            >
              <FiPlus className="w-4 h-4" /> Nueva Nota
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                isDark
                  ? 'bg-[#1a2a3a] border border-[#223349] text-white'
                  : 'bg-gray-200 border border-gray-300 text-gray-800'
              }`}
            >
              <FiClock className="w-4 h-4" /> Historial ({notes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* History Panel */}
        {showHistory && (
          <div
            className={`w-64 border-r overflow-y-auto ${
              isDark
                ? 'bg-[#0d1726] border-[#223349]'
                : 'bg-white border-lab-border'
            }`}
          >
            <div className="p-4 space-y-2">
              {notes.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sin notas aún
                </p>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className={`relative w-full text-left p-3 pr-10 rounded-lg transition-colors cursor-pointer ${
                      currentNoteId === note.id
                        ? 'bg-blue-500 text-white'
                        : isDark
                          ? 'bg-[#1a2a3a] text-gray-200 hover:bg-[#2a3a4a]'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => selectNote(note)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        selectNote(note);
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteNotebookNote(note.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-md transition-colors ${
                        currentNoteId === note.id
                          ? 'bg-white/15 hover:bg-white/25 text-white'
                          : isDark
                            ? 'bg-[#223349] hover:bg-[#2a3d58] text-red-300'
                            : 'bg-white hover:bg-red-50 text-red-600'
                      }`}
                      title="Eliminar esta nota"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs truncate font-mono">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs truncate opacity-75">
                      {note.content.substring(0, 40)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Notepad Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-1 flex flex-col p-6 overflow-hidden ${isDark ? 'bg-[#0d1726]' : 'bg-white'}`}>
            <textarea
              ref={noteTextareaRef}
              value={noteContent}
              onChange={handleNoteChange}
              placeholder="Escribe tus notas del experimento aquí. Luego usa 'Analizar texto' para pedir sugerencias a la IA..."
              className={`flex-1 p-4 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-[#1a2a3a] border border-[#223349] text-white placeholder-gray-500'
                  : 'bg-gray-50 border border-lab-border text-gray-800 placeholder-gray-400'
              }`}
            />
            <div className="flex gap-2 mt-4 justify-end">
              {isGeneratingSuggestions && (
                <span className="text-xs text-blue-500 flex items-center gap-1">
                  <FiRefreshCw className="w-4 h-4 animate-spin" /> Analizando...
                </span>
              )}
              <button
                onClick={handleAnalyzeText}
                disabled={isGeneratingSuggestions || !noteContent.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <FiBookOpen className="w-4 h-4" /> Analizar texto
              </button>
              <button
                onClick={() => saveNote(noteContent)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm"
              >
                <FiSave className="w-4 h-4" /> Guardar Nota
              </button>
              <button
                onClick={downloadNoteAsPDF}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
              >
                <FiDownload className="w-4 h-4" /> Descargar
              </button>
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        <div
          className={`w-96 flex flex-col border-l overflow-hidden ${
            isDark
              ? 'bg-[#0d1726] border-[#223349]'
              : 'bg-white border-lab-border'
          }`}
        >
          {/* Chat Messages */}
          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-[#0d1726]' : 'bg-gray-50'}`}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-[#1a2a3a] text-white'
                        : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-3">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>

                      {/* Task Recommendations for Notebook */}
                      {generateTaskRecommendations(msg.content).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                          <TaskRecommendation recommendations={generateTaskRecommendations(msg.content)} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => insertAssistantTextIntoNotebook(msg.content)}
                        disabled={isExtractingInsertable}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                          isDark
                            ? 'bg-[#223349] text-blue-100 hover:bg-[#2a3d58]'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        } ${isExtractingInsertable ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {isExtractingInsertable ? 'Extrayendo...' : 'Escribir en notebook'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoadingChat && (
              <div className="flex justify-start">
                <div className={`${isDark ? 'bg-[#1a2a3a]' : 'bg-gray-200'} px-4 py-2 rounded-lg`}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendChat}
            className={`border-t p-4 ${isDark ? 'border-[#223349] bg-[#0d1726]' : 'border-lab-border bg-white'}`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Haz una pregunta..."
                className={`flex-1 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-[#1a2a3a] border border-[#223349] text-white placeholder-gray-500'
                    : 'bg-gray-50 border border-lab-border text-gray-800'
                }`}
              />
              <button
                type="submit"
                disabled={isLoadingChat || !chatInput.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1 text-sm"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
