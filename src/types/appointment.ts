// Updated interface to match backend API specification
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string; // ISO format from backend
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;

  // These fields might be populated by frontend joins or separate API calls
  patientName?: string;
  doctorName?: string;
  department?: string;
}

export interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string; // ISO format
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';
  reason?: string;
  notes?: string;
}
