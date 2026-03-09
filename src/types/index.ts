export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  doctorCount: number;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  title: string;
  specialization: string;
  experience: number;
  avatar: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  consultationFee: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  deposit: number;
  totalFee: number;
  notes?: string;
  prescription?: Prescription;
  referral?: Referral;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Referral {
  id: string;
  fromDepartment: string;
  toDepartment: string;
  fromDoctor: string;
  toDoctor?: string;
  reason: string;
  date: string;
  status: 'pending' | 'accepted' | 'completed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  avatar?: string;
}
