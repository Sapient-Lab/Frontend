import { useState, useRef } from 'react';
import {
  FiUploadCloud,
  FiFileText,
  FiImage,
  FiDownload,
  FiAlertTriangle,
  FiCheckCircle,
  FiCheckSquare,
} from 'react-icons/fi';

interface Hazard {
  id: string;
  name: string;
  category: 'chemical' | 'biological' | 'physical' | 'ergonomic' | 'electrical';
  level: 'high' | 'medium' | 'low';
  description: string;
  oshaStandard?: string;
  isoStandard?: string;
  recommendation: string;
  mitigationSteps: string[];
}

interface SafetyAnalysisResult {
  protocol: string;
  analysisDate: string;
  hazards: Hazard[];
  riskMatrix: Record<string, any>;
  complianceStatus: 'compliant' | 'non_compliant' | 'needs_review';
  safetyScore: number;
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  recommendations: string[];
  documentAnalysis?: string;
  visualAnalysis?: string;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'high':
      return 'bg-red-50 border-red-300 text-red-900';
    case 'medium':
      return 'bg-yellow-50 border-yellow-300 text-yellow-900';
    case 'low':
      return 'bg-green-50 border-green-300 text-green-900';
    default:
      return 'bg-gray-50 border-gray-300 text-gray-900';
  }
};

const getLevelBadgeColor = (level: string) => {
  switch (level) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getComplianceColor = (status: string) => {
  switch (status) {
    case 'compliant':
      return 'text-green-600';
    case 'non_compliant':
      return 'text-red-600';
    case 'needs_review':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

export default function SafetyAnalyzer() {
  const [formData, setFormData] = useState({
    protocolText: '',
  });

  const [result, setResult] = useState<SafetyAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // For now, we'll just log that a PDF was uploaded
        // In production, this would be sent to backend for analysis
        console.log('PDF uploaded:', file.name);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Image uploaded:', file.name);
    }
  };

  const handleAnalyzeSafety = async () => {
    if (!formData.protocolText.trim()) {
      setError('Se requiere el texto del protocolo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/safety/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolText: formData.protocolText,
        }),
      });

      if (!response.ok) throw new Error('Error en análisis de seguridad');

      const data = await response.json();
      setResult(data.data);
      setActiveTab('results');
    } catch (err: any) {
      setError(err.message || 'Error al analizar seguridad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 page-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiAlertTriangle className="w-8 h-8 text-red-600" /> Analizador de Riesgos
            de Laboratorio
          </h1>
          <p className="text-gray-600">
            Análisis automático de seguridad según estándares OSHA e ISO
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-lab-border">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'form'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiFileText className="w-4 h-4" /> Análisis
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!result}
            className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'results'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-600 hover:text-gray-800 disabled:opacity-50'
            }`}
          >
            <FiCheckCircle className="w-4 h-4" /> Resultados
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form Tab */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            {/* Protocol Input */}
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiFileText className="w-5 h-5" /> Protocolo del Experimento
              </h2>
              <textarea
                name="protocolText"
                value={formData.protocolText}
                onChange={handleFormChange}
                placeholder="Pega el protocolo completo aquí o cargaun archivo PDF..."
                rows={6}
                className="w-full px-4 py-3 border border-lab-border rounded-lg focus:outline-none focus:border-accent bg-gray-50 resize-none font-mono text-sm"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <FiUploadCloud className="w-4 h-4" /> Cargar PDF
                </button>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Laboratory Image */}
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiImage className="w-5 h-5" /> Foto del Laboratorio
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                Sube una imagen del laboratorio para análisis visual de riesgos
              </p>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full px-4 py-3 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
              >
                <FiUploadCloud className="w-4 h-4" /> Subir Imagen
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Action Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleAnalyzeSafety}
                disabled={isLoading || !formData.protocolText}
                className="px-8 py-3 bg-accent text-white rounded-lg font-bold text-lg hover:bg-accent-dim disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    Analizando...
                  </>
                ) : (
                  <>
                    <FiAlertTriangle className="w-5 h-5" /> Analizar Riesgos
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Safety Score */}
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">
                    {Math.round(result.safetyScore)}
                  </div>
                  <p className="text-gray-600 text-sm">Puntuación de Seguridad</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{
                        width: `${result.safetyScore}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Risk Level */}
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    result.overallRiskLevel === 'critical' ? 'text-red-600' :
                    result.overallRiskLevel === 'high' ? 'text-red-500' :
                    result.overallRiskLevel === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {result.overallRiskLevel.toUpperCase()}
                  </div>
                  <p className="text-gray-600 text-sm">Nivel de Riesgo General</p>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
                <div className="text-center">
                  <div className={`text-xl font-bold mb-2 ${getComplianceColor(result.complianceStatus)}`}>
                    {result.complianceStatus === 'compliant'
                      ? '✓ CONFORME'
                      : result.complianceStatus === 'non_compliant'
                        ? '✗ NO CONFORME'
                        : '⚠ A REVISAR'}
                  </div>
                  <p className="text-gray-600 text-sm">Estado de Cumplimiento</p>
                </div>
              </div>
            </div>

            {/* Hazards List */}
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5" /> Riesgos Identificados ({result.hazards.length})
              </h2>
              <div className="space-y-3">
                {result.hazards.map((hazard) => (
                  <div
                    key={hazard.id}
                    className={`border-2 rounded-lg p-4 ${getLevelColor(hazard.level)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{hazard.name}</h3>
                        <p className="text-sm opacity-90 mb-2">{hazard.description}</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(
                              hazard.level,
                            )}`}
                          >
                            {hazard.level.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {hazard.category.toUpperCase()}
                          </span>
                        </div>
                        {hazard.oshaStandard && (
                          <p className="text-xs opacity-80">
                            <strong>OSHA:</strong> {hazard.oshaStandard}
                          </p>
                        )}
                        {hazard.isoStandard && (
                          <p className="text-xs opacity-80">
                            <strong>ISO:</strong> {hazard.isoStandard}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-current opacity-50">
                      <p className="text-sm font-semibold mb-1">
                        <strong>Recomendación:</strong> {hazard.recommendation}
                      </p>
                      {hazard.mitigationSteps.length > 0 && (
                        <ul className="text-xs mt-2 space-y-1">
                          {hazard.mitigationSteps.map((step, idx) => (
                            <li key={idx} className="flex gap-2">
                              <FiCheckSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5" /> Recomendaciones
              </h2>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <FiCheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download Report Button */}
            <div className="flex justify-end">
              <button className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-dim transition-colors flex items-center gap-2">
                <FiDownload className="w-5 h-5" /> Descargar Reporte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
