
// Updated interface to match backend API specification
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  departmentId: number;
  createdById?: number;
  appointmentDateTime: string; // ISO format from backend
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
  
  // These fields might be populated by frontend joins or separate API calls
  patientName?: string;
  doctorName?: string;
  department?: string;
}

export interface CreateAppointmentRequest {
  patientId?: number;
  patientName?: string;
  doctorId: number;
  departmentId: number;
  appointmentDateTime: string; // ISO format
  createdById?: number;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDateTime?: string;
  status?: string;
  notes?: string;
}
