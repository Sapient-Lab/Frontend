/**
 * authService.ts
 * 
 * Este servicio manejará la autenticación con el backend.
 * Por ahora está en modo "MOCK" (simulado) hasta que el equipo de backend 
 * construya los endpoints especificados en backend-reqs-auth.md.
 */

// Tipos de datos para las peticiones
export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id?: number;
    name: string;
    email: string;
  };
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const authService = {
  /**
   * Iniciar Sesión REAL
   * Conectado al futuro endpoint de Backend
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        // En caso de que el backend no exista aún o haya error en credenciales
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error de autenticación. Verifica tus datos o si el backend está listo.');
      }
      
      const data = await response.json();
      return {
        success: true,
        token: data.access_token || data.token,
        user: {
          id: data.user?.id,
          name: data.user?.name || 'Usuario',
          email: payload.email
        }
      };
    } catch (error: any) {
      console.warn("Fallo el login real al backend, asegúrate de que el endpoint /api/auth/login exista en tu backend NestJS.");
      throw error;
    }
  },

  /**
   * Crear cuenta (Registro) REAL
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al crear la cuenta. Intenta de nuevo.');
      }
      
      const data = await response.json();
      return {
        success: true,
        token: data.access_token || data.token,
        user: {
          id: data.user?.id,
          name: payload.name,
          email: payload.email
        }
      };
    } catch (error: any) {
      console.warn("Falló el registro hacia el servidor, asegúrate de que /api/auth/register exista.");
      throw error;
    }
  },

  /**
   * Recuperar Contraseña
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error('No se pudo enviar el correo de recuperación.');
      }
      
      return { success: true, message: 'Si el correo existe, te hemos enviado un enlace.' };
    } catch (error: any) {
      // Dejamos un MOCK temporal en caso de que este endpoint secundario no lo hagan aún
      await new Promise((res) => setTimeout(res, 1000));
      return { success: true, message: '[Simulado] Enlace de recuperación enviado a tu correo.' };
    }
  }
};
