import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { patientsAPI } from '@/services/api';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  insuranceInfo: string;
}

interface NewPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated: () => void;
  editPatient?: Patient | null;
  onClose?: () => void;
}

const NewPatientDialog: React.FC<NewPatientDialogProps> = ({
  open,
  onOpenChange,
  onPatientCreated,
  editPatient,
  onClose,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    insuranceInfo: '',
  });

  useEffect(() => {
    if (editPatient) {
      setFormData({
        firstName: editPatient.firstName,
        lastName: editPatient.lastName,
        email: editPatient.email,
        phone: editPatient.phone,
        dateOfBirth: editPatient.dateOfBirth,
        address: editPatient.address,
        emergencyContact: editPatient.emergencyContact,
        medicalHistory: editPatient.medicalHistory,
        insuranceInfo: editPatient.insuranceInfo,
      });
    } else {
      // Reset form when opening for new patient
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        medicalHistory: '',
        insuranceInfo: '',
      });
    }
  }, [editPatient, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editPatient) {
        // Update existing patient
        await patientsAPI.update(editPatient.id, formData);
        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
      } else {
        // Create new patient
        await patientsAPI.create(formData);
        toast({
          title: "Success",
          description: "Patient created successfully",
        });
      }

      onPatientCreated();
      onOpenChange(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: "Error",
        description: `Failed to ${editPatient ? 'update' : 'create'} patient`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            {editPatient ? 'Update patient information' : 'Enter patient information to create a new record'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Name - Phone Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
              rows={3}
              placeholder="Known conditions, allergies, medications..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceInfo">Insurance Information</Label>
            <Input
              id="insuranceInfo"
              value={formData.insuranceInfo}
              onChange={(e) => handleInputChange('insuranceInfo', e.target.value)}
              placeholder="Provider - Policy Number"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => {
              onOpenChange(false);
              if (onClose) onClose();
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editPatient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatientDialog;
