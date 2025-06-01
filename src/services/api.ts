
const API_BASE_URL = 'http://localhost:8080/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  signin: (credentials: { username: string; password: string }) =>
    fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(res => res.json()),
    
  signup: (userData: any) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => apiCall('/appointments'),
  getById: (id: number) => apiCall(`/appointments/${id}`),
  create: (appointment: any) =>
    apiCall('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    }),
  update: (id: number, appointment: any) =>
    apiCall(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    }),
  delete: (id: number) =>
    apiCall(`/appointments/${id}`, {
      method: 'DELETE',
    }),
  getByDoctor: (doctorId: number) => apiCall(`/appointments/doctor/${doctorId}`),
  getByPatient: (patientId: number) => apiCall(`/appointments/patient/${patientId}`),
  getByDepartment: (departmentId: number) => apiCall(`/appointments/department/${departmentId}`),
  updateStatus: (id: number, status: string) =>
    apiCall(`/appointments/${id}/status/${status}`, {
      method: 'PUT',
    }),
};

// Departments API
export const departmentsAPI = {
  getAll: () => apiCall('/departments'),
  getById: (id: number) => apiCall(`/departments/${id}`),
  create: (department: any) =>
    apiCall('/departments', {
      method: 'POST',
      body: JSON.stringify(department),
    }),
  update: (id: number, department: any) =>
    apiCall(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(department),
    }),
  delete: (id: number) =>
    apiCall(`/departments/${id}`, {
      method: 'DELETE',
    }),
};

// Users API
export const usersAPI = {
  getAll: () => apiCall('/users'),
  getById: (id: number) => apiCall(`/users/${id}`),
  update: (id: number, user: any) =>
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),
  delete: (id: number) =>
    apiCall(`/users/${id}`, {
      method: 'DELETE',
    }),
};
