import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  FiSave,
  FiDownload,
  FiClock,
  FiSend,
  FiPlus,
  FiRefreshCw,
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

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

export default function IntelligentLabNotebook() {
  const { isDark } = useTheme();
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
  const [experimentId] = useState<number>(1); // TODO: Get from context or URL params

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hola. Soy tu asistente de laboratorio inteligente. Mientras escribes tus notas, analizaré el contenido y te daré sugerencias científicas. ¿Sobre qué experimento trabajas hoy?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

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
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Auto-trigger suggestions with debounce (saves to backend every 3s of inactivity)
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setNoteContent(content);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer - save and get suggestions after 3 seconds of inactivity
    debounceTimerRef.current = setTimeout(() => {
      saveNote(content);
      if (currentNoteId) {
        generateSuggestions(currentNoteId);
      }
    }, 3000);
  };

  const saveNote = async (content: string) => {
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
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
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
    return `## 🔬 Análisis Automático de tu Nota

### ✓ Validación
${sugg.validation}

### ❓ Preguntas de Seguimiento
${sugg.followUpQuestions.map(q => `- ${q}`).join('\n')}

### 📋 Estándares Relacionados
${sugg.relatedStandards.map(s => `- ${s}`).join('\n')}

${sugg.safetyWarnings.length > 0 ? `### ⚠️ Advertencias de Seguridad\n${sugg.safetyWarnings.map(w => `- 🔴 ${w}`).join('\n')}` : ''}`;
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
      // TODO: Implement backend chat endpoint or use existing aiService
      // For now, show a placeholder response
      const responseText = await generateChatResponse(noteContent);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: responseText },
      ] as ChatMessage[]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error al procesar tu mensaje. Por favor intenta de nuevo.',
        },
      ] as ChatMessage[]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const generateChatResponse = async (_noteContext: string): Promise<string> => {
    // TODO: Call backend endpoint or aiService
    // For MVP, return contextual response based on note
    const responses = [
      '¿Podrías describir con más detalle ese paso del experimento?',
      'Interesante observación. ¿Fue controlada la temperatura durante esto?',
      'Te recomiendo documentar también las condiciones ambientales.',
      '¿Comparaste estos resultados con experimentos anteriores?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              📝 Lab Notebook Inteligente
            </h1>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Experimento #{experimentId}
            </span>
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
                  <button
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentNoteId === note.id
                        ? 'bg-blue-500 text-white'
                        : isDark
                          ? 'bg-[#1a2a3a] text-gray-200 hover:bg-[#2a3a4a]'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <p className="text-xs truncate font-mono">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs truncate opacity-75">
                      {note.content.substring(0, 40)}...
                    </p>
                  </button>
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
              placeholder="Escribe tus notas del experimento aquí. La IA analizará automáticamente tu contenido y te dará sugerencias..."
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
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
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
