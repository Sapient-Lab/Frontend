import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (projectId) {
      fetchProjectContext();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId || !e.target.files) return;

    try {
      setUploading(true);
      const filesArray = Array.from(e.target.files);
      const formData = new FormData();
      filesArray.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/project-context/${projectId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir documentos');
      
      // Agregar archivos a Material Reciente
      const recentFiles = filesArray.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size
      }));
      
      const savedFiles = localStorage.getItem('sapientlab_recent_files');
      const existingFiles = savedFiles ? JSON.parse(savedFiles) : [];
      const allFiles = [...existingFiles, ...recentFiles];
      // Limitar a los últimos 20 archivos
      const limitedFiles = allFiles.slice(-20);
      localStorage.setItem('sapientlab_recent_files', JSON.stringify(limitedFiles));
      console.log('✅ Documentos guardados en Material Reciente desde DocsLibrary:', limitedFiles);
      
      // Recargar contexto
      await fetchProjectContext();
      e.target.value = ''; // Reset input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir documentos');
    } finally {
      setUploading(false);
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Subir documentos a la biblioteca:</label>
          <input 
            type="file"
            multiple
            disabled={uploading}
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">Soporta: PDF, TXT, DOCX, CSV, etc.</p>
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
