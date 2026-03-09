import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const getPageTitle = (pathname: string): string => {
  
  if (pathname === "/dashboard") return "Panel de Control";
  if (pathname === "/dashboard/restaurant") return "Gestión de Restaurantes";
  if (pathname.startsWith("/dashboard/restaurant/")) return "Detalles del Restaurante";
  if (pathname === "/dashboard/profile") return "Mi Perfil";
  return "Dashboard";
};

export function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="font-medium">{user?.name || user?.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}