
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewPatientDialog from '@/components/patients/NewPatientDialog';

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
  status: 'ACTIVE' | 'INACTIVE';
}

const Patients = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockPatients: Patient[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          dateOfBirth: '1985-06-15',
          address: '123 Main St, City, State 12345',
          emergencyContact: 'Jane Doe - +1-555-0124',
          medicalHistory: 'Hypertension, Diabetes Type 2',
          insuranceInfo: 'Blue Cross Blue Shield - Policy #BC123456',
          status: 'ACTIVE'
        },
        {
          id: 2,
          firstName: 'Mary',
          lastName: 'Smith',
          email: 'mary.smith@email.com',
          phone: '+1-555-0125',
          dateOfBirth: '1990-03-22',
          address: '456 Oak Ave, City, State 12345',
          emergencyContact: 'Robert Smith - +1-555-0126',
          medicalHistory: 'Asthma, Allergies (Penicillin)',
          insuranceInfo: 'Aetna - Policy #AE789012',
          status: 'ACTIVE'
        }
      ];
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }
    setFilteredPatients(filtered);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600">Manage patient records and information</p>
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'HELPDESK') && (
            <Button onClick={() => setShowNewPatientDialog(true)}>
              Add New Patient
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Patients</CardTitle>
            <CardDescription>Find patients by name, email, or phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patients ({filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No patients found</p>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-gray-600">{patient.email} • {patient.phone}</p>
                          <p className="text-sm text-gray-500">DOB: {patient.dateOfBirth}</p>
                          {patient.medicalHistory && (
                            <p className="text-sm text-gray-500 mt-1">Medical History: {patient.medicalHistory}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={patient.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {patient.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {(user?.role === 'ADMIN' || user?.role === 'HELPDESK') && (
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <NewPatientDialog
          open={showNewPatientDialog}
          onOpenChange={setShowNewPatientDialog}
          onPatientCreated={fetchPatients}
        />
      </div>
    </Layout>
  );
};

export default Patients;
