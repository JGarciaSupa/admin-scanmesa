import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores';

// ============================================================================
// COMPONENTE DE RUTA PROTEGIDA
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}
