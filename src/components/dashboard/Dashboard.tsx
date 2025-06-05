import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { appointmentsAPI, departmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

const Dashboard = () => {
  const { state, hasRole } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0,
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch appointments
      const appointmentsData = await appointmentsAPI.getAll();
      setAppointments(appointmentsData.slice(0, 5)); // Show only recent 5

      // Calculate stats
      const total = appointmentsData.length;
      const scheduled = appointmentsData.filter(app => app.status === 'SCHEDULED').length;
      const completed = appointmentsData.filter(app => app.status === 'COMPLETED').length;
      const cancelled = appointmentsData.filter(app => app.status === 'CANCELLED').length;
      const inProgress = appointmentsData.filter(app => app.status === 'IN_PROGRESS').length;

      setStats({ total, scheduled, completed, cancelled, inProgress });

      // Fetch department statistics
      const departments = await departmentsAPI.getAll();
      const departmentStats = await Promise.all(
        departments.map(async (dept) => {
          const deptAppointments = appointmentsData.filter(app => app.departmentId === dept.id);
          return {
            name: dept.name,
            value: deptAppointments.length,
            color: dept.color || '#1976d2'
          };
        })
      );
      setDepartmentData(departmentStats);

      // Calculate weekly data
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const weeklyStats = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dayAppointments = appointmentsData.filter(app => {
          const appDate = new Date(app.appointmentDate);
          return appDate.toDateString() === date.toDateString();
        });

        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          appointments: dayAppointments.length
        };
      });
      setWeeklyData(weeklyStats);

      // Calculate status data
      const statusStats = [
        { name: 'Scheduled', value: scheduled, color: '#1976d2' },
        { name: 'Completed', value: completed, color: '#4caf50' },
        { name: 'In Progress', value: inProgress, color: '#ff9800' },
        { name: 'Cancelled', value: cancelled, color: '#f44336' }
      ];
      setStatusData(statusStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'default';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'COMPLETED':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getRoleSpecificGreeting = () => {
    if (hasRole('ADMIN')) {
      return 'Admin Dashboard Overview';
    } else if (hasRole('DOCTOR')) {
      return `Welcome Dr. ${user?.username}`;
    } else if (hasRole('HELPDESK')) {
      return 'Help Desk Dashboard';
    }
    return 'Hospital Management Dashboard';
  };

  const chartConfig = {
    appointments: {
      label: "Appointments",
      color: "#1976d2",
    },
    value: {
      label: "Value",
      color: "#4caf50",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getRoleSpecificGreeting()}</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/appointments')}>
            View All Appointments
          </Button>
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            Calendar View
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <span className="text-2xl">⏰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <span className="text-2xl">🔄</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <span className="text-2xl">❌</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
            <CardDescription>Appointment distribution by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="appointments" fill="var(--color-appointments)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Department</CardTitle>
            <CardDescription>Appointments by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>Current appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest appointments in the system</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/appointments')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No appointments found</p>
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-gray-600">
                          Dr. {appointment.doctorName} • {appointment.department}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.date}</p>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Admin */}
      {hasRole('ADMIN') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/users')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>👤</span>
                User Management
              </CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/departments')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🏥</span>
                Departments
              </CardTitle>
              <CardDescription>Manage hospital departments</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/reports')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span>
                Reports & Analytics
              </CardTitle>
              <CardDescription>View detailed reports and analytics</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
