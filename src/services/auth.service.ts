import api from './api';

// ============================================================================
// TIPOS
// ============================================================================

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// ============================================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================================

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/admin/auth/login', credentials);
    return data;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    await api.post('/admin/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<ProfileResponse> {
    const { data } = await api.get<ProfileResponse>('/admin/profile');
    return data;
  },

  /**
   * Refrescar token (se maneja automáticamente en el interceptor)
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const { data } = await api.post('/admin/auth/refresh');
    return data.data;
  },
};

export default authService;
