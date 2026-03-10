import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router";

const getPageTitle = (pathname: string): string => {
  
  if (pathname === "/dashboard") return "Panel de Control";
  if (pathname === "/dashboard/restaurant") return "Gestión de Restaurantes";
  if (pathname.startsWith("/dashboard/restaurant/")) return "Detalles del Restaurante";
  if (pathname === "/dashboard/profile") return "Mi Perfil";
  return "Dashboard";
};

export function DashboardHeader() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
    </header>
  );
}