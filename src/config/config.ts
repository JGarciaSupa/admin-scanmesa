// ============================================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================================================

const config = {
  apiUrl: 'backend-mesascan.lobitoconsulting.com',
  storageKeys: {
    accessToken: 'accessToken',
    user: 'user',
  },
  auth: {
    tokenType: 'Bearer',
  },
  name: 'Mesa Scan',
  logo: '/logo.png',
  version: '1.0.0'
} as const;

export default config;
