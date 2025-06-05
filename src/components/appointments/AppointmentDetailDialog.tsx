import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI } from '@/services/api';
import dateUtils from '@/utils/dateUtils';

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
  reason: string;
  notes?: string;
  patientName: string;
  doctorName: string;
  department: string;
}

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onAppointmentUpdated: () => void;
}

const AppointmentDetailDialog: React.FC<AppointmentDetailDialogProps> = ({
  open,
  onOpenChange,
  appointment,
  onAppointmentUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string>('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const { toast } = useToast();
  const { state, hasRole } = useAuth();
  const { user } = state;

  React.useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
      setStatus(appointment.status);
      setCancelReason('');
      setRescheduleDate(undefined);
      setRescheduleTime('');
    }
  }, [appointment]);

  if (!appointment) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'default';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'COMPLETED':
        return 'outline';
      case 'CANCELLED':
      case 'NOSHOW':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const canUpdateStatus = () => {
    if (hasRole('ADMIN')) return true;
    if (hasRole('DOCTOR')) {
      return ['SCHEDULED', 'IN_PROGRESS'].includes(appointment.status);
    }
    if (hasRole('HELPDESK')) {
      return ['SCHEDULED'].includes(appointment.status);
    }
    return false;
  };

  const getAvailableStatuses = () => {
    const allStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NOSHOW'];

    if (hasRole('ADMIN')) {
      return allStatuses;
    }
    if (hasRole('DOCTOR')) {
      if (appointment.status === 'SCHEDULED') {
        return ['SCHEDULED', 'IN_PROGRESS', 'NOSHOW'];
      }
      if (appointment.status === 'IN_PROGRESS') {
        return ['IN_PROGRESS', 'COMPLETED'];
      }
    }
    if (hasRole('HELPDESK')) {
      if (appointment.status === 'SCHEDULED') {
        return ['SCHEDULED'];
      }
    }
    return [appointment.status];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      setIsLoading(true);
      const updatedAppointment = {
        status: status as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW',
        notes
      };

      await appointmentsAPI.update(appointment.id, updatedAppointment);
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
      onAppointmentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await appointmentsAPI.cancel(appointment.id, cancelReason);
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      onAppointmentUpdated();
      onOpenChange(false);
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast({
        title: "Error",
        description: "Please select both date and time for rescheduling",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newDateTime = dateUtils.toBackendFormat(rescheduleDate);
      const [date] = newDateTime.split(' ');
      const newAppointmentDate = `${date} ${rescheduleTime}`;

      await appointmentsAPI.reschedule(appointment.id, newAppointmentDate);
      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });
      onAppointmentUpdated();
      onOpenChange(false);
      setShowRescheduleDialog(false);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reschedule appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View and manage appointment information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Patient Name</Label>
                <p className="text-lg font-semibold">{appointment.patientName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Doctor and Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Doctor</Label>
                <p className="text-base">{appointment.doctorName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Department</Label>
                <p className="text-base">{appointment.department}</p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Date</Label>
                <p className="text-base">{dateUtils.formatDisplayDate(appointment.appointmentDate)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Time</Label>
                <p className="text-base">{dateUtils.formatDisplayTime(appointment.appointmentDate)}</p>
              </div>
            </div>

            {/* Cancellation Reason (if cancelled) */}
            {appointment.reason && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Cancellation Reason</Label>
                <p className="text-base text-red-600">{appointment.reason}</p>
              </div>
            )}

            {/* Status Update (if user can update) */}
            {canUpdateStatus() && (
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Update Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatuses().map((statusOption) => (
                      <SelectItem key={statusOption} value={statusOption}>
                        {statusOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1"
                disabled={!canUpdateStatus()}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-1 gap-2">
              {['SCHEDULED'].includes(appointment.status) && canUpdateStatus() && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleDialog(true)}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none"
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Close
              </Button>

              {canUpdateStatus() && (status !== appointment.status || notes !== (appointment.notes || '')) && (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelReason">Reason for Cancellation</Label>
              <Textarea
                id="cancelReason"
                placeholder="Please specify the reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="mt-1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isLoading || !cancelReason.trim()}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !rescheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rescheduleDate ? format(rescheduleDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={setRescheduleDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rescheduleTime">New Time</Label>
                <Input
                  id="rescheduleTime"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleAppointment}
              disabled={isLoading || !rescheduleDate || !rescheduleTime}
            >
              {isLoading ? 'Rescheduling...' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentDetailDialog;
