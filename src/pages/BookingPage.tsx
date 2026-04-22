import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Check, CreditCard, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useToast } from '../hooks/use-toast';
import { createBooking, getBookingCounts, getDanhSachKhoa, getDanhSachBacSi } from '../services/patientService';
import type { Department, Doctor } from '@/types';

const steps = ['Chọn khoa', 'Chọn bác sĩ', 'Chọn thời gian', 'Xác nhận & Cọc'];

const TIME_BLOCKS = [
  { id: 'b1', label: '07:00 - 09:00', value: '07:00-09:00', max: 10 },
  { id: 'b2', label: '09:00 - 11:00', value: '09:00-11:00', max: 10 },
  { id: 'b3', label: '13:00 - 15:00', value: '13:00-15:00', max: 10 },
  { id: 'b4', label: '15:00 - 17:00', value: '15:00-17:00', max: 10 },
];

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialDept = searchParams.get('dept') || '';
  const [step, setStep] = useState(initialDept ? 1 : 0);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(initialDept ? [initialDept] : []);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});

  // ── Dữ liệu động từ database ──
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [khoaRes, bsRes] = await Promise.all([getDanhSachKhoa(), getDanhSachBacSi()]);
        setDepartments(khoaRes.data);
        setDoctors(bsRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu khoa/bác sĩ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleDept = (id: string) => {
    setSelectedDepts((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const toggleDoctor = (id: string) => {
    setSelectedDoctors((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const filteredDoctors = doctors.filter((d) => selectedDepts.includes(d.departmentId));
  const selectedDoctorData = doctors.filter((d) => selectedDoctors.includes(d.id));
  const totalFee = selectedDoctorData.reduce((sum, d) => sum + d.consultationFee, 0);
  const deposit = Math.round(totalFee * 0.4);

  const canNext = () => {
    if (step === 0) return selectedDepts.length > 0;
    if (step === 1) return selectedDoctors.length > 0;
    if (step === 2) return selectedDate && selectedTime;
    return true;
  };

  useEffect(() => {
    if (selectedDate) {
      getBookingCounts(selectedDate).then(res => {
        const counts: Record<string, number> = {};
        res.data.forEach((item: any) => {
          const timeKey = item.gioHen.slice(0, 5); 
          const block = TIME_BLOCKS.find(b => b.value.startsWith(timeKey));
          if (block) counts[block.value] = item.total;
        });
        setBookingCounts(counts);
      }).catch(err => console.error("Lỗi lấy số lượng:", err));
    }
  }, [selectedDate]);

  const handlePaymentAndConfirm = async () => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    if (!currentUser) {
      toast({ title: 'Lỗi', description: 'Vui lòng đăng nhập để đặt lịch!', variant: 'destructive' });
      return;
    }

    try {
      const gioHenDb = selectedTime.slice(0, 5) + ':00'; 

      await createBooking({
        email: currentUser.username,
        idBacSi: selectedDoctorData[0]?.id,
        ngayHen: selectedDate,
        gioHen: gioHenDb
      });

      toast({
        title: 'Thanh toán & Đặt lịch thành công!',
        description: 'Đã lưu lịch khám vào hệ thống. Đang chuyển hướng...',
        className: 'bg-primary text-primary-foreground border-none',
      });
      
      setTimeout(() => navigate('/history'), 1500);

    } catch (error: any) {
      toast({ 
        title: 'Đặt lịch thất bại', 
        description: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Trả Tiêu đề về bên trái */}
        <h1 className="text-2xl font-bold font-heading mb-6">Đặt lịch khám</h1>

        {/* Trả Thanh tiến trình về bên trái */}
        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i < step ? 'bg-primary text-primary-foreground' : i === step ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden text-sm sm:inline">{s}</span>
              {i < steps.length - 1 && <div className="h-px w-4 bg-border sm:w-8" />}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          
          {/* Step 0: Chọn Khoa (Trải rộng full) */}
          {step === 0 && loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
          {step === 0 && !loading && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => toggleDept(dept.id)}
                  className={`rounded-xl border p-5 text-left transition-all ${
                    selectedDepts.includes(dept.id) ? 'border-primary bg-primary/5 shadow-elevated' : 'border-border bg-card shadow-card hover:shadow-elevated'
                  }`}
                >
                  <h3 className="font-semibold font-heading">{dept.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{dept.description}</p>
                  <p className="mt-2 text-xs text-primary font-medium">{dept.doctorCount} bác sĩ</p>
                  {selectedDepts.includes(dept.id) && (
                    <div className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Chọn Bác sĩ (Trải rộng full) */}
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => doc.available && toggleDoctor(doc.id)}
                  disabled={!doc.available}
                  className={`rounded-xl border p-5 text-left transition-all ${
                    !doc.available ? 'opacity-50 cursor-not-allowed border-border bg-muted' :
                    selectedDoctors.includes(doc.id) ? 'border-primary bg-primary/5 shadow-elevated' : 'border-border bg-card shadow-card hover:shadow-elevated'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {doc.name.split(' ').pop()?.[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold font-heading text-sm">{doc.title} {doc.name.replace('BS. ', '')}</h3>
                      <p className="text-xs text-muted-foreground">{doc.departmentName} • {doc.specialization}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span>{doc.rating}</span>
                        <span className="text-muted-foreground">• {doc.experience} năm KN</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-primary">{doc.consultationFee.toLocaleString('vi-VN')}đ</p>
                      {!doc.available && <span className="text-xs text-destructive">Không khả dụng</span>}
                    </div>
                  </div>
                  {selectedDoctors.includes(doc.id) && (
                    <div className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
              {filteredDoctors.length === 0 && (
                <p className="col-span-full text-muted-foreground py-8">Vui lòng quay lại chọn khoa khám</p>
              )}
            </div>
          )}

          {/* Step 2: Chọn Khung Giờ (Chỉ có khối này CĂN GIỮA) */}
          {step === 2 && (
            <div className="max-w-lg mx-auto space-y-6"> 
              <div>
                <label className="mb-2 block text-sm font-medium text-left">Chọn ngày khám</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-left">Chọn khung giờ</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  {TIME_BLOCKS.map((block) => {
                    const bookedCount = bookingCounts[block.value] || 0;
                    const isFull = bookedCount >= block.max;
                    const isSelected = selectedTime === block.value;

                    return (
                      <button
                        key={block.id}
                        disabled={isFull || !selectedDate}
                        onClick={() => setSelectedTime(block.value)}
                        className={`relative flex flex-col items-center justify-center rounded-lg border p-4 transition-all ${
                          !selectedDate ? 'cursor-not-allowed border-border bg-muted opacity-50' :
                          isFull ? 'cursor-not-allowed border-destructive/30 bg-destructive/5 text-destructive' :
                          isSelected ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-border bg-card hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        <span className="font-semibold text-base">{block.label}</span>
                        <span className={`text-xs mt-1 font-medium ${isFull ? 'text-destructive font-bold' : isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {isFull ? 'Đã kín chỗ' : `Còn ${block.max - bookedCount} chỗ`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!selectedDate && (
                  <p className="mt-3 text-sm text-muted-foreground italic text-left">Vui lòng chọn ngày khám trước để xem khung giờ trống.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Xác nhận & Thanh toán (Chỉ có khối này CĂN GIỮA) */}
          {step === 3 && (
            <div className="max-w-lg mx-auto rounded-xl border border-border bg-card p-6 shadow-elevated">
              <h2 className="text-lg font-bold font-heading mb-4 text-left">Xác nhận lịch khám</h2>
              <div className="space-y-3 text-sm text-left">
                <div className="flex justify-between border-b border-border pb-2 gap-4">
                  <span className="text-muted-foreground shrink-0">Bệnh nhân</span>
                  <span className="font-bold text-right">{JSON.parse(localStorage.getItem('user') || '{}').hoTen || 'Khách'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2 gap-4">
                  <span className="text-muted-foreground shrink-0">Ngày khám</span>
                  <span className="font-medium text-right">{selectedDate}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2 gap-4">
                  <span className="text-muted-foreground shrink-0">Giờ khám</span>
                  <span className="font-medium text-right">{selectedTime}</span>
                </div>
                {selectedDoctorData.map((doc) => (
                  <div key={doc.id} className="flex justify-between border-b border-border pb-2 gap-4">
                    <span className="text-muted-foreground">{doc.title} {doc.name.replace('BS. ', '')} ({doc.departmentName})</span>
                    <span className="font-medium shrink-0 text-right">{doc.consultationFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
                <div className="flex justify-between border-b border-border pb-2 gap-4">
                  <span className="text-muted-foreground">Tổng phí khám</span>
                  <span className="font-bold shrink-0 text-right">{totalFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between pt-1 gap-4">
                  <span className="font-medium text-primary flex items-center gap-1 shrink-0"><CreditCard className="h-4 w-4" /> Tiền cọc (40%)</span>
                  <span className="font-bold text-primary shrink-0 text-right">{deposit.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <Button onClick={handlePaymentAndConfirm} className="mt-6 w-full gradient-primary text-primary-foreground gap-2" size="lg">
                <CreditCard className="h-4 w-4" /> Thanh toán cọc & Xác nhận
              </Button>
            </div>
          )}
        </motion.div>

        {/* Trả 2 Nút điều hướng về 2 mép màn hình */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          {step < 3 && (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-2 gradient-primary text-primary-foreground">
              Tiếp tục <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;