import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Check, CreditCard, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { departments, doctors, timeSlots } from '@/data/mockData';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const steps = ['Chọn khoa', 'Chọn bác sĩ', 'Chọn thời gian', 'Xác nhận & Cọc'];

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const initialDept = searchParams.get('dept') || '';
  const [step, setStep] = useState(initialDept ? 1 : 0);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(initialDept ? [initialDept] : []);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-heading mb-6">Đặt lịch khám</h1>

        {/* Stepper */}
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
          {/* Step 0: Departments */}
          {step === 0 && (
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

          {/* Step 1: Doctors */}
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
                <p className="col-span-full text-center text-muted-foreground py-8">Vui lòng quay lại chọn khoa khám</p>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="max-w-lg space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Chọn ngày khám</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Chọn giờ khám</label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        !slot.available ? 'cursor-not-allowed border-border bg-muted text-muted-foreground line-through' :
                        selectedTime === slot.time ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="max-w-lg rounded-xl border border-border bg-card p-6 shadow-elevated">
              <h2 className="text-lg font-bold font-heading mb-4">Xác nhận lịch khám</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Ngày khám</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Giờ khám</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                {selectedDoctorData.map((doc) => (
                  <div key={doc.id} className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">{doc.title} {doc.name.replace('BS. ', '')} ({doc.departmentName})</span>
                    <span className="font-medium">{doc.consultationFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Tổng phí khám</span>
                  <span className="font-bold">{totalFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-medium text-primary flex items-center gap-1"><CreditCard className="h-4 w-4" /> Tiền cọc (40%)</span>
                  <span className="font-bold text-primary">{deposit.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <Button className="mt-6 w-full gradient-primary text-primary-foreground gap-2" size="lg">
                <CreditCard className="h-4 w-4" /> Thanh toán cọc & Xác nhận
              </Button>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
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
