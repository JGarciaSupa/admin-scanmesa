import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores";
import { useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link } from "react-router";
import authService from "@/services/auth.service";

export default function DashboardUser() {
  const { user } = useAuthStore();

  const initials = useMemo(() => {
    if (!user) return "";
    const names = user.name.split(" ");
    if (names.length < 2) {
      return user.name.slice(0, 2).toUpperCase();
    }
    return (names[0][0] + names[1][0]).toUpperCase();
  }, [user]);

  const handleLogout = () => {
    authService.logout().then(() => {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-full flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">
              {user?.name || "Juan Doe"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email || "admin@ejemplo.com"}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-60 px-2 py-3" side="right" align="end">
        <div className="w-full flex flex-col gap-3">
          <div className="w-full">
            <div className="w-full flex items-center gap-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">
                  {user?.name || "Juan Doe"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email || "admin@ejemplo.com"}
                </span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="xs">
              <Link to="/dashboard/profile" className="w-full flex gap-2">
                <User />
                Ver perfil
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              size="xs"
              onClick={handleLogout}
            >
              <LogOut />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
