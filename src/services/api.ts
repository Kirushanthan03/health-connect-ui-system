const API_BASE_URL = 'http://localhost:8080/api';

// Token handling functions
const getToken = () => {
  const tokenData = localStorage.getItem('token');
  if (!tokenData) return null;

  try {
    const { token, type } = JSON.parse(tokenData);
    return `${type} ${token}`;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

const setToken = (tokenData: { token: string; type: string }) => {
  localStorage.setItem('token', JSON.stringify(tokenData));
};

const removeToken = () => {
  localStorage.removeItem('token');
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
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
    // Store token data
    setToken({
      token: data.token,
      type: data.type
    });

    return data;
  },

  signup: (userData: any) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  signout: () => {
    removeToken();
  },

  getCurrentUser: () => apiCall('/auth/me'),
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
    appointmentDate: string; // Format: yyyy-MM-dd'T'HH:mm:ss
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
  getDoctors: () => apiCall('/users/doctors'),
  // getPatients: () => apiCall('/patients'),
  getHelpdesk: () => apiCall('/users/helpdesk'),
  getProfile: () => apiCall('/users/profile'),
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
