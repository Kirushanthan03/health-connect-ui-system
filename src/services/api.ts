
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
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

// Appointments API - Updated to match backend specification
export const appointmentsAPI = {
  // Get all appointments
  getAll: () => apiCall('/appointments'),
  
  // Get appointment by ID
  getById: (id: number) => apiCall(`/appointments/${id}`),
  
  // Create new appointment
  create: (appointment: {
    patientId: number;
    doctorId: number;
    departmentId: number;
    appointmentDateTime: string; // ISO format
    createdById?: number;
    notes?: string;
  }) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment),
  }),
  
  // Update appointment
  update: (id: number, appointment: {
    appointmentDateTime?: string;
    status?: string;
    notes?: string;
  }) => apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointment),
  }),
  
  // Delete appointment
  delete: (id: number) => apiCall(`/appointments/${id}`, {
    method: 'DELETE',
  }),
  
  // Get appointments by doctor
  getByDoctor: (doctorId: number, start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/appointments/doctor/${doctorId}${query}`);
  },
  
  // Get appointments by patient
  getByPatient: (patientId: number) => apiCall(`/appointments/patient/${patientId}`),
  
  // Get appointments by department
  getByDepartment: (departmentId: number) => apiCall(`/appointments/department/${departmentId}`),
  
  // Update appointment status
  updateStatus: (id: number, status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW') =>
    apiCall(`/appointments/${id}/status/${status}`, {
      method: 'PUT',
    }),
  
  // Cancel appointment with reason
  cancel: (id: number, reason: string) => apiCall(`/appointments/${id}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
  
  // Reschedule appointment
  reschedule: (id: number, newDateTime: string) => apiCall(`/appointments/${id}/reschedule`, {
    method: 'PUT',
    body: JSON.stringify({ newDateTime }),
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

// Utility functions for date/time handling
export const dateUtils = {
  // Convert frontend date/time to ISO format for backend
  toISOString: (date: string, time: string): string => {
    return `${date}T${time}:00`;
  },
  
  // Parse backend datetime format to frontend format
  parseDateTime: (appointmentDateTime: string) => {
    const date = new Date(appointmentDateTime);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().slice(0, 5)
    };
  },
  
  // Format display date from backend
  formatDisplayDate: (appointmentDateTime: string): string => {
    return new Date(appointmentDateTime).toLocaleDateString();
  },
  
  // Format display time from backend
  formatDisplayTime: (appointmentDateTime: string): string => {
    return new Date(appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};
