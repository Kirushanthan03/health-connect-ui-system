
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  time: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  date: string;
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
  const { toast } = useToast();
  const { state } = useAuth();
  const { user } = state;

  React.useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
      setStatus(appointment.status);
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
        return 'destructive';
      default:
        return 'default';
    }
  };

  const canUpdateStatus = () => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'DOCTOR') {
      return ['SCHEDULED', 'IN_PROGRESS'].includes(appointment.status);
    }
    if (user?.role === 'HELPDESK') {
      return ['SCHEDULED'].includes(appointment.status);
    }
    return false;
  };

  const handleUpdateAppointment = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      
      onAppointmentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableStatuses = () => {
    if (user?.role === 'ADMIN') {
      return ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    }
    if (user?.role === 'DOCTOR') {
      if (appointment.status === 'SCHEDULED') {
        return ['SCHEDULED', 'IN_PROGRESS', 'CANCELLED'];
      }
      if (appointment.status === 'IN_PROGRESS') {
        return ['IN_PROGRESS', 'COMPLETED'];
      }
    }
    if (user?.role === 'HELPDESK') {
      if (appointment.status === 'SCHEDULED') {
        return ['SCHEDULED', 'CANCELLED'];
      }
    }
    return [appointment.status];
  };

  return (
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
              <p className="text-base">{new Date(appointment.date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Time</Label>
              <p className="text-base">{appointment.time}</p>
            </div>
          </div>

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
            {appointment.status === 'SCHEDULED' && canUpdateStatus() && (
              <Button 
                variant="destructive" 
                onClick={handleCancelAppointment}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </Button>
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
                onClick={handleUpdateAppointment} 
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading ? 'Updating...' : 'Update Appointment'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailDialog;
