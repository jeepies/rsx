import {
  BarChart3,
  BookOpen,
  BookUser,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Grid3X3,
  Heart,
  HeartIcon,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { NavLink } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function DashboardSidebar() {
  const { t, i18n } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
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
            {collapsed && <span className="font-bold text-lg mr-2">X</span>}
            {!collapsed && <span className="font-bold text-lg">RSX</span>}
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

        {!collapsed && (
          <div className="px-4">
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">DASHBOARD</p>
          </div>
        )}
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
          <div className="px-4">
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
            <div className="px-4">
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

      <div className="border-t border-sidebar-border bg-gradient-to-r from-muted/20 to-muted/40 p-3">
        <TooltipProvider>
          {!collapsed ? (
            <div className="flex items-center justify-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                    onClick={() => window.open('https://discord.gg/', '_blank')}
                  >
                    <svg
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Join Discord</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/dashboard/changelog"
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                  >
                    <FileText className="h-4 w-4" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Changelog</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/dashboard/api-docs"
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                  >
                    <BookOpen className="h-4 w-4" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent>
                  <p>API Documentation</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                    onClick={() => { 
                    }}
                  >
                    <HeartIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Support the project</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                    onClick={() => window.open('https://discord.gg/your-server', '_blank')}
                  >
                    <svg
                      className="h-3.5 w-3.5 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Join Discord</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/changelog"
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Changelog</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/api-docs"
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent>
                  <p>API Documentation</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 rounded-md"
                    onClick={() => {
                      /* TODO: Implement donation */
                    }}
                  >
                    <HeartIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Support the project</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </TooltipProvider>
      </div>
    </Sidebar>
  );
}
