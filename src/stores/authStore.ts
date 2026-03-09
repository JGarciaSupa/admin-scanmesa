import { create } from 'zustand';
import { authService, type User } from '@/services/auth.service';
import config from '@/config';

// ============================================================================
// TIPOS
// ============================================================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initAuth: () => Promise<void>;
  setError: (error: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

// ============================================================================
// STORE DE AUTENTICACIÓN
// ============================================================================

export const useAuthStore = create<AuthStore>((set) => ({
  // Estado inicial
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Inicializar autenticación al cargar la app
  initAuth: async () => {
    const storedUser = localStorage.getItem(config.storageKeys.user);
    const token = localStorage.getItem(config.storageKeys.accessToken);

    if (storedUser && token) {
      try {
        // Verificar que el token siga siendo válido
        const response = await authService.getProfile();
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        localStorage.setItem(config.storageKeys.user, JSON.stringify(response.data.user));
      } catch (error: any) {
        // Solo limpiar la sesión si el error es de autenticación (401)
        const isAuthError = error.response?.status === 401;
        
        if (isAuthError) {
          // Token inválido o expirado, limpiar sesión
          localStorage.removeItem(config.storageKeys.user);
          localStorage.removeItem(config.storageKeys.accessToken);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } else {
          // Otro tipo de error (404, 500, etc), mantener la sesión pero marcar como no cargando
          // Esto evita que errores del servidor o rutas mal configuradas cierren la sesión
          console.error('Error al verificar la sesión:', error.response?.status, error.message);
          set({
            isLoading: false,
            error: 'Error al verificar la sesión, pero se mantiene autenticado',
          });
        }
      }
    } else {
      set({ isLoading: false });
    }
  },

  // Iniciar sesión
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });

      // Guardar token y usuario
      localStorage.setItem(config.storageKeys.accessToken, response.data.accessToken);
      localStorage.setItem(config.storageKeys.user, JSON.stringify(response.data.user));

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem(config.storageKeys.accessToken);
      localStorage.removeItem(config.storageKeys.user);
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // Actualizar información del usuario
  refreshUser: async () => {
    try {
      const response = await authService.getProfile();
      set({
        user: response.data.user,
      });
      localStorage.setItem(config.storageKeys.user, JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  },

  // Establecer error
  setError: (error: string | null) => {
    set({ error });
  },
}));

// ============================================================================
// SELECTORES
// ============================================================================

/**
 * Hook para obtener el usuario actual
 */
export const useUser = () => useAuthStore((state) => state.user);

/**
 * Hook para saber si está autenticado
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Hook para saber si está cargando
 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

/**
 * Hook para obtener errores de autenticación
 */
export const useAuthError = () => useAuthStore((state) => state.error);
