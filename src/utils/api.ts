// Utilidad para manejar llamadas API con fallback automático
export async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.log('API call failed, using demo mode:', error);
    // Si hay error de conexión, el proxy ya devolvió mock data
    // Este catch es por si el proxy no está configurado
    return {
      analysis: "🎯 Sapient Lab AI en modo demostración",
      structured: { summary: "Conecta el backend en puerto 3000 para funcionalidad completa" },
      provider: "demo-mode",
      generatedAt: new Date().toISOString()
    };
  }
}