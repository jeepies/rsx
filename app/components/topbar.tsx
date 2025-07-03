import { SidebarTrigger } from "~/components/ui/sidebar";

export default function DashboardTopbar() {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>
    </header>
  );
}
