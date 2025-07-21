import { MetaFunction, Outlet } from '@remix-run/react';
import DashboardSidebar from '~/components/sidebar';
import DashboardTopbar from '~/components/topbar';
import { SidebarProvider } from '~/components/ui/sidebar';
import { FavouritesProvider } from '~/~contexts/favourites';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { Toaster } from 'sonner';

export const meta: MetaFunction = () => [
  { title: 'RSX' },
  { name: 'description', content: 'Your comprehensive Runescape 3 tracking and toolkit service' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1' },
  { property: 'og:title', content: 'RSX' },
  {
    property: 'og:description',
    content: 'Your comprehensive Runescape 3 tracking and toolkit service',
  },
  { name: 'theme-color', content: '#a29bf4' },
  { property: 'og:type', content: 'website' },
  { property: 'og:image', content: 'https://rsx.lol/logo.png' },
  { property: 'og:url', content: 'https://rsx.lol' },
];
export default function DashboardLayout() {
  return (
    <>
      <I18nextProvider i18n={i18n}>
        <SidebarProvider>
          <FavouritesProvider>
            <div className="min-h-screen flex w-full bg-background">
              <DashboardSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <DashboardTopbar />
                <main className="flex-1 p-3 md:p-6 animate-fade-in overflow-auto relative">
                  <Outlet />
                  <Toaster theme="system" />
                </main>
              </div>
            </div>
          </FavouritesProvider>
        </SidebarProvider>
      </I18nextProvider>
    </>
  );
}
