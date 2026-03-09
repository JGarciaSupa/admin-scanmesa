// ============================================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================================================

const config = {
  /**
   * URL base de la API
   */
  apiUrl: 'http://localhost:3000',

  /**
   * Clave para almacenar el token en localStorage
   */
  storageKeys: {
    accessToken: 'accessToken',
    user: 'user',
  },

  /**
   * Configuración de tokens
   */
  auth: {
    tokenType: 'Bearer',
  },
} as const;

export default config;
