import { useState, useRef } from 'react';
import { FiDownload, FiEye, FiX, FiUploadCloud, FiFileText, FiImage } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';

interface ReportData {
  title: string;
  description: string;
  objectives: string[];
  protocolText: string;
  csvData: string;
  imageAnalysis: string;
  experimentDate: string;
  researcher: string;
}

export default function ReportGenerator() {
  const { projectName, projectId } = useProject();
  const [formData, setFormData] = useState<ReportData>({
    title: '',
    description: '',
    objectives: [],
    protocolText: '',
    csvData: '',
    imageAnalysis: '',
    experimentDate: new Date().toISOString().split('T')[0],
    researcher: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportPreview, setReportPreview] = useState<{ html: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ''],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'txt' || fileType === 'md') {
        setFormData((prev) => ({
          ...prev,
          protocolText: content,
        }));
      } else if (fileType === 'csv') {
        setFormData((prev) => ({
          ...prev,
          csvData: content,
        }));
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });

      // Aquí normalmente enviarías a Azure Vision
      // Por ahora, almacenamos el análisis de ejemplo
      setFormData((prev) => ({
        ...prev,
        imageAnalysis: `[Imagen cargada: ${file.name}] - Pendiente de análisis con Azure Vision`,
      }));
    } catch (err) {
      setError('Error al procesar la imagen');
    }
  };

  const handleGenerateReport = async () => {
    if (!formData.title.trim()) {
      setError('El título del reporte es obligatorio');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          protocolText: formData.protocolText,
          csvData: formData.csvData,
          imageAnalysis: formData.imageAnalysis,
          experimentDate: formData.experimentDate,
          researcher: formData.researcher,
          objectives: formData.objectives.filter((obj) => obj.trim().length > 0),
        }),
      });

      if (!response.ok) throw new Error('Error generando reporte');

      const data = await response.json();
      setReportPreview(data);
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportPreview) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/reports/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          protocolText: formData.protocolText,
          csvData: formData.csvData,
          imageAnalysis: formData.imageAnalysis,
          experimentDate: formData.experimentDate,
          researcher: formData.researcher,
          objectives: formData.objectives.filter((obj) => obj.trim().length > 0),
        }),
      });

      if (!response.ok) throw new Error('Error descargando PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${formData.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al descargar PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 page-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📄 Generador de Reportes IA
          </h1>
          <p className="text-gray-600">
            Crea reportes científicos profesionales con análisis automático de Azure AI
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-lab-border">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'form'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📝 Formulario
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            disabled={!reportPreview}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'preview'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-600 hover:text-gray-800 disabled:opacity-50'
            }`}
          >
            👁️ Vista Previa
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form Tab */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sección Izquierda: Datos Principales */}
            <div className="space-y-6">
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  ℹ️ Información del Experimento
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título del Reporte *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="Ej: Análisis de Estabilidad de Proteínas a Altas Temperaturas"
                      className="w-full px-4 py-2 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Breve descripción del experimento..."
                      rows={3}
                      className="w-full px-4 py-2 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Investigador
                      </label>
                      <input
                        type="text"
                        name="researcher"
                        value={formData.researcher}
                        onChange={handleFormChange}
                        placeholder="Tu nombre"
                        className="w-full px-4 py-2 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        name="experimentDate"
                        value={formData.experimentDate}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Objetivos
                    </label>
                    <div className="space-y-2">
                      {formData.objectives.map((obj, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={obj}
                            onChange={(e) => updateObjective(idx, e.target.value)}
                            placeholder={`Objetivo ${idx + 1}`}
                            className="flex-1 px-4 py-2 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50"
                          />
                          <button
                            onClick={() => removeObjective(idx)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addObjective}
                        className="w-full px-4 py-2 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent hover:text-white transition-colors"
                      >
                        + Agregar Objetivo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección Derecha: Cargas de Archivos */}
            <div className="space-y-6">
              {/* Protocolo */}
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiFileText className="w-5 h-5" /> Protocolo
                </h2>
                <textarea
                  name="protocolText"
                  value={formData.protocolText}
                  onChange={handleFormChange}
                  placeholder="Pega el protocolo del experimento aquí o carga un archivo .txt..."
                  rows={4}
                  className="w-full px-4 py-2 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50 resize-none font-mono text-sm"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 w-full px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FiUploadCloud className="w-4 h-4" /> Cargar Protocolo (.txt)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Datos */}
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📊 Datos (CSV)
                </h2>
                <textarea
                  name="csvData"
                  value={formData.csvData}
                  onChange={handleFormChange}
                  placeholder="Pega datos en formato CSV aquí..."
                  rows={4}
                  className="w-full px-4 py-2 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50 resize-none font-mono text-sm"
                />
              </div>

              {/* Imágenes */}
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiImage className="w-5 h-5" /> Análisis de Imágenes
                </h2>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full px-4 py-3 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FiUploadCloud className="w-4 h-4" /> Subir Imagen para Análisis
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {formData.imageAnalysis && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    ✅ {formData.imageAnalysis}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && reportPreview && (
          <div className="space-y-4">
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDownloadPDF}
                disabled={isLoading}
                className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dim disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <FiDownload className="w-5 h-5" /> Descargar PDF
              </button>
            </div>

            <div className="bg-white border border-lab-border rounded-xl overflow-hidden shadow-lg">
              <iframe
                srcDoc={reportPreview.html}
                className="w-full h-screen border-0"
                title="Report Preview"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {activeTab === 'form' && (
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading || !formData.title}
              className="px-8 py-3 bg-accent text-white rounded-lg font-bold text-lg hover:bg-accent-dim disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  Generando...
                </>
              ) : (
                <>
                  <FiEye className="w-5 h-5" /> Generar Reporte
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
