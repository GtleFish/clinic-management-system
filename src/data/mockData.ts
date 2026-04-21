import { Department, Doctor, TimeSlot, Appointment } from '@/types';

/** ================== DEPARTMENTS ================== */
export const departments: Department[] = [
  { id: 'dept-3', name: 'Sản phụ khoa', description: 'Chăm sóc sức khỏe phụ nữ và thai sản', icon: 'Baby', doctorCount: 1 },
  { id: 'dept-4', name: 'Nhi khoa', description: 'Chăm sóc sức khỏe trẻ em', icon: 'SmilePlus', doctorCount: 1 },
  { id: 'dept-5', name: 'Da liễu', description: 'Khám và điều trị các bệnh về da', icon: 'Shield', doctorCount: 1 },
  { id: 'dept-6', name: 'Mắt', description: 'Khám và điều trị các bệnh về mắt', icon: 'Eye', doctorCount: 1 },
  { id: 'dept-7', name: 'Tai Mũi Họng', description: 'Khám và điều trị tai, mũi, họng', icon: 'Ear', doctorCount: 1 },
  { id: 'dept-8', name: 'Răng Hàm Mặt', description: 'Nha khoa và phẫu thuật hàm mặt', icon: 'Smile', doctorCount: 0 }, // chưa có bác sĩ
];

/** ================== DOCTORS ================== */
export const doctors: Doctor[] = [
  {
    id: 'BS-004',
    name: 'BS. Phạm Thu Dung',
    departmentId: 'dept-3',
    departmentName: 'Sản phụ khoa',
    title: 'TS.BS',
    specialization: 'Sản khoa',
    experience: 12,
    avatar: '',
    rating: 4.7,
    reviewCount: 198,
    available: true,
    consultationFee: 450000
  },
  {
    id: 'BS-005',
    name: 'BS. Hoàng Văn Em',
    departmentId: 'dept-4',
    departmentName: 'Nhi khoa',
    title: 'PGS.TS',
    specialization: 'Nhi tổng quát',
    experience: 18,
    avatar: '',
    rating: 4.9,
    reviewCount: 456,
    available: true,
    consultationFee: 500000
  },
  {
    id: 'BS-006',
    name: 'BS. Vũ Thị Fương',
    departmentId: 'dept-5',
    departmentName: 'Da liễu',
    title: 'ThS.BS',
    specialization: 'Da liễu thẩm mỹ',
    experience: 8,
    avatar: '',
    rating: 4.5,
    reviewCount: 145,
    available: true,
    consultationFee: 350000
  },
  {
    id: 'BS-007',
    name: 'BS. Đỗ Quang Giang',
    departmentId: 'dept-6',
    departmentName: 'Mắt',
    title: 'TS.BS',
    specialization: 'Phẫu thuật mắt',
    experience: 14,
    avatar: '',
    rating: 4.8,
    reviewCount: 267,
    available: true, // ✅ sửa thành true để test không bị khóa
    consultationFee: 500000
  },
  {
    id: 'BS-008',
    name: 'BS. Ngô Thanh Hà',
    departmentId: 'dept-7',
    departmentName: 'Tai Mũi Họng',
    title: 'BS.CKI',
    specialization: 'Tai mũi họng',
    experience: 9,
    avatar: '',
    rating: 4.6,
    reviewCount: 134,
    available: true,
    consultationFee: 380000
  },
];

/** ================== TIME SLOTS ================== */
export const timeSlots: TimeSlot[] = [
  { id: 'ts-1', time: '07:30', available: true },
  { id: 'ts-2', time: '08:00', available: true },
  { id: 'ts-3', time: '08:30', available: false },
  { id: 'ts-4', time: '09:00', available: true },
  { id: 'ts-5', time: '09:30', available: true },
  { id: 'ts-6', time: '10:00', available: true },
  { id: 'ts-7', time: '10:30', available: false },
  { id: 'ts-8', time: '11:00', available: true },
  { id: 'ts-9', time: '13:30', available: true },
  { id: 'ts-10', time: '14:00', available: true },
  { id: 'ts-11', time: '14:30', available: true },
  { id: 'ts-12', time: '15:00', available: false },
  { id: 'ts-13', time: '15:30', available: true },
  { id: 'ts-14', time: '16:00', available: true },
];

/** ================== SAMPLE APPOINTMENTS ================== */
export const sampleAppointments: Appointment[] = [
  {
    id: 'apt-2',
    patientName: 'Nguyễn Văn Khách',
    doctorId: 'BS-005',
    doctorName: 'PGS.TS Hoàng Văn Em',
    departmentName: 'Nhi khoa',
    date: '2026-03-05',
    time: '09:30',
    status: 'completed',
    deposit: 200000,
    totalFee: 500000,
    notes: 'Khám sức khỏe cho bé',
    prescription: {
      id: 'pres-1',
      appointmentId: 'apt-2',
      doctorName: 'PGS.TS Hoàng Văn Em',
      date: '2026-03-05',
      diagnosis: 'Viêm họng cấp',
      medications: [
        { name: 'Amoxicillin 250mg', dosage: '1 viên', frequency: '3 lần/ngày', duration: '7 ngày', notes: 'Uống sau ăn' },
        { name: 'Paracetamol 500mg', dosage: '1 viên', frequency: 'Khi sốt trên 38.5°C', duration: 'Khi cần', notes: 'Cách 4-6 tiếng' },
      ],
      notes: 'Tái khám sau 7 ngày nếu không cải thiện',
    },
    referral: {
      id: 'ref-1',
      fromDepartment: 'Nhi khoa',
      toDepartment: 'Tai Mũi Họng',
      fromDoctor: 'PGS.TS Hoàng Văn Em',
      toDoctor: 'BS.CKI Ngô Thanh Hà',
      reason: 'Nghi ngờ viêm amidan mạn tính, cần khám chuyên khoa TMH',
      date: '2026-03-05',
      status: 'pending',
    },
  },
];