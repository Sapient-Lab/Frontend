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
    name: string;
    email: string;
  };
}

// Simulador de retardo de red (eliminar cuando haya API real)
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  /**
   * Iniciar Sesión
   * TODO: Conectar a POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    // ---- MOCK ACTUAL ----
    await delay(1500); // Simulamos 1.5s de carga
    
    // Simulamos validación simple
    if (payload.email === 'error@test.com') {
      throw new Error('Credenciales inválidas');
    }

    return {
      success: true,
      token: 'fake-jwt-token-12345',
      user: {
        name: 'Usuario Demo',
        email: payload.email
      }
    };

    /* ---- CÓDIGO REAL A FUTURO ----
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('Error de autenticación');
    }
    return response.json();
    --------------------------------*/
  },

  /**
   * Crear cuenta (Registro)
   * TODO: Conectar a POST /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    // ---- MOCK ACTUAL ----
    await delay(1500);
    
    return {
      success: true,
      token: 'fake-jwt-token-67890',
      user: {
        name: payload.name,
        email: payload.email
      }
    };

    /* ---- CÓDIGO REAL A FUTURO ----
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('Error al registrar usuario');
    }
    return response.json();
    --------------------------------*/
  },

  /**
   * Solicitar recuperación de contraseña
   * TODO: Conectar a POST /api/auth/forgot-password
   */
  async forgotPassword(_email: string): Promise<{ success: boolean; message: string }> {
    // ---- MOCK ACTUAL ----
    await delay(1000);
    return {
      success: true,
      message: 'Si el correo existe, recibirás un enlace de recuperación.'
    };

    /* ---- CÓDIGO REAL A FUTURO ----
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) throw new Error('Error al solicitar recuperación');
    return response.json();
    --------------------------------*/
  }
};
