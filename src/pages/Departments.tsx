
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewDepartmentDialog from '@/components/departments/NewDepartmentDialog';
import { departmentsAPI } from '@/services/api';

interface Department {
  id: number;
  name: string;
  description: string;
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
      const data = await departmentsAPI.getAll();
      setDepartments(data);
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
        dept.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            <CardDescription>Find departments by name or description</CardDescription>
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
                    <Badge variant="default">Active</Badge>
                  </div>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
