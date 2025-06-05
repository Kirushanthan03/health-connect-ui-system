import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { patientsAPI } from '@/services/api';
import NewPatientDialog from '@/components/patients/NewPatientDialog';

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    address: string;
    emergencyContact: string;
    medicalHistory: string;
    insuranceInfo: string;
    active: boolean;
}

const PatientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { state } = useAuth();
    const { user } = state;
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPatientDetails();
        }
    }, [id]);

    const fetchPatientDetails = async () => {
        try {
            setIsLoading(true);
            const data = await patientsAPI.getById(parseInt(id!));
            setPatient(data);
        } catch (error) {
            console.error('Error fetching patient details:', error);
            toast({
                title: "Error",
                description: "Failed to load patient details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading patient details...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!patient) {
        return (
            <Layout>
                <div className="p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Patient Not Found</h1>
                        <p className="mt-2 text-gray-600">The patient you're looking for doesn't exist or has been removed.</p>
                        <Button className="mt-4" onClick={() => navigate('/patients')}>
                            Back to Patients
                        </Button>
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
                        <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
                        <p className="text-gray-600">View and manage patient information</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/patients')}>
                            Back to Patients
                        </Button>
                        {(user?.role === 'ADMIN' || user?.role === 'HELPDESK') && (
                            <Button onClick={() => setShowEditDialog(true)}>
                                Edit Patient
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic patient details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                <p className="mt-1 text-lg">{`${patient.firstName} ${patient.lastName}`}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                <p className="mt-1">{patient.email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                <p className="mt-1">{patient.phoneNumber}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                                <p className="mt-1">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <Badge variant={patient.active ? 'default' : 'destructive'} className="mt-1">
                                    {patient.active ? 'ACTIVE' : 'INACTIVE'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>Medical and contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                                <p className="mt-1">{patient.address || 'Not provided'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                                <p className="mt-1">{patient.emergencyContact || 'Not provided'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Medical History</h3>
                                <p className="mt-1 whitespace-pre-wrap">{patient.medicalHistory || 'Not provided'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Insurance Information</h3>
                                <p className="mt-1">{patient.insuranceInfo || 'Not provided'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <NewPatientDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    onPatientCreated={fetchPatientDetails}
                    editPatient={patient}
                    onClose={() => setShowEditDialog(false)}
                />
            </div>
        </Layout>
    );
};

export default PatientDetails; 