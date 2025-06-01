
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const { state, logout } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: "🏠",
      },
      {
        title: "Appointments",
        url: "/appointments",
        icon: "📅",
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: "🗓️",
      },
    ];

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        {
          title: "Patients",
          url: "/patients",
          icon: "👥",
        },
        {
          title: "Users",
          url: "/users",
          icon: "👤",
        },
        {
          title: "Departments",
          url: "/departments",
          icon: "🏥",
        },
        {
          title: "Reports",
          url: "/reports",
          icon: "📊",
        },
      ];
    }

    if (user?.role === 'DOCTOR') {
      return [
        ...baseItems,
        {
          title: "My Patients",
          url: "/patients",
          icon: "👥",
        },
        {
          title: "Reports",
          url: "/reports",
          icon: "📊",
        },
      ];
    }

    if (user?.role === 'HELPDESK') {
      return [
        ...baseItems,
        {
          title: "Patients",
          url: "/patients",
          icon: "👥",
        },
        {
          title: "Departments",
          url: "/departments",
          icon: "🏥",
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">H</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Hospital</h2>
            <p className="text-sm text-gray-600">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <a 
                      href={item.url}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.url);
                      }}
                      className="flex items-center space-x-3"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
