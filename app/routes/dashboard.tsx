import { Outlet } from '@remix-run/react';
import DashboardSidebar from '~/components/sidebar';
import { SidebarProvider } from '~/components/ui/sidebar';

export default function DashboardLayout() {
  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {/* there will be a topbar here at some point */}
            <main className="flex-1 p-3 md:p-6 animate-fade-in overflow-auto relative">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
