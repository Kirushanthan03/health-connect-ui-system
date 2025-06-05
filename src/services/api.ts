const API_BASE_URL = 'http://localhost:8080/api';

// JWT Token handling
interface DecodedToken {
  sub: string;
  exp: number;
  roles: string[];
  username: string;
  email: string;
}

interface TokenData {
  token: string;
  type: string;
  userId: number;
}

const getToken = () => {
  const tokenData = localStorage.getItem('token');
  if (!tokenData) return null;

  try {
    const { token, type } = JSON.parse(tokenData);
    if (!token || !type) {
      localStorage.removeItem('token');
      return null;
    }
    return `${type} ${token}`;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};

const isTokenValid = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    const decoded: DecodedToken = JSON.parse(jsonPayload);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const getDecodedToken = (): DecodedToken | null => {
  const tokenData = localStorage.getItem('token');
  if (!tokenData) return null;

  try {
    const { token } = JSON.parse(tokenData);
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const setToken = (data: TokenData) => {
  localStorage.setItem('token', JSON.stringify(data));
};

const removeToken = () => {
  localStorage.removeItem('token');
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  if (!isTokenValid(token.split(' ')[1])) {
    removeToken();
    throw new Error('Token expired');
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      removeToken();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message === 'Session expired') {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// Authentication API
export const authAPI = {
  signin: async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    setToken({
      token: data.token,
      type: data.type,
      userId: data.id
    });

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      roles: data.roles
    };
  },

  signup: async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    roles: string[];
    departmentId?: number;
  }) => {
    // Convert roles array to the format expected by the backend
    const signupData = {
      ...userData,
      roles: userData.roles
    };

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Signup failed: ${response.status}`);
    }

    return response.json();
  },

  signout: () => {
    removeToken();
  },

  getCurrentUser: () => {
    const tokenData = localStorage.getItem('token');
    if (!tokenData) {
      throw new Error('No valid token found');
    }

    try {
      const { userId } = JSON.parse(tokenData);
      const decoded = getDecodedToken();
      if (!decoded) {
        throw new Error('Invalid token');
      }

      return {
        id: userId,
        username: decoded.username,
        email: decoded.email,
        roles: decoded.roles
      };
    } catch (error) {
      throw new Error('Failed to get current user');
    }
  }
};

// Appointments API
export const appointmentsAPI = {
  // Get all appointments
  getAll: () => apiCall('/appointments'),

  // Get appointment by ID
  getById: (id: number) => apiCall(`/appointments/${id}`),

  // Create new appointment
  create: (appointment: {
    patientId: number;
    doctorId: number;
    appointmentDateTime: string; // Format: yyyy-MM-dd'T'HH:mm:ss
    reason: string;
    notes?: string;
  }) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment),
  }),

  // Update appointment
  update: (id: number, appointment: {
    appointmentDate?: string;
    status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
    reason?: string;
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
  getByDoctor: (doctorId: number) => apiCall(`/appointments/doctor/${doctorId}`),

  // Get appointments by patient
  getByPatient: (patientId: number) => apiCall(`/appointments/patient/${patientId}`),

  // Get appointments by department
  getByDepartment: (departmentId: number) => apiCall(`/appointments/department/${departmentId}`),

  // Update appointment status
  updateStatus: (id: number, status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW') =>
    apiCall(`/appointments/${id}/status/${status}`, {
      method: 'PUT',
    }),

  // Cancel appointment
  cancel: (id: number, cancellationReason: string) =>
    apiCall(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    }),

  // Reschedule appointment
  reschedule: (id: number, newAppointmentDate: string) =>
    apiCall(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ newAppointmentDate }),
    }),
};

// Patients API - Updated to use users/patients endpoint
export const patientsAPI = {
  getAll: (search?: string, page?: number, size?: number) => {
    // Since patients are managed through users API, we use the users/patients endpoint
    return apiCall('/patients').then(data => {
      // Transform to match expected format for backward compatibility
      let filtered = data;
      if (search) {
        filtered = data.filter((patient: any) =>
          patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
          patient.email.toLowerCase().includes(search.toLowerCase()) ||
          patient.phoneNumber.includes(search)
        );
      }

      // Apply pagination if specified
      if (page !== undefined && size !== undefined) {
        const start = page * size;
        const end = start + size;
        filtered = filtered.slice(start, end);
      }

      // Transform to match expected response format
      return {
        content: filtered.map((patient: any) => ({
          id: patient.id,
          name: patient.fullName,
          email: patient.email,
          phone: patient.phoneNumber,
          dateOfBirth: patient.dateOfBirth || '',
        })),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / (size || 20)),
        size: size || 20,
        number: page || 0
      };
    });
  },

  // Get patient by ID
  getById: (id: number) => apiCall(`/patients/${id}`),

  // Add patient creation functionality
  create: (patientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address?: string;
    emergencyContact?: string;
    medicalHistory?: string;
    insuranceInfo?: string;
  }) => {
    const userData = {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth,
      address: patientData.address,
      emergencyContact: patientData.emergencyContact,
      medicalHistory: patientData.medicalHistory,
      insuranceInfo: patientData.insuranceInfo
    };

    return apiCall('/patients', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Add patient update functionality
  update: (id: number, patientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address?: string;
    emergencyContact?: string;
    medicalHistory?: string;
    insuranceInfo?: string;
  }) => {
    const userData = {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth,
      address: patientData.address,
      emergencyContact: patientData.emergencyContact,
      medicalHistory: patientData.medicalHistory,
      insuranceInfo: patientData.insuranceInfo
    };

    return apiCall(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// Lookup API - Using direct endpoints for lookups
export const lookupAPI = {
  getNames: async (entityType: 'patients' | 'doctors' | 'departments', ids: number[]) => {
    try {
      if (entityType === 'patients') {
        // Get all patients and filter by IDs
        const patients = await apiCall('/patients');
        return patients
          .filter((patient: any) => ids.includes(patient.id))
          .map((patient: any) => ({
            id: patient.id,
            name: patient.fullName
          }));
      } else if (entityType === 'doctors') {
        // Get all doctors and filter by IDs
        const doctors = await apiCall('/users/doctors');
        return doctors
          .filter((doctor: any) => ids.includes(doctor.id))
          .map((doctor: any) => ({
            id: doctor.id,
            name: doctor.fullName
          }));
      } else if (entityType === 'departments') {
        // Get all departments and filter by IDs
        const departments = await apiCall('/departments');
        return departments
          .filter((department: any) => ids.includes(department.id))
          .map((department: any) => ({
            id: department.id,
            name: department.name
          }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ${entityType} names:`, error);
      return [];
    }
  },
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
  getDoctorsByDepartment: (id: number) => apiCall(`/departments/${id}/doctors`),
};

// Users API
export const usersAPI = {
  getAll: () => apiCall('/users'),

  getById: (id: number) => apiCall(`/users/${id}`),

  create: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
  }) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  update: (id: number, userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    department?: string;
  }) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  delete: (id: number) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),

  toggleStatus: (id: number) => apiCall(`/users/${id}/toggle-status`, {
    method: 'PUT',
  }),

  getDoctors: () => apiCall('/users/doctors'),
  getHelpdesk: () => apiCall('/users/helpdesk'),
  getProfile: () => apiCall('/users/profile'),
};

// Utility functions for date/time handling
export const dateUtils = {
  // Convert frontend date/time to backend format (YYYY-MM-DD HH:MM)
  toBackendFormat: (date: string, time: string): string => {
    return `${date} ${time}`;
  },

  // Convert to ISO format for reschedule endpoint
  toISOFormat: (date: string, time: string): string => {
    return `${date}T${time}:00`;
  },

  // Parse backend datetime format to frontend format
  parseDateTime: (appointmentDateTime: string) => {
    const [date, time] = appointmentDateTime.split(' ');
    return {
      date: date,
      time: time
    };
  },

  // Format display date from backend
  formatDisplayDate: (appointmentDateTime: string): string => {
    const [date] = appointmentDateTime.split(' ');
    return new Date(date).toLocaleDateString();
  },

  // Format display time from backend
  formatDisplayTime: (appointmentDateTime: string): string => {
    const [, time] = appointmentDateTime.split(' ');
    return time;
  }
};
