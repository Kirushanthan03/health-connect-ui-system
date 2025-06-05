import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { appointmentsAPI, departmentsAPI } from '@/services/api';

const Reports = () => {
  const { state, hasRole } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentsByDepartment, setAppointmentsByDepartment] = useState([]);
  const [appointmentStatusData, setAppointmentStatusData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);

      // Fetch all appointments
      const appointments = await appointmentsAPI.getAll();

      // Fetch departments
      const departments = await departmentsAPI.getAll();

      // Calculate department statistics
      const deptStats = await Promise.all(
        departments.map(async (dept) => {
          const deptAppointments = appointments.filter(app => app.departmentId === dept.id);
          return {
            name: dept.name,
            appointments: deptAppointments.length,
            revenue: deptAppointments.reduce((sum, app) => sum + (app.fee || 0), 0)
          };
        })
      );
      setAppointmentsByDepartment(deptStats);

      // Calculate appointment status data
      const statusStats = [
        { name: 'Scheduled', value: appointments.filter(app => app.status === 'SCHEDULED').length, color: '#1976d2' },
        { name: 'Completed', value: appointments.filter(app => app.status === 'COMPLETED').length, color: '#4caf50' },
        { name: 'Cancelled', value: appointments.filter(app => app.status === 'CANCELLED').length, color: '#f44336' },
        { name: 'In Progress', value: appointments.filter(app => app.status === 'IN_PROGRESS').length, color: '#ff9800' }
      ];
      setAppointmentStatusData(statusStats);

      // Calculate monthly trends
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      const trends = await Promise.all(
        months.map(async (month) => {
          const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
          const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

          const monthAppointments = appointments.filter(app => {
            const appDate = new Date(app.appointmentDate);
            return appDate >= monthStart && appDate <= monthEnd;
          });

          const uniquePatients = new Set(monthAppointments.map(app => app.patientId));

          return {
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            appointments: monthAppointments.length,
            patients: uniquePatients.size
          };
        })
      );
      setMonthlyTrends(trends);

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const doctorPerformance = [
    { name: 'Dr. Sarah Johnson', appointments: 89, rating: 4.8, department: 'Cardiology' },
    { name: 'Dr. Michael Chen', appointments: 76, rating: 4.7, department: 'Neurology' },
    { name: 'Dr. Emily Rodriguez', appointments: 94, rating: 4.9, department: 'Pediatrics' },
    { name: 'Dr. Robert Kim', appointments: 112, rating: 4.6, department: 'Emergency' },
    { name: 'Dr. Lisa Wang', appointments: 67, rating: 4.8, department: 'Orthopedics' },
  ];

  if (!hasRole('ADMIN') && !hasRole('DOCTOR')) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to view reports.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const chartConfig = {
    appointments: {
      label: "Appointments",
      color: "#1976d2",
    },
    revenue: {
      label: "Revenue",
      color: "#4caf50",
    },
    patients: {
      label: "Patients",
      color: "#ff9800",
    },
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Hospital performance insights and statistics</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button>Export PDF</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <span className="text-2xl">📅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">608</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">324</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$309K</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <span className="text-2xl">⭐</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7/5</div>
              <p className="text-xs text-muted-foreground">+0.2 from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments by Department</CardTitle>
              <CardDescription>Monthly appointment distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
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
              <CardTitle>Appointment Status Distribution</CardTitle>
              <CardDescription>Current status of all appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
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

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Appointments and patient trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="appointments" stroke="var(--color-appointments)" strokeWidth={2} />
                    <Line type="monotone" dataKey="patients" stroke="var(--color-patients)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doctor Performance</CardTitle>
              <CardDescription>Top performing doctors by appointments and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorPerformance.map((doctor, index) => (
                  <div key={doctor.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-gray-600">{doctor.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{doctor.appointments} appointments</p>
                      <p className="text-sm text-gray-600">⭐ {doctor.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Table */}
        {hasRole('ADMIN') && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Department</CardTitle>
              <CardDescription>Detailed revenue breakdown for administrative review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Department</th>
                      <th className="text-right p-3">Appointments</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">Avg per Appointment</th>
                      <th className="text-right p-3">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsByDepartment.map((dept) => (
                      <tr key={dept.name} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{dept.name}</td>
                        <td className="p-3 text-right">{dept.appointments}</td>
                        <td className="p-3 text-right">${dept.revenue.toLocaleString()}</td>
                        <td className="p-3 text-right">${Math.round(dept.revenue / dept.appointments)}</td>
                        <td className="p-3 text-right text-green-600">+{Math.floor(Math.random() * 20 + 5)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
