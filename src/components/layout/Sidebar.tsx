
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const { state, logout } = useAuth();
  const { user } = state;

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: "🏥",
      },
      {
        title: "Appointments",
        url: "/appointments",
        icon: "📅",
      },
    ];

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        {
          title: "Departments",
          url: "/departments",
          icon: "🏢",
        },
        {
          title: "Users",
          url: "/users",
          icon: "👥",
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
          title: "My Schedule",
          url: "/schedule",
          icon: "⏰",
        },
        {
          title: "Patients",
          url: "/patients",
          icon: "👤",
        },
      ];
    }

    if (user?.role === 'HELPDESK') {
      return [
        ...baseItems,
        {
          title: "Patient Registration",
          url: "/register-patient",
          icon: "📝",
        },
        {
          title: "Doctor Availability",
          url: "/availability",
          icon: "👨‍⚕️",
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">HealthCare</h2>
            <p className="text-sm text-gray-500">Management System</p>
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
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center space-x-3">
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

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="w-full">
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
