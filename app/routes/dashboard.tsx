import { Outlet } from '@remix-run/react';
import DashboardSidebar from '~/components/sidebar';
import DashboardTopbar from '~/components/topbar';
import { SidebarProvider } from '~/components/ui/sidebar';
import { FavouritesProvider } from '~/contexts/favourites';

export default function DashboardLayout() {
  return (
    <>
      <SidebarProvider>
        <FavouritesProvider>
          <div className="min-h-screen flex w-full bg-background">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <DashboardTopbar />
              <main className="flex-1 p-3 md:p-6 animate-fade-in overflow-auto relative">
                <Outlet />
              </main>
            </div>
          </div>
        </FavouritesProvider>
      </SidebarProvider>
    </>
  );
}
