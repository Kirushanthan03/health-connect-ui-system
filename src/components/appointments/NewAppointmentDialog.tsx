import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { appointmentsAPI, departmentsAPI, usersAPI, patientsAPI, dateUtils } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentCreated: () => void;
}

interface Department {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  fullName: string;
  email: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

const NewAppointmentDialog: React.FC<NewAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onAppointmentCreated
}) => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: undefined as Date | undefined,
    time: '',
    reason: '',
    notes: ''
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchDepartments();
      fetchDoctors();
      fetchPatients();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentsAPI.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Use the dedicated doctors endpoint
      const data = await usersAPI.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatients = async (search?: string) => {
    try {
      const data = await patientsAPI.getAll(search, 0, 50);
      setPatients(data.content || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientSearch = (searchTerm: string) => {
    setPatientSearch(searchTerm);
    if (searchTerm.length > 2) {
      fetchPatients(searchTerm);
    } else {
      fetchPatients();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appointmentDate) return;

    setIsLoading(true);
    try {
      const appointmentDateTime = dateUtils.toBackendFormat(
        format(formData.appointmentDate, 'yyyy-MM-dd'),
        formData.time
      );

      const appointmentData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        appointmentDate: appointmentDateTime,
        reason: formData.reason,
        notes: formData.notes
      };

      await appointmentsAPI.create(appointmentData);
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: undefined,
        time: '',
        reason: '',
        notes: ''
      });

      onAppointmentCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment for a patient
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select
              value={formData.patientId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {`${patient.firstName} ${patient.lastName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              value={formData.doctorId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.appointmentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.appointmentDate ? format(formData.appointmentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.appointmentDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="Enter reason for the appointment"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for the appointment"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentDialog;
