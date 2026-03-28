import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';

interface ProjectDocument {
  id?: number;
  documentName: string;
  documentPath: string;
  documentType: string;
  fileSizeBytes?: number;
  uploadedByUserId?: number;
  createdAt?: Date;
}

interface ProjectContextInfo {
  projectId: number;
  projectName: string;
  owner: string;
  workingOn: string | null;
  goal: string | null;
  documents: ProjectDocument[];
}

export default function DocsLibrary() {
  const { projectId } = useProject();
  const [context, setContext] = useState<ProjectContextInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectId) {
      console.log('🔍 DocsLibrary: Loading documents for project:', projectId);
      fetchProjectContext();
    } else {
      console.warn('⚠️ DocsLibrary: No projectId available');
      setContext(null);
      setError('No hay proyecto seleccionado');
    }
  }, [projectId]);

  const fetchProjectContext = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/project-context/${projectId}`);
      if (!response.ok) throw new Error('Error al cargar el contexto del proyecto');
      const data = await response.json();
      setContext(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
    if (!projectId) {
      setError('No hay proyecto seleccionado');
      return;
    }

    const files = Array.isArray(e) ? e : (e.target.files ? Array.from(e.target.files) : []);
    
    if (files.length === 0) return;

    // Validar tipos de archivo permitidos
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validFiles = files.filter(f => {
      const isValid = allowedTypes.includes(f.type) || 
                     f.name.endsWith('.pdf') || 
                     f.name.endsWith('.doc') || 
                     f.name.endsWith('.docx') || 
                     f.name.endsWith('.txt');
      if (!isValid) {
        console.warn(`⚠️ Archivo rechazado: ${f.name} (${f.type})`);
      }
      return isValid;
    });

    if (validFiles.length === 0) {
      setError('No hay archivos válidos. Soportamos: PDF, DOCX, DOC, TXT');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      console.log(`🚀 Subiendo ${validFiles.length} archivo(s)...`);
      const response = await fetch(`/api/project-context/${projectId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir documentos');
      
      console.log(`✅ ${validFiles.length} archivo(s) subido(s) exitosamente`);
      
      // Recargar contexto
      await fetchProjectContext();
      
      // Limpiar input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al subir documentos';
      setError(errorMsg);
      console.error('❌ Error:', errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log('📁 Archivos detectados en dropzone:', e.dataTransfer.files.length);
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleDeleteDocument = async (docId: number | undefined) => {
    if (!projectId || !docId) return;

    try {
      const response = await fetch(`/api/project-context/${projectId}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar documento');
      
      // Recargar contexto
      await fetchProjectContext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar documento');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Biblioteca de Documentos</h2>
        
        {context && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">En qué está trabajando:</h3>
              <p className="text-gray-700 text-sm">{context.workingOn || 'No especificado'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Objetivo:</h3>
              <p className="text-gray-700 text-sm">{context.goal || 'No especificado'}</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Agregar documentos a la biblioteca:</label>
          
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 mb-3 ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`text-4xl mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}>
              📄
            </div>
            <p className={`font-semibold ${isDragging ? 'text-blue-600' : 'text-gray-700'}`}>
              {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
            </p>
            <p className="text-xs text-gray-500 mt-1">o haz clic para seleccionar</p>
            <p className="text-xs text-gray-400 mt-2">Soporta: PDF, DOCX, DOC, TXT</p>
          </div>

          {/* File Input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileUpload}
            disabled={uploading}
          />

          {/* Upload Status */}
          {uploading && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm">
              Subiendo documentos...
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm mb-4">
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Cargando documentos...</div>
        </div>
      ) : context?.documents && context.documents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Documento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tamaño</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {context.documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-medium truncate">{doc.documentName}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{doc.documentType}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{formatFileSize(doc.fileSizeBytes)}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No hay documentos cargados aún.</p>
          <p className="text-xs text-gray-400 mt-2">Sube documentos para que las IAs puedan acceder a ellos como referencia.</p>
        </div>
      )}
    </div>
  );
}
