import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NewAppointmentDialog from '@/components/appointments/NewAppointmentDialog';
import AppointmentDetailDialog from '@/components/appointments/AppointmentDetailDialog';
import { Appointment } from '@/types/appointment';
import { appointmentsAPI, patientsAPI, departmentsAPI } from '@/services/api';
import dateUtils from '@/utils/dateUtils';

// Define the extended appointment interface for display
interface ExtendedAppointment extends Appointment {
  patientName: string;
  doctorName: string;
  department: string;
}

interface CalendarAppointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  time: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  date: string;
}

const Calendar = () => {
  const { state, hasRole } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchAppointmentsForDate(selectedDate);
  }, [selectedDate, viewMode]);

  const fetchAppointmentsForDate = async (date: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = dateUtils.toBackendFormat(date);

      // Get all appointments and filter by date
      const appointmentsData = await appointmentsAPI.getAll();
      const filteredAppointments = appointmentsData.filter(apt =>
        apt.appointmentDate.startsWith(formattedDate.split(' ')[0])
      );

      // Transform the data to include additional information
      const extendedAppointments: ExtendedAppointment[] = await Promise.all(
        filteredAppointments.map(async (apt) => {
          // Fetch patient and department details
          const patient = await patientsAPI.getById(apt.patientId);
          const department = await departmentsAPI.getById(apt.departmentId);

          return {
            ...apt,
            patientName: `${patient.firstName} ${patient.lastName}`,
            doctorName: apt.doctorName, // Use the doctorName directly from the appointment
            department: department.name
          };
        })
      );

      setAppointments(extendedAppointments);
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
    return appointments.find(apt => {
      const appointmentTime = dateUtils.formatDisplayTime(apt.appointmentDate);
      return appointmentTime === time;
    });
  };

  const handleAppointmentClick = (appointment: ExtendedAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailDialog(true);
  };

  const canCreateAppointment = () => {
    return hasRole('ADMIN') || hasRole('HELPDESK');
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const renderDayView = () => (
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
                className={`flex items-center p-3 border rounded-lg transition-colors cursor-pointer ${appointment
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                onClick={() => appointment && handleAppointmentClick(appointment)}
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
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-gray-400 italic">Available</p>
                    {canCreateAppointment() && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNewAppointmentDialog(true);
                        }}
                      >
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
  );

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);

    return (
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Week View</CardTitle>
          <CardDescription>
            {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            <div className="font-medium text-sm text-gray-600">Time</div>
            {weekDates.map((date, index) => (
              <div key={index} className="font-medium text-sm text-center">
                <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div>{date.getDate()}</div>
              </div>
            ))}

            {timeSlots.slice(0, 12).map((time) => (
              <React.Fragment key={time}>
                <div className="text-xs text-gray-500 py-2">{time}</div>
                {weekDates.map((date, dateIndex) => {
                  const dayAppointments = appointments.filter(apt => {
                    const appointmentDate = dateUtils.formatDisplayDate(apt.appointmentDate);
                    const appointmentTime = dateUtils.formatDisplayTime(apt.appointmentDate);
                    return appointmentDate === date.toLocaleDateString() && appointmentTime === time;
                  });
                  return (
                    <div key={dateIndex} className="min-h-[40px] border rounded p-1">
                      {dayAppointments.map(apt => (
                        <div
                          key={apt.id}
                          className="text-xs bg-blue-100 rounded p-1 cursor-pointer hover:bg-blue-200"
                          onClick={() => handleAppointmentClick(apt)}
                        >
                          {apt.patientName}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(selectedDate);

    return (
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <CardDescription>Monthly calendar view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-medium text-center text-sm text-gray-600 p-2">
                {day}
              </div>
            ))}

            {monthDates.map((date, index) => {
              const dayAppointments = appointments.filter(apt => {
                const appointmentDate = dateUtils.formatDisplayDate(apt.appointmentDate);
                return appointmentDate === date.toLocaleDateString();
              });

              return (
                <div
                  key={index}
                  className={`min-h-[100px] border rounded p-2 cursor-pointer hover:bg-gray-50 ${date.toDateString() === selectedDate.toDateString() ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="font-medium text-sm">{date.getDate()}</div>
                  <div className="space-y-1 mt-1">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div
                        key={apt.id}
                        className="text-xs bg-blue-100 rounded p-1 cursor-pointer hover:bg-blue-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(apt);
                        }}
                      >
                        {apt.patientName}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayAppointments.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderDayView();
    }
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
            {canCreateAppointment() && (
              <Button onClick={() => setShowNewAppointmentDialog(true)}>
                New Appointment
              </Button>
            )}
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

          {renderCurrentView()}
        </div>

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

        <NewAppointmentDialog
          open={showNewAppointmentDialog}
          onOpenChange={setShowNewAppointmentDialog}
          onAppointmentCreated={() => fetchAppointmentsForDate(selectedDate)}
        />

        <AppointmentDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          appointment={selectedAppointment}
          onAppointmentUpdated={() => fetchAppointmentsForDate(selectedDate)}
        />
      </div>
    </Layout>
  );
};

export default Calendar;
