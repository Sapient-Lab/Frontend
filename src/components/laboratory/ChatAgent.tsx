import { useState, useRef, useEffect } from 'react';
import { aiService, type ChatMessage } from '../../services/aiService';

export default function ChatAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hola. Soy tu Agente IA alojado en Mistral/DeepSeek. ¿En qué te puedo ayudar con el código hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Llamada real al backend NestJS a través de nuestro proxy de Vite
      const response = await aiService.sendMessage(userMessage);

      // Aqui dependemos de cómo responda tu backend, asumimos un response.answer o response.text
      // Si el backend devuelve un string directo, pones response
      const answer = response.answer || response.text || response.content || JSON.stringify(response);

      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error al conectar con el backend. ¿Seguro que el servidor NestJS está corriendo en el puerto 3000?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir archivo a Base64 para el vision
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result?.toString().replace(/^data:image\/[a-z]+;base64,/, '');
      if (base64String) {
        setMessages(prev => [...prev, { role: 'user', content: '[🖼️ Imagen adjuntada]' }]);
        setIsLoading(true);
        try {
          // Llama al endpoint de visión
          const response = await aiService.analyzeImage(base64String, "Revisa esta imagen del laboratorio y detecta anomalías o peligros.");
          const answerText = response.structured?.narrativeSummary || response.rawModelResponse || JSON.stringify(response);
          setMessages(prev => [...prev, { role: 'assistant', content: answerText }]);
        } catch (error: any) {
           setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error al procesar la imagen: ' + error.message}]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#fbfbfb]">
      {/* Zona de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-br-none' 
                  : 'bg-white border border-lab-border text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1 border-b border-gray-100 pb-1 w-fit">
                  <span className="text-[10px] uppercase font-bold text-accent">Agente IA</span>
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-lab-border text-gray-400 p-3 rounded-lg rounded-bl-none text-sm flex gap-1 items-center shadow-sm">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-lab-border flex gap-2 items-center">
        <label className="cursor-pointer text-gray-500 hover:text-accent p-2 rounded hover:bg-gray-50 transition-colors" title="Subir Imagen">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Habla a la IA o sube una foto de tu código/experimento..."
          className="flex-1 bg-lab-bg text-sm px-3 py-2 rounded-full border border-lab-border focus:outline-none focus:border-accent"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-dim disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}