
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CalendarAppointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  time: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

const Calendar = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchAppointmentsForDate(selectedDate);
  }, [selectedDate]);

  const fetchAppointmentsForDate = async (date: Date) => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockAppointments: CalendarAppointment[] = [
        {
          id: 1,
          patientName: 'John Doe',
          doctorName: 'Dr. Sarah Johnson',
          department: 'Cardiology',
          time: '09:00',
          status: 'SCHEDULED',
          notes: 'Regular checkup'
        },
        {
          id: 2,
          patientName: 'Mary Smith',
          doctorName: 'Dr. Michael Chen',
          department: 'Neurology',
          time: '10:30',
          status: 'IN_PROGRESS',
          notes: 'Follow-up consultation'
        },
        {
          id: 3,
          patientName: 'Robert Johnson',
          doctorName: 'Dr. Emily Rodriguez',
          department: 'Pediatrics',
          time: '14:00',
          status: 'SCHEDULED',
          notes: 'Vaccination appointment'
        },
        {
          id: 4,
          patientName: 'Lisa Wilson',
          doctorName: 'Dr. Robert Kim',
          department: 'Emergency',
          time: '16:15',
          status: 'COMPLETED',
          notes: 'Emergency consultation'
        }
      ];
      
      // Filter appointments based on selected date if needed
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
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

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  const getAppointmentForTimeSlot = (time: string) => {
    return appointments.find(apt => apt.time === time);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">View and manage appointments by date</p>
          </div>
          <div className="flex items-center gap-2">
            {['day', 'week', 'month'].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode as 'day' | 'week' | 'month')}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Picker */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>Choose a date to view appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border pointer-events-auto"
              />
              
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium">Legend</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-xs">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs">Cancelled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day View */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
              <CardDescription>
                {appointments.length} appointments scheduled for this day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeSlots.map((timeSlot) => {
                  const appointment = getAppointmentForTimeSlot(timeSlot);
                  return (
                    <div
                      key={timeSlot}
                      className={`flex items-center p-3 border rounded-lg transition-colors ${
                        appointment 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-20 text-sm font-medium text-gray-600">
                        {timeSlot}
                      </div>
                      
                      {appointment ? (
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600">
                              {appointment.doctorName} • {appointment.department}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-between">
                          <p className="text-gray-400 italic">Available</p>
                          {(user?.role === 'ADMIN' || user?.role === 'HELPDESK') && (
                            <Button size="sm" variant="outline">
                              Book Appointment
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <span className="text-2xl">📅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">For selected date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(apt => apt.status === 'COMPLETED').length}
              </div>
              <p className="text-xs text-muted-foreground">Finished appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <span className="text-2xl">⏰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(apt => apt.status === 'SCHEDULED').length}
              </div>
              <p className="text-xs text-muted-foreground">Still scheduled</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
