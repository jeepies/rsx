import { SidebarTrigger } from '~/components/ui/sidebar';
import ThemeToggle from './theme-toggle';

export default function DashboardTopbar() {
  return (
    <header className="h-16 border-b border-sidebar-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
