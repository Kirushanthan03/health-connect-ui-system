
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NewUserDialog from '@/components/users/NewUserDialog';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DOCTOR' | 'HELPDESK';
  department?: string;
  isActive: boolean;
  createdAt: string;
}

const Users = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@hospital.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'ADMIN',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          username: 'dr.smith',
          email: 'john.smith@hospital.com',
          firstName: 'John',
          lastName: 'Smith',
          role: 'DOCTOR',
          department: 'Cardiology',
          isActive: true,
          createdAt: '2024-01-15T00:00:00Z'
        },
        {
          id: 3,
          username: 'helpdesk1',
          email: 'sarah.johnson@hospital.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'HELPDESK',
          isActive: true,
          createdAt: '2024-02-01T00:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    setFilteredUsers(filtered);
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      // Mock API call - replace with actual API
      console.log(`Toggling user ${userId} status to ${!currentStatus}`);
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isActive: !currentStatus } : u
      ));
      
      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'DOCTOR':
        return 'default';
      case 'HELPDESK':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">Only administrators can access user management.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <Button onClick={() => setShowNewUserDialog(true)}>
            Add New User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
            <CardDescription>Search and filter users by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['ALL', 'ADMIN', 'DOCTOR', 'HELPDESK'].map((role) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRoleFilter(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No users found</p>
              ) : (
                filteredUsers.map((userData) => (
                  <div
                    key={userData.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {userData.firstName[0]}{userData.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{userData.firstName} {userData.lastName}</p>
                          <p className="text-sm text-gray-600">{userData.email} • @{userData.username}</p>
                          {userData.department && (
                            <p className="text-sm text-gray-500">Department: {userData.department}</p>
                          )}
                          <p className="text-sm text-gray-500">Created: {new Date(userData.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(userData.role)}>
                          {userData.role}
                        </Badge>
                        <Badge variant={userData.isActive ? 'default' : 'destructive'}>
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant={userData.isActive ? 'destructive' : 'default'}
                          onClick={() => handleToggleUserStatus(userData.id, userData.isActive)}
                        >
                          {userData.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <NewUserDialog
          open={showNewUserDialog}
          onOpenChange={setShowNewUserDialog}
          onUserCreated={fetchUsers}
        />
      </div>
    </Layout>
  );
};

export default Users;
