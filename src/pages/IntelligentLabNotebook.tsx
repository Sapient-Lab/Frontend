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
  title: string;
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
  const [experimentId] = useState<number>(1);
  const [isDictating, setIsDictating] = useState(false);

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
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [noteTitle, setNoteTitle] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    loadNotes();
  }, [experimentId]);

  const loadNotes = async () => {
    try {
      const userId = localStorage.getItem('sapientlab_user_id');
      const url = userId
        ? `/api/experiment-notes/by-experiment/${experimentId}?user_id=${userId}`
        : `/api/experiment-notes/by-experiment/${experimentId}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data) ? data : [];
        setNotes(normalized.map((n: any) => ({
          id: n.id,
          experimentId: n.experiment_id,
          userId: n.user_id,
          title: n.title ?? '',
          content: n.content,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        })));
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
      const plainText = normalizeNotebookText(content);
      if (!plainText) return;
      appendNoteContent(plainText);
    } finally {
      setIsExtractingInsertable(false);
    }
  };

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

  const deriveTitle = (content: string): string => {
    const firstLine = content.split('\n').find(l => l.trim()) ?? '';
    return firstLine.substring(0, 100) || `Nota del ${new Date().toLocaleDateString()}`;
  };

  const mapNoteResponse = (n: any): Note => ({
    id: n.id,
    experimentId: n.experiment_id,
    userId: n.user_id,
    title: n.title ?? '',
    content: n.content,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  });

  const saveNote = async (content: string): Promise<number | null> => {
    const userId = parseInt(localStorage.getItem('sapientlab_user_id') ?? '1', 10);
    const title = noteTitle.trim() || deriveTitle(content);

    try {
      if (currentNoteId) {
        const response = await fetch(`/api/experiment-notes/${currentNoteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        if (response.ok) {
          const updated = mapNoteResponse(await response.json());
          setNoteTitle(updated.title);
          setNotes(prev => prev.map(n => (n.id === currentNoteId ? updated : n)));
          return currentNoteId;
        }
        const err = await response.json().catch(() => null);
        console.error('Error al actualizar nota:', response.status, err);
        return null;
      } else {
        const response = await fetch('/api/experiment-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experiment_id: experimentId,
            user_id: userId,
            title,
            content,
          }),
        });
        if (response.ok) {
          const newNote = mapNoteResponse(await response.json());
          setNotes(prev => [newNote, ...prev]);
          setCurrentNoteId(newNote.id);
          setNoteTitle(newNote.title);
          return newNote.id;
        }
        const err = await response.json().catch(() => null);
        console.error('Error al crear nota:', response.status, err);
        return null;
      }
    } catch (error) {
      console.error('Error saving note:', error);
      return null;
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || isSaving) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const savedId = await saveNote(noteContent);
      if (savedId !== null) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
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

    if (lowerMsg.includes('próximo paso') || lowerMsg.includes('siguiente') || 
        lowerMsg.includes('debería') || lowerMsg.includes('recomienda') ||
        lowerMsg.includes('sugiero') || lowerMsg.includes('hacer')) {
      recommendations.push({
        title: 'Executar Acciones Recomendadas',
        description: 'Completa las acciones sugeridas por el asistente inteligente del laboratorio.',
        aiAssigner: 'Asistente del Notebook',
      });
    }

    if (lowerMsg.includes('validar') || lowerMsg.includes('verificar') || 
        lowerMsg.includes('confirmar') || lowerMsg.includes('comprobar')) {
      recommendations.push({
        title: 'Validar Datos Experimentales',
        description: 'Verifica que los datos y parámetros del experimento sean correctos.',
        aiAssigner: 'Asistente del Notebook',
      });
    }

    if (lowerMsg.includes('pregunta') || lowerMsg.includes('considera') || 
        lowerMsg.includes('piensa en') || lowerMsg.includes('análisis')) {
      recommendations.push({
        title: 'Responder Preguntas de Seguimiento',
        description: 'El IA sugiere responder las preguntas para profundizar el análisis.',
        aiAssigner: 'Asistente del Notebook',
      });
    }

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
    setNoteTitle('');
    setCurrentNoteId(null);
    setSaveStatus('idle');
    setMessages([messages[0]]);
  };

  const selectNote = (note: Note) => {
    setNoteContent(note.content);
    setNoteTitle(note.title);
    setCurrentNoteId(note.id);
    setSaveStatus('idle');
    setShowHistory(false);
    setMessages([messages[0]]);
  };

  const downloadNoteAsPDF = () => {
    const element = document.createElement('a');
    const file = new Blob([noteContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `nota-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`h-full w-full overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020]`}>
      
      {/* Header con estilo científico */}
      <div className="px-6 py-4 border-b border-accent/20 bg-[#0f1624]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
              <FiBookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
                Lab Notebook Inteligente
              </h1>
              <p className="text-[10px] font-mono text-accent tracking-wider">SISTEMA DE REGISTRO CIENTÍFICO</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent">
              Experimento #{experimentId}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startHandsFreeDictation}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all duration-300 ${
                isDictating
                  ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                  : 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20'
              }`}
              title={isDictating ? 'Detener dictado' : 'Trabajo sin manos'}
            >
              {isDictating ? <FiMicOff className="w-3 h-3" /> : <FiMic className="w-3 h-3" />}
              {isDictating ? 'Detener' : 'Trabajo sin manos'}
            </button>
            <button
              onClick={createNewNote}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent to-purple-600 text-white hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 flex items-center gap-2 text-xs font-mono"
            >
              <FiPlus className="w-3 h-3" /> Nueva Nota
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono transition-all duration-300 ${
                showHistory
                  ? 'bg-accent/20 border border-accent/50 text-accent'
                  : 'bg-accent/10 border border-accent/30 text-slate-400 hover:bg-accent/20'
              }`}
            >
              <FiClock className="w-3 h-3" /> Historial ({notes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* History Panel */}
        {showHistory && (
          <div className="w-64 border-r border-accent/20 overflow-y-auto bg-[#0f1624]/60 backdrop-blur-sm">
            <div className="p-3 space-y-2">
              <h3 className="text-[10px] font-mono text-accent uppercase tracking-wider px-2 mb-3">NOTAS ANTERIORES</h3>
              {notes.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono text-center py-4">Sin notas aún</p>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className={`relative w-full text-left p-3 pr-10 rounded-lg transition-all duration-300 cursor-pointer ${
                      currentNoteId === note.id
                        ? 'bg-gradient-to-r from-accent to-purple-600 text-white shadow-lg'
                        : 'bg-accent/5 border border-accent/20 hover:border-accent/50 text-slate-300'
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
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                      }`}
                      title="Eliminar esta nota"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                    <p className="text-[10px] font-mono truncate opacity-70">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs truncate mt-1">
                      {note.title || note.content.substring(0, 40)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Notepad Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                placeholder={`Título de la nota (Experimento #${experimentId})...`}
                className="flex-1 px-4 py-2 bg-[#0a0f1c] border border-accent/20 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-slate-200 placeholder:text-slate-600 transition-all"
              />
              {currentNoteId && (
                <span className="text-[10px] font-mono text-slate-500 bg-accent/5 border border-accent/20 px-2 py-1 rounded whitespace-nowrap">ID #{currentNoteId}</span>
              )}
            </div>
            <textarea
              ref={noteTextareaRef}
              value={noteContent}
              onChange={handleNoteChange}
              placeholder="Escribe tus notas del experimento aquí. Luego usa 'Analizar texto' para pedir sugerencias a la IA..."
              className="flex-1 p-4 rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-[#0a0f1c] border border-accent/20 text-slate-200 placeholder:text-slate-600 transition-all duration-300"
            />
            <div className="flex gap-2 mt-4 justify-end">
              {isGeneratingSuggestions && (
                <span className="text-xs text-accent flex items-center gap-1">
                  <FiRefreshCw className="w-3 h-3 animate-spin" /> Analizando...
                </span>
              )}
              <button
                onClick={handleAnalyzeText}
                disabled={isGeneratingSuggestions || !noteContent.trim()}
                className="px-4 py-2 bg-gradient-to-r from-accent to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 flex items-center gap-2 text-xs font-mono transition-all duration-300"
              >
                <FiBookOpen className="w-3 h-3" /> Analizar texto
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isSaving || !noteContent.trim()}
                className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 text-xs font-mono transition-all duration-300 disabled:opacity-50 ${
                  saveStatus === 'saved'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/30'
                    : saveStatus === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-500/30'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30'
                }`}
              >
                {isSaving ? (
                  <><FiRefreshCw className="w-3 h-3 animate-spin" /> Guardando...</>
                ) : saveStatus === 'saved' ? (
                  <><FiSave className="w-3 h-3" /> ¡Guardado!</>
                ) : saveStatus === 'error' ? (
                  <><FiSave className="w-3 h-3" /> Error al guardar</>
                ) : (
                  <><FiSave className="w-3 h-3" /> Guardar Nota</>
                )}
              </button>
              <button
                onClick={downloadNoteAsPDF}
                className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:shadow-lg flex items-center gap-2 text-xs font-mono transition-all duration-300"
              >
                <FiDownload className="w-3 h-3" /> Descargar
              </button>
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        <div className="w-96 flex flex-col border-l border-accent/20 overflow-hidden bg-[#0f1624]/80 backdrop-blur-sm">
          {/* Chat Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-accent to-purple-600 text-white'
                      : 'bg-accent/10 border border-accent/20 text-slate-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-3 text-sm">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>

                      {generateTaskRecommendations(msg.content).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-accent/20">
                          <TaskRecommendation recommendations={generateTaskRecommendations(msg.content)} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => insertAssistantTextIntoNotebook(msg.content)}
                        disabled={isExtractingInsertable}
                        className={`text-[10px] font-mono font-medium px-3 py-1.5 rounded-lg transition-all duration-300 ${
                          isExtractingInsertable
                            ? 'bg-accent/10 text-slate-500 cursor-not-allowed'
                            : 'bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30'
                        }`}
                      >
                        {isExtractingInsertable ? 'Extrayendo...' : '📝 Escribir en notebook'}
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
                <div className="bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendChat}
            className="border-t border-accent/20 p-4 bg-[#0f1624]/60"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Haz una pregunta..."
                className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-[#0a0f1c] border border-accent/20 text-slate-200 placeholder:text-slate-600 transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isLoadingChat || !chatInput.trim()}
                className="px-3 py-2 bg-gradient-to-r from-accent to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 flex items-center gap-1 text-sm transition-all duration-300"
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