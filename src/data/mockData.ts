import { Department, Doctor, TimeSlot, Appointment } from '@/types';

export const departments: Department[] = [
  { id: 'dept-1', name: 'Nội khoa', description: 'Khám và điều trị các bệnh nội khoa tổng quát', icon: 'Heart', doctorCount: 8 },
  { id: 'dept-2', name: 'Ngoại khoa', description: 'Phẫu thuật và can thiệp ngoại khoa', icon: 'Scissors', doctorCount: 6 },
  { id: 'dept-3', name: 'Sản phụ khoa', description: 'Chăm sóc sức khỏe phụ nữ và thai sản', icon: 'Baby', doctorCount: 5 },
  { id: 'dept-4', name: 'Nhi khoa', description: 'Chăm sóc sức khỏe trẻ em', icon: 'SmilePlus', doctorCount: 7 },
  { id: 'dept-5', name: 'Da liễu', description: 'Khám và điều trị các bệnh về da', icon: 'Shield', doctorCount: 4 },
  { id: 'dept-6', name: 'Mắt', description: 'Khám và điều trị các bệnh về mắt', icon: 'Eye', doctorCount: 3 },
  { id: 'dept-7', name: 'Tai Mũi Họng', description: 'Khám và điều trị tai, mũi, họng', icon: 'Ear', doctorCount: 4 },
  { id: 'dept-8', name: 'Răng Hàm Mặt', description: 'Nha khoa và phẫu thuật hàm mặt', icon: 'Smile', doctorCount: 5 },
];

export const doctors: Doctor[] = [
  { id: 'BS-001', name: 'BS. Nguyễn Văn An', departmentId: 'dept-1', departmentName: 'Nội khoa', title: 'PGS.TS', specialization: 'Tim mạch', experience: 15, avatar: '', rating: 4.8, reviewCount: 234, available: true, consultationFee: 500000 },
  { id: 'BS-002', name: 'BS. Trần Thị Bình', departmentId: 'dept-1', departmentName: 'Nội khoa', title: 'ThS.BS', specialization: 'Tiêu hóa', experience: 10, avatar: '', rating: 4.6, reviewCount: 178, available: true, consultationFee: 400000 },
  { id: 'BS-003', name: 'BS. Lê Minh Cường', departmentId: 'dept-2', departmentName: 'Ngoại khoa', title: 'GS.TS', specialization: 'Phẫu thuật tổng quát', experience: 20, avatar: '', rating: 4.9, reviewCount: 312, available: true, consultationFee: 600000 },
  { id: 'BS-004', name: 'BS. Phạm Thu Dung', departmentId: 'dept-3', departmentName: 'Sản phụ khoa', title: 'TS.BS', specialization: 'Sản khoa', experience: 12, avatar: '', rating: 4.7, reviewCount: 198, available: true, consultationFee: 450000 },
  { id: 'BS-005', name: 'BS. Hoàng Văn Em', departmentId: 'dept-4', departmentName: 'Nhi khoa', title: 'PGS.TS', specialization: 'Nhi tổng quát', experience: 18, avatar: '', rating: 4.9, reviewCount: 456, available: true, consultationFee: 500000 },
  { id: 'BS-006', name: 'BS. Vũ Thị Fương', departmentId: 'dept-5', departmentName: 'Da liễu', title: 'ThS.BS', specialization: 'Da liễu thẩm mỹ', experience: 8, avatar: '', rating: 4.5, reviewCount: 145, available: true, consultationFee: 350000 },
  { id: 'BS-007', name: 'BS. Đỗ Quang Giang', departmentId: 'dept-6', departmentName: 'Mắt', title: 'TS.BS', specialization: 'Phẫu thuật mắt', experience: 14, avatar: '', rating: 4.8, reviewCount: 267, available: false, consultationFee: 500000 },
  { id: 'BS-008', name: 'BS. Ngô Thanh Hà', departmentId: 'dept-7', departmentName: 'Tai Mũi Họng', title: 'BS.CKI', specialization: 'Tai mũi họng', experience: 9, avatar: '', rating: 4.6, reviewCount: 134, available: true, consultationFee: 380000 },
];

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

export const sampleAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientName: 'Nguyễn Văn Khách',
    doctorId: 'BS-001', // Đã sửa
    doctorName: 'PGS.TS Nguyễn Văn An',
    departmentName: 'Nội khoa',
    date: '2026-03-10',
    time: '08:00',
    status: 'confirmed',
    deposit: 200000,
    totalFee: 500000,
    notes: 'Khám tim mạch định kỳ',
  },
  {
    id: 'apt-2',
    patientName: 'Nguyễn Văn Khách',
    doctorId: 'BS-005', // Đã sửa
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
  {
    id: 'apt-3',
    patientName: 'Nguyễn Văn Khách',
    doctorId: 'BS-003', // Đã sửa
    doctorName: 'GS.TS Lê Minh Cường',
    departmentName: 'Ngoại khoa',
    date: '2026-02-20',
    time: '14:00',
    status: 'completed',
    deposit: 250000,
    totalFee: 600000,
    prescription: {
      id: 'pres-2',
      appointmentId: 'apt-3',
      doctorName: 'GS.TS Lê Minh Cường',
      date: '2026-02-20',
      diagnosis: 'Viêm ruột thừa nhẹ',
      medications: [
        { name: 'Cefixime 200mg', dosage: '1 viên', frequency: '2 lần/ngày', duration: '5 ngày' },
        { name: 'Omeprazole 20mg', dosage: '1 viên', frequency: '1 lần/ngày', duration: '14 ngày', notes: 'Uống trước ăn sáng 30 phút' },
      ],
    },
  },
];