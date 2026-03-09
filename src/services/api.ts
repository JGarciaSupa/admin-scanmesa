import axios from 'axios';
import config from '@/config';

// ============================================================================
// CONFIGURACIÓN DE AXIOS
// ============================================================================

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para enviar cookies (refresh token)
});

// ============================================================================
// INTERCEPTORES
// ============================================================================

/**
 * Interceptor de solicitudes - Agrega el token de acceso a cada petición
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas - Maneja errores 401 y refresco de token
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refrescar el token
        const { data } = await axios.post(
          `${config.apiUrl}/admin/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Guardar el nuevo token
        localStorage.setItem('accessToken', data.data.accessToken);

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpiar todo y redirigir al login
        // Solo limpiar si no estamos ya en la página de login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
