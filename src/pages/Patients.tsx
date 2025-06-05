import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewPatientDialog from '@/components/patients/NewPatientDialog';
import { patientsAPI, usersAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';


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

const Patients = () => {
  const { state, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const data = await patientsAPI.getAll();
      setPatients(data.content || []);
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
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }
    setFilteredPatients(filtered);
  };

  const handleViewDetails = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowNewPatientDialog(true);
  };

  const canManagePatients = () => {
    return hasRole('ADMIN') || hasRole('HELPDESK');
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
          {canManagePatients() && (
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
                          {`${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{`${patient.firstName} ${patient.lastName}`}</p>
                          <p className="text-sm text-gray-600">{patient.email} • {patient.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(patient)}
                        >
                          View Details
                        </Button>
                        {canManagePatients() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(patient)}
                          >
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
          editPatient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      </div>
    </Layout>
  );
};

export default Patients;
