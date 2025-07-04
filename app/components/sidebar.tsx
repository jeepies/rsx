import { BarChart3, BookUser, Globe, Home, ListTodo } from 'lucide-react';
import { useState } from 'react';
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
import { NavLink } from '@remix-run/react';

const mainNavItems = [
  { title: 'Home', url: '/dashboard/index', icon: Home },
  { title: 'Players', url: '/dashboard/players', icon: BookUser },
  { title: 'Leaderboards', url: '/dashboard/leaderboards', icon: BarChart3 },
];

export default function DashboardSidebar() {
  const { state } = useSidebar();
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const collapsed = state === 'collapsed';

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
    <Sidebar>
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
                  {selectedLanguage}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedLanguage("EN")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLanguage("ES")}>
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLanguage("FR")}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedLanguage("DE")}>
                  Deutsch
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
