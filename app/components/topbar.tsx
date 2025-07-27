import { SidebarTrigger } from '~/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import ThemeToggle from './theme-toggle';
import { Input } from './ui/input';
import { useNavigate } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Clock, Ghost, Search, Star, StarOff, User, X } from 'lucide-react';
import { getRecentSearches, addRecentSearch, deleteRecentSearch } from '~/lib/recent-searches';
import { useTranslation } from 'react-i18next';
import { useFavourites } from '~/~contexts/favourites';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function DashboardTopbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { favourites, removeFavourite } = useFavourites();

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

  const handleFavouritesClicked = (RSN: string) => navigate(`/dashboard/player/${RSN}`);

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
              placeholder={t('topbar.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={handleKeyPress}
              onFocus={() => setShowRecentSearches(true)}
              className="w-96 pr-14 transition-smooth focus:w-[28rem]"
            />
            <Button size="sm" onClick={() => handleSearch()} className="absolute right-1 h-7 px-2">
              <Search className="h-1 w-1" />
            </Button>
          </div>

          {showRecentSearches && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto">
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3 w-3" />
                  {t('topbar.recent_searches')}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="transition-smooth">
              <Star className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center gap-2">
              {t('topbar.favourites')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {favourites.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Ghost className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('topbar.no_favourites')}</p>
                <p className="text-sm text-muted-foreground">{t('topbar.no_favourites_message')}</p>
              </div>
            ) : (
              favourites.map((favourite) => (
                <DropdownMenuItem
                  key={favourite}
                  className="flex items-center justify-between p-3 cursor-pointer group"
                  onClick={() => handleFavouritesClicked(favourite)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-4 w-4 rounded-full flex items-center justify-center text-sm font-bold">
                      <AvatarImage
                        src={`https://secure.runescape.com/m=avatar-rs/${favourite}/chat.png`}
                        alt={`${favourite}'s avatar`}
                      />
                      <AvatarFallback className="w-16 h-16 sm:w-20 sm:h-20 bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                        {favourite.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{favourite}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavourite(favourite);
                    }}
                  >
                    <StarOff className="h-3 w-3 text-muted" />
                  </Button>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  );
}
