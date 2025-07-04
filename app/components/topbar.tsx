import { SidebarTrigger } from '~/components/ui/sidebar';
import ThemeToggle from './theme-toggle';
import { Input } from './ui/input';
import { useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

export default function DashboardTopbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/dashboard/player/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="h-16 border-b border-sidebar-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search for a player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-96 pr-10 transition-smooth focus:w-[28rem]"
          />
          <Button size="sm" onClick={handleSearch} className="absolute right-1 h-7 px-2">
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
