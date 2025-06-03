
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewPatientDialog from '@/components/patients/NewPatientDialog';
import { usersAPI } from '@/services/api';

interface Patient {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  active: boolean;
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
      const data = await usersAPI.getPatients();
      setPatients(data);
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
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber.includes(searchTerm)
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
                          {patient.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{patient.fullName}</p>
                          <p className="text-sm text-gray-600">{patient.email} • {patient.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={patient.active ? 'default' : 'destructive'}>
                        {patient.active ? 'ACTIVE' : 'INACTIVE'}
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
