# Hospital Management System API Documentation

## Base URL
All API endpoints are prefixed with: `/api`

## Authentication
All endpoints (except login) require a Bearer token in the Authorization header.

## API Endpoints

### 1. Authentication

#### Login
```http
POST /auth/signin
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "string",
  "type": "Bearer",
  "id": 0,
  "username": "string",
  "email": "string",
  "roles": ["string"]
}
```

### 2. Patients

#### Get All Patients
```http
GET /patients
```

**Query Parameters:**
- `page` (optional): Page number, starting from 0
- `size` (optional): Number of items per page
- `sort` (optional): Sort field and direction (e.g., firstName,asc)

**Response (200 OK):**
```json
[
  {
    "id": 0,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "yyyy-MM-dd",
    "address": "string",
    "emergencyContact": "string",
    "medicalHistory": "string",
    "insuranceInfo": "string",
    "createdAt": "yyyy-MM-dd'T'HH:mm:ss",
    "updatedAt": "yyyy-MM-dd'T'HH:mm:ss"
  }
]
```

#### Get Patient by ID
```http
GET /patients/{id}
```

**Response (200 OK):**
```json
{
  "id": 0,
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "yyyy-MM-dd",
  "address": "string",
  "emergencyContact": "string",
  "medicalHistory": "string",
  "insuranceInfo": "string"
}
```

#### Create Patient
```http
POST /patients
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "yyyy-MM-dd",
  "address": "string",
  "emergencyContact": "string",
  "medicalHistory": "string",
  "insuranceInfo": "string"
}
```

**Response (201 Created):**
```json
{
  "id": 0,
  "message": "Patient created successfully"
}
```

#### Update Patient
```http
PUT /patients/{id}
```

**Request Body:** Same as Create Patient

**Response (200 OK):**
```json
{
  "id": 0,
  "message": "Patient updated successfully"
}
```

#### Delete Patient
```http
DELETE /patients/{id}
```

**Response (200 OK):**
```json
{
  "message": "Patient deleted successfully"
}
```

### 3. Appointments

#### Get All Appointments
```http
GET /appointments
```

**Query Parameters:**
- `status` (optional): Filter by status
- `startDate` (optional): Filter by start date (yyyy-MM-dd)
- `endDate` (optional): Filter by end date (yyyy-MM-dd)
- `page` (optional): Page number
- `size` (optional): Items per page

**Response (200 OK):**
```json
[
  {
    "id": 0,
    "patientId": 0,
    "doctorId": 0,
    "appointmentDate": "yyyy-MM-dd'T'HH:mm:ss",
    "status": "SCHEDULED",
    "reason": "string",
    "notes": "string",
    "createdAt": "yyyy-MM-dd'T'HH:mm:ss",
    "updatedAt": "yyyy-MM-dd'T'HH:mm:ss"
  }
]
```

#### Get Appointment by ID
```http
GET /appointments/{id}
```

**Response (200 OK):**
```json
{
  "id": 0,
  "patientId": 0,
  "doctorId": 0,
  "appointmentDate": "yyyy-MM-dd'T'HH:mm:ss",
  "status": "SCHEDULED",
  "reason": "string",
  "notes": "string"
}
```

#### Create Appointment
```http
POST /appointments
```

**Request Body:**
```json
{
  "patientId": 0,
  "doctorId": 0,
  "appointmentDate": "yyyy-MM-dd'T'HH:mm:ss",
  "reason": "string",
  "notes": "string"
}
```

**Response (201 Created):**
```json
{
  "id": 0,
  "message": "Appointment created successfully"
}
```

#### Update Appointment
```http
PUT /appointments/{id}
```

**Request Body:** Same as Create Appointment

**Response (200 OK):**
```json
{
  "id": 0,
  "message": "Appointment updated successfully"
}
```

#### Delete Appointment
```http
DELETE /appointments/{id}
```

**Response (200 OK):**
```json
{
  "message": "Appointment deleted successfully"
}
```

#### Get Appointments by Doctor
```http
GET /appointments/doctor/{doctorId}
```

**Response (200 OK):** Same as Get All Appointments

#### Get Appointments by Patient
```http
GET /appointments/patient/{patientId}
```

**Response (200 OK):** Same as Get All Appointments

#### Get Appointments by Department
```http
GET /appointments/department/{departmentId}
```

**Response (200 OK):** Same as Get All Appointments

#### Update Appointment Status
```http
PUT /appointments/{id}/status/{status}
```

**Path Variables:**
- `status`: One of [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NOSHOW]

**Response (200 OK):**
```json
{
  "id": 0,
  "message": "Appointment status updated successfully"
}
```

#### Cancel Appointment
```http
PUT /appointments/{id}/cancel
```

**Request Body:**
```json
{
  "cancellationReason": "string"
}
```

**Response (200 OK):**
```json
{
  "id": 0,
  "message": "Appointment cancelled successfully"
}
```

#### Reschedule Appointment
```http
PUT /appointments/{id}/reschedule
```

**Request Body:**
```json
{
  "newAppointmentDate": "yyyy-MM-dd'T'HH:mm:ss"
}
```

**Response (200 OK):**
```json
{
  "id": 0,
  "message": "Appointment rescheduled successfully"
}
```

### 4. Medical Records

#### Get Patient's Medical Records
```http
GET /patients/{patientId}/medical-records
```

**Response (200 OK):**
```json
[
  {
    "id": 0,
    "date": "yyyy-MM-dd",
    "type": "string",
    "description": "string",
    "diagnosis": "string",
    "treatment": "string",
    "prescription": "string",
    "notes": "string",
    "patientId": 0,
    "createdBy": "string",
    "createdAt": "yyyy-MM-dd"
  }
]
```

#### Create Medical Record
```http
POST /patients/{patientId}/medical-records
```

**Request Body:**
```json
{
  "date": "yyyy-MM-dd",
  "type": "string",
  "description": "string",
  "diagnosis": "string",
  "treatment": "string",
  "prescription": "string",
  "notes": "string"
}
```

**Response (201 Created):**
```json
{
  "id": 0,
  "message": "Medical record created successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "yyyy-MM-dd'T'HH:mm:ss",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/endpoint"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "yyyy-MM-dd'T'HH:mm:ss",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/endpoint"
}
```

### 403 Forbidden
```json
{
  "timestamp": "yyyy-MM-dd'T'HH:mm:ss",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/endpoint"
}
```

### 404 Not Found
```json
{
  "timestamp": "yyyy-MM-dd'T'HH:mm:ss",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/endpoint"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "yyyy-MM-dd'T'HH:mm:ss",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/endpoint"
}
```

## Data Types

### Date Format
- Dates: `yyyy-MM-dd`
- DateTimes: `yyyy-MM-dd'T'HH:mm:ss`

### Appointment Status
- "SCHEDULED"
- "IN_PROGRESS"
- "COMPLETED"
- "CANCELLED"
- "NOSHOW" 