import {
  BarChart3,
  BookUser,
  ChevronDown,
  ChevronUp,
  Globe,
  Grid3X3,
  Heart,
  Home,
  ListTodo,
  Target,
  Trophy,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { NavLink, useNavigate } from '@remix-run/react';
import { Card, CardContent } from './ui/card';
import { useFavourites } from '~/~contexts/favourites';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function DashboardSidebar() {
  const { t, i18n } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { favourites } = useFavourites();
  const [competitionsOpen, setCompetitionsOpen] = useState(false);

  const mainNavItems = [
    { title: t('sidebar.home'), url: '/dashboard/index', icon: Home },
    { title: t('sidebar.players'), url: '/dashboard/players', icon: BookUser },
    { title: t('sidebar.clans'), url: '/dashboard/clans', icon: Users },
    { title: t('sidebar.leaderboards'), url: '/dashboard/leaderboards', icon: BarChart3 },
  ];

  const competitionNavItems = [
    {
      title: t('sidebar.xp_competition'),
      url: '/dashboard/competitions/xp',
      icon: Target,
    },
    {
      title: t('sidebar.bingo'),
      url: '/dashboard/competitions/bingo',
      icon: Grid3X3,
    },
  ];

  const toolNavItems = [
    {
      title: t('sidebar.session'),
      url: '/dashboard/session',
      icon: Zap,
    },
    {
      title: t('sidebar.tasks'),
      url: '/dashboard/tasks',
      icon: ListTodo,
    },
    {
      title: t('sidebar.bosses'),
      url: '/dashboard/bosses',
      icon: Target,
    },
  ];

  const handleFavouritesRedirect = (RSN: string) => navigate(`/dashboard/player/${RSN}`);

  const NavItem = ({ item, isSubItem = false }: { item: any; isSubItem?: boolean }) => {
    const IconComponent =
      typeof item.icon === 'string'
        ? item.icon === 'list-todo'
          ? ListTodo
          : item.icon
        : item.icon;

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            className={`transition-smooth hover:bg-muted/50 ${isSubItem ? 'pl-8' : ''}`}
            style={() => ({
              backgroundColor: 'transparent',
              color: 'inherit',
            })}
          >
            <IconComponent className="mr-2 h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <div className="h-16 px-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            {!collapsed && <span className="font-bold text-lg">Nexus</span>}
          </div>
          {!collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Globe className="h-3 w-3 mr-1" />
                  {t('code')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage('es')}>
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setCompetitionsOpen(!competitionsOpen)}
                  className="w-full justify-between hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex items-center">
                    <Trophy className="mr-4 h-4 w-4" />
                    {!collapsed && <span>{t('sidebar.competitions')}</span>}
                  </div>
                  {!collapsed && competitionsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </SidebarMenuButton>
                {competitionsOpen && !collapsed && (
                  <div className="mt-1 space-y-1 ml-0">
                    {competitionNavItems.map((item) => (
                      <NavItem key={item.title} item={item} isSubItem />
                    ))}
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="px-4 py-2">
            <div className="border-t border-sidebar-border"></div>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">Tools</p>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolNavItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && process.env.NODE_ENV === 'development' && (
          <>
            <div className="px-4 py-2">
              <div className="border-t border-sidebar-border"></div>
              <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                DEVELOPMENT
              </p>
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={'/dashboard/development'}
                        className={`transition-smooth hover:bg-muted/50`}
                        style={() => ({
                          backgroundColor: 'transparent',
                          color: 'inherit',
                        })}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Development</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <div className="mt-auto p-4 space-y-4">
        {!collapsed && (
          <>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t('sidebar.favourites')}</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {favourites.length === 0 ? (
                    <>No favourites yet</>
                  ) : (
                    favourites.map((f) => (
                      <div
                        className="flex justify-between cursor-pointer hover:text-primary transition"
                        onClick={() => handleFavouritesRedirect(f)}
                      >
                        <span>{f}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Sidebar>
  );
}
