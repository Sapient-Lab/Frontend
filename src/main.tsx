import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

declare global {
  interface Window {
    __SAPIENTLAB_API_URL__?: string;
  }
}

const runtimeApiUrl = window.__SAPIENTLAB_API_URL__?.trim() ?? '';
const envApiUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_TARGET || '').trim();
const normalizedApiBaseUrl = (runtimeApiUrl || envApiUrl).replace(/\/+$/, '');

if (import.meta.env.PROD && !normalizedApiBaseUrl) {
  console.error(
    '[API CONFIG] VITE_API_URL no esta definido en build. En Azure Static Web Apps, /api/* quedara en el dominio del frontend y puede responder 404/405.',
  );
}

// Interceptor para redireccionar todas las llamadas /api al backend configurado
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;

  if (typeof resource === 'string' && resource.startsWith('/api/') && normalizedApiBaseUrl) {
    resource = `${normalizedApiBaseUrl}${resource}`;
  }

  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
