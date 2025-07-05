import { SidebarTrigger } from '~/components/ui/sidebar';
import ThemeToggle from './theme-toggle';
import { Input } from './ui/input';
import { useNavigate } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Clock, Search, X } from 'lucide-react';
import { getRecentSearches, addRecentSearch, deleteRecentSearch } from '~/lib/recent-searches';

export default function DashboardTopbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (search?: string) => {
    const query = search ?? searchQuery.trim();
    if (!query) return;
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());
    setSearchQuery('');
    setShowRecentSearches(false);
    navigate(`/dashboard/player/${encodeURIComponent(query)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = (search: string) => {
    deleteRecentSearch(search);
    setRecentSearches(getRecentSearches());
  };

  return (
    <header className="relative z-50 h-16 border-b border-sidebar-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="relative" ref={wrapperRef}>
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search for a player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowRecentSearches(true)}
              className="w-96 pr-10 transition-smooth focus:w-[28rem]"
            />
            <Button size="sm" onClick={() => handleSearch()} className="absolute right-1 h-7 px-2">
              <Search className="h-3 w-3" />
            </Button>
          </div>

          {showRecentSearches && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto">
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-2 py-2 hover:bg-muted rounded-sm group"
                  >
                    <span
                      className="text-sm flex-1 cursor-pointer"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(search);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
