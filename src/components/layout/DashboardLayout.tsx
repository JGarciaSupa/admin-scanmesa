import { Outlet } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardLayout() {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <TooltipProvider delayDuration={0}>
        <AppSidebar />
        <main className="flex flex-1 flex-col h-screen overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="w-full max-w-7xl mx-auto p-4">
              <Outlet />
            </div>
          </div>
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
