
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
import { appointmentsAPI, departmentsAPI, usersAPI } from '@/services/api';
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
  firstName: string;
  lastName: string;
  email: string;
}

const NewAppointmentDialog: React.FC<NewAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onAppointmentCreated
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    doctorId: '',
    departmentId: '',
    date: undefined as Date | undefined,
    time: '',
    notes: ''
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchDepartments();
      fetchDoctors();
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
      const data = await usersAPI.getAll();
      const doctorUsers = data.filter((user: any) => user.role === 'DOCTOR');
      setDoctors(doctorUsers);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) return;

    setIsLoading(true);
    try {
      const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctorId);
      const selectedDepartment = departments.find(d => d.id.toString() === formData.departmentId);

      const appointmentData = {
        patientName: formData.patientName,
        doctorName: selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : '',
        department: selectedDepartment?.name || '',
        date: format(formData.date, 'yyyy-MM-dd'),
        time: formData.time,
        status: 'SCHEDULED',
        notes: formData.notes
      };

      await appointmentsAPI.create(appointmentData);
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
      
      setFormData({
        patientName: '',
        doctorId: '',
        departmentId: '',
        date: undefined,
        time: '',
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
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select 
              value={formData.departmentId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
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
                    Dr. {doctor.firstName} {doctor.lastName}
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
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
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
