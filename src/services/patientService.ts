import axios from 'axios';

// Kết nối tới Backend của bạn đang chạy ở cổng 3000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });

// Tự động đính kèm vé (token) vào mỗi chuyến xe gửi đi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 1. API Đặt lịch khám
export const createBooking = (data: any) => 
  api.post('/patient/booking', data).then(r => r.data);

// 2. API Lấy lịch sử khám của một bệnh nhân
export const getPatientHistory = (email: string) => 
  api.get(`/patient/history?email=${email}`).then(r => r.data);

// 3. API Đếm số lượng người đã đặt trong ngày để khóa khung giờ
export const getBookingCounts = (date: string) => 
  api.get(`/patient/booking/counts?date=${date}`).then(r => r.data);