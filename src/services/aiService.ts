export type BaseAiRequest = {
  // Provider removido ya que el backend lo gestiona dinámicamente con LLMProviderService
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type NotebookCellContext = {
  id?: string;
  cellType?: 'markdown' | 'code' | 'raw';
  language?: string;
  source?: string;
  sourceLines?: string[];
};

export type NotebookChatPayload = {
  message?: string;
  messages?: ChatMessage[];
  objective?: string;
  preferConcise?: boolean;
  projectId?: number;
  notebook: {
    notebookId?: string;
    notebookTitle?: string;
    activeCellNumber?: number;
    cells: NotebookCellContext[];
  };
};

export type NotebookExtractMode = 'auto' | 'protocol' | 'checklist' | 'recipe' | 'code' | 'summary';

export type NotebookExtractPayload = {
  assistantMessage: string;
  userPrompt?: string;
  mode?: NotebookExtractMode;
  preserveFormatting?: boolean;
  maxItems?: number;
};

export type NotebookExtractResponse = {
  insertableText: string;
  includedSections?: string[];
  removedFragments?: string[];
  confidence?: number;
  usedHeuristicFallback?: boolean;
  rawModelResponse?: string;
};

export const aiService = {
  async parseError(response: Response, fallbackMessage: string) {
    try {
      const data = await response.json();
      const message = data?.message;
      if (Array.isArray(message)) {
        return message.join(' | ');
      }
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    } catch {
      // noop
    }

    return `${fallbackMessage} (HTTP ${response.status})`;
  },

  /**
   * Obtiene el estado de los proveedores IA disponibles
   */
  async checkStatus() {
    const response = await fetch('/api/ai/providers/status');
    if (!response.ok) throw new Error('Error al conectar con el backend de IA');
    return response.json();
  },

  /**
   * Envía un mensaje al endpoint conversacional del backend
   */
  async sendMessage(
    message: string,
    messages?: ChatMessage[],
    provider?: 'azure' | 'mistral' | 'deepseek',
    projectId?: number,
    fallbackSystemPrompt?: string,
  ) {
    const response = await fetch('/api/ai/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message, 
        messages, 
        provider,
        projectId,
        fallbackSystemPrompt,
      }), 
    });

    if (!response.ok) {
      const detailed = await this.parseError(response, 'Error en el chat de IA');
      throw new Error(detailed);
    }
    return response.json();
  },

  /**
   * Chat especial con contexto del notebook (celdas + celda activa)
   */
  async notebookChat(payload: NotebookChatPayload) {
    const response = await fetch('/api/ai/notebook/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detailed = await this.parseError(response, 'Error en notebook chat de IA');
      throw new Error(detailed);
    }
    return response.json();
  },

  /**
   * Extrae solo la parte insertable de una respuesta del chat para pegarla en el notebook.
   */
  async extractNotebookInsertable(payload: NotebookExtractPayload): Promise<NotebookExtractResponse> {
    const response = await fetch('/api/ai/notebook/extract-insertable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detailed = await this.parseError(response, 'Error al extraer contenido insertable del notebook');
      throw new Error(detailed);
    }

    return response.json();
  },

  /**
   * Sube documentos del proyecto para dar contexto a la IA (Embeddings / Memoria)
   */
  async uploadProjectDocuments(files: File[], projectId?: string) {
    if (!files || files.length === 0) {
      return { success: true, documents: [] };
    }

    if (!projectId) {
      projectId = localStorage.getItem('sapientlab_project_id') || '';
    }

    if (!projectId) {
      throw new Error('Project ID not found');
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`/api/project-context/${projectId}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await this.parseError(response, 'Error al subir documentos del proyecto');
      throw new Error(error);
    }

    return response.json();
  },

  /**
   * Chat específico de código con Copilot AI
   */
  async copilotChat(message: string, language: string = 'typescript') {
    const projectId = localStorage.getItem('sapientlab_project_id');
    const response = await fetch('/api/ai/copilot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message, 
        language,
        projectId: projectId ? parseInt(projectId, 10) : undefined,
      }), 
    });

    if (!response.ok) throw new Error('Error en Copilot Chat');
    return response.json();
  },

  /**
   * Completado de código estilo Copilot
   */
  async getCopilotCompletion(instruction: string, prefix: string, suffix: string) {
    const response = await fetch('/api/ai/copilot/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'typescript',
        prefix,
        suffix,
        instruction,
        maxSuggestions: 1
      }),
    });

    if (!response.ok) throw new Error('Error en copilot completions');
    return response.json();
  },

  /**
   * Análisis de datos (CSV o texto plano)
   */
  async analyzeResults(payload: string, format: 'text' | 'csv' = 'csv') {
    const response = await fetch('/api/ai/results/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, format })
    });
    if (!response.ok) throw new Error('Error al analizar los resultados');
    return response.json();
  },

  /**
   * Visión Artificial para imágenes del laboratorio.
   * Modo 3 — File local → multipart/form-data { image, prompt }
   * Modo 2 — data URL base64  → JSON { base64Image, prompt }
   * Modo 1 — URL pública      → JSON { imageUrl, prompt }
   */
  async analyzeImage(imageData: string | File, prompt?: string) {
    // Modo 3: archivo local como multipart/form-data
    if (imageData instanceof File) {
      const formData = new FormData();
      formData.append('image', imageData);
      if (prompt) formData.append('prompt', prompt);
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Error al analizar la imagen');
      return response.json();
    }

    // Modo 2: data URL base64
    if (imageData.startsWith('data:')) {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: imageData, prompt }),
      });
      if (!response.ok) throw new Error('Error al analizar la imagen');
      return response.json();
    }

    // Modo 1: URL pública
    const response = await fetch('/api/ai/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: imageData, prompt }),
    });
    if (!response.ok) throw new Error('Error al analizar la imagen');
    return response.json();
  },

  /**
   * Asistente para explicar código o diagnosticar errores
   */
  async explainCode(code: string, question?: string, filePath?: string) {
    const response = await fetch('/api/ai/copilot/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, question, filePath, language: 'typescript' })
    });
    if (!response.ok) throw new Error('Error al explicar el código');
    return response.json();
  },

  /**
   * Convierte texto a voz usando Azure Speech
   */
  async textToSpeech(text: string) {
    const response = await fetch('/api/ai/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error('Error al generar voz');
    const data = await response.json();
    return data.audioBase64; // Base64 encoded audio
  },

  /**
   * Transcribe audio a texto usando Azure Speech
   */
  async speechToText(audioBlob: Blob) {
    const formData = new FormData();
    const mimeType = audioBlob.type || 'audio/webm';
    const extension = mimeType.includes('wav')
      ? 'wav'
      : mimeType.includes('mp4')
      ? 'm4a'
      : mimeType.includes('ogg')
      ? 'ogg'
      : 'webm';

    formData.append('audio', audioBlob, `audio.${extension}`);
    
    const response = await fetch('/api/ai/speech-to-text', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Error al transcribir audio');
    const data = await response.json();
    return data.text;
  },

  /**
   * Escáner de protocolos de seguridad
   */
  async interpretProtocol(protocolText: string) {
    const response = await fetch('/api/ai/protocol/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocolText, riskLevel: 'medium' })
    });
    if (!response.ok) throw new Error('Error al escanear el protocolo');
    return response.json();
  },

  /**
   * Chat sobre documentos: Analiza documentos usando IA conversacional
   */
  async documentChat(query: string, documentNames: string[] = []) {
    const localProjectId = localStorage.getItem('sapientlab_project_id');
    const projectId = localProjectId ? parseInt(localProjectId, 10) : undefined;
    const fallbackSystemPrompt = [
      'Eres un asistente de investigación científica especializado en análisis documental.',
      'Responde en español usando primero la evidencia del contexto del proyecto y del contenido recuperado de documentos.',
      'No afirmes que no tienes acceso al archivo si en el contexto ya se proporcionó contenido documental.',
      'Si la evidencia no alcanza para responder con precisión, indica explícitamente qué dato o sección falta.',
      'No inventes resultados ni detalles técnicos no sustentados.',
      `Documentos cargados por el usuario: ${documentNames.join(', ') || 'No especificados'}.`,
    ].join(' ');

    try {
      const response = await this.sendMessage(
        query,
        [],
        undefined,
        Number.isNaN(projectId as number) ? undefined : projectId,
        fallbackSystemPrompt,
      );
      // Extract the actual response text from the wrapper
      const responseText = response?.rawModelResponse || response?.text || response?.message || JSON.stringify(response);
      
      // Format the response
      if (!responseText) return 'Sin información disponible.';
      
      let formatted = responseText
        .trim()
        // Normalize paragraph spacing
        .split('\n\n')
        .filter((p: string) => p.trim().length > 0)
        .join('\n\n');
      
      return formatted;
    } catch (error) {
      console.error('Error en documentChat:', error);
      throw error;
    }
  }
};