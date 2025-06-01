
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewDepartmentDialog from '@/components/departments/NewDepartmentDialog';

interface Department {
  id: number;
  name: string;
  description: string;
  headOfDepartment: string;
  totalDoctors: number;
  totalAppointments: number;
  location: string;
  phone: string;
  email: string;
  isActive: boolean;
}

const Departments = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDepartmentDialog, setShowNewDepartmentDialog] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [departments, searchTerm]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockDepartments: Department[] = [
        {
          id: 1,
          name: 'Cardiology',
          description: 'Heart and cardiovascular system care',
          headOfDepartment: 'Dr. Sarah Johnson',
          totalDoctors: 8,
          totalAppointments: 45,
          location: 'Building A, Floor 3',
          phone: '+1-555-0100',
          email: 'cardiology@hospital.com',
          isActive: true
        },
        {
          id: 2,
          name: 'Neurology',
          description: 'Brain and nervous system disorders',
          headOfDepartment: 'Dr. Michael Chen',
          totalDoctors: 6,
          totalAppointments: 32,
          location: 'Building B, Floor 2',
          phone: '+1-555-0101',
          email: 'neurology@hospital.com',
          isActive: true
        },
        {
          id: 3,
          name: 'Pediatrics',
          description: 'Medical care for infants, children, and adolescents',
          headOfDepartment: 'Dr. Emily Rodriguez',
          totalDoctors: 10,
          totalAppointments: 67,
          location: 'Building C, Floor 1',
          phone: '+1-555-0102',
          email: 'pediatrics@hospital.com',
          isActive: true
        },
        {
          id: 4,
          name: 'Emergency',
          description: '24/7 emergency medical services',
          headOfDepartment: 'Dr. Robert Kim',
          totalDoctors: 15,
          totalAppointments: 89,
          location: 'Ground Floor, Main Building',
          phone: '+1-555-0911',
          email: 'emergency@hospital.com',
          isActive: true
        }
      ];
      setDepartments(mockDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = departments;
    if (searchTerm) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredDepartments(filtered);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading departments...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">Manage hospital departments and their information</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Button onClick={() => setShowNewDepartmentDialog(true)}>
              Add New Department
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Departments</CardTitle>
            <CardDescription>Find departments by name, description, or head of department</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No departments found</p>
            </div>
          ) : (
            filteredDepartments.map((department) => (
              <Card key={department.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{department.name}</CardTitle>
                    <Badge variant={department.isActive ? 'default' : 'destructive'}>
                      {department.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Head of Department</p>
                      <p className="text-sm text-gray-600">{department.headOfDepartment}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Doctors</p>
                        <p className="text-lg font-semibold text-primary">{department.totalDoctors}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Appointments</p>
                        <p className="text-lg font-semibold text-secondary">{department.totalAppointments}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{department.location}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact</p>
                      <p className="text-sm text-gray-600">{department.phone}</p>
                      <p className="text-sm text-gray-600">{department.email}</p>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <NewDepartmentDialog
          open={showNewDepartmentDialog}
          onOpenChange={setShowNewDepartmentDialog}
          onDepartmentCreated={fetchDepartments}
        />
      </div>
    </Layout>
  );
};

export default Departments;
