import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewAppointmentDialog from '@/components/appointments/NewAppointmentDialog';

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

const Appointments = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentsAPI.getAll();
      setAppointments(data);
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

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, newStatus);
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
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

  const canUpdateStatus = (status: string) => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'DOCTOR') {
      return ['SCHEDULED', 'IN_PROGRESS'].includes(status);
    }
    if (user?.role === 'HELPDESK') {
      return ['SCHEDULED'].includes(status);
    }
    return false;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600">Manage and track appointments</p>
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'HELPDESK') && (
            <Button onClick={() => setShowNewAppointmentDialog(true)}>
              New Appointment
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Appointments</CardTitle>
            <CardDescription>Search and filter appointments by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by patient, doctor, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-lg">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">
                            Dr. {appointment.doctorName} • {appointment.department}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{appointment.date}</p>
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        {canUpdateStatus(appointment.status) && (
                          <div className="flex gap-1">
                            {appointment.status === 'SCHEDULED' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(appointment.id, 'IN_PROGRESS')}
                                >
                                  Start
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.status === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <NewAppointmentDialog
          open={showNewAppointmentDialog}
          onOpenChange={setShowNewAppointmentDialog}
          onAppointmentCreated={fetchAppointments}
        />
      </div>
    </Layout>
  );
};

export default Appointments;
