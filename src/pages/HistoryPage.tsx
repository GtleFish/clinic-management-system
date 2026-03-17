import { useState, useEffect } from 'react';
import { Calendar, Pill, Share2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { sampleAppointments } from '../data/mockData';
import { Appointment } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-info/10 text-info' },
  'in-progress': { label: 'Đang khám', className: 'bg-primary/10 text-primary' },
  completed: { label: 'Hoàn thành', className: 'bg-success/10 text-success' },
  cancelled: { label: 'Đã hủy', className: 'bg-destructive/10 text-destructive' },
};

const HistoryPage = () => {
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);

  // Lấy dữ liệu lịch khám mới từ localStorage khi trang được tải
  useEffect(() => {
    const savedApts = localStorage.getItem('new_appointments');
    if (savedApts) {
      try {
        const parsedApts = JSON.parse(savedApts);
        // Ghép lịch mới vào trước lịch mẫu (mockData)
        setAppointments([...parsedApts, ...sampleAppointments]);
      } catch (error) {
        console.error('Lỗi khi đọc dữ liệu lịch khám:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold font-heading mb-6">Lịch sử khám bệnh</h1>

        {!selected ? (
          <div className="space-y-3">
            {appointments.map((apt, i) => {
              const status = statusMap[apt.status] || statusMap['pending'];
              return (
                <motion.button
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(apt)}
                  className="w-full rounded-xl border border-border bg-card p-5 text-left shadow-card transition-all hover:shadow-elevated hover:border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold font-heading text-sm">{apt.doctorName}</h3>
                      <p className="text-xs text-muted-foreground">{apt.departmentName}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {apt.date}</span>
                    <span>{apt.time}</span>
                    <span className="font-medium text-primary">{apt.totalFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {apt.prescription && <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md"><Pill className="h-3 w-3" /> Có đơn thuốc</span>}
                    {apt.referral && <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-md"><Share2 className="h-3 w-3" /> Có chuyển khoa</span>}
                  </div>
                </motion.button>
              );
            })}
            {appointments.length === 0 && (
               <p className="text-center text-muted-foreground py-8">Bạn chưa có lịch sử khám bệnh nào.</p>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4 gap-1 text-sm hover:bg-muted">
              ← Quay lại danh sách
            </Button>

            <div className="space-y-4">
              {/* Chi tiết lịch khám */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center justify-between mb-4 pl-2">
                  <h2 className="text-lg font-bold font-heading">Chi tiết lịch khám</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusMap[selected.status]?.className}`}>
                    {statusMap[selected.status]?.label}
                  </span>
                </div>
                <div className="grid gap-4 text-sm sm:grid-cols-2 pl-2">
                  <div><span className="text-muted-foreground block text-xs mb-1">Bác sĩ phụ trách:</span> <span className="font-semibold text-base">{selected.doctorName}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Chuyên khoa:</span> <span className="font-medium">{selected.departmentName}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Ngày khám:</span> <span className="font-medium">{selected.date.split('-').reverse().join('/')}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Giờ khám:</span> <span className="font-medium">{selected.time}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Đã cọc:</span> <span className="font-medium text-success">{selected.deposit.toLocaleString('vi-VN')}đ</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Tổng phí:</span> <span className="font-bold text-primary text-base">{selected.totalFee.toLocaleString('vi-VN')}đ</span></div>
                  {selected.notes && <div className="sm:col-span-2 pt-2 border-t border-border/50"><span className="text-muted-foreground block text-xs mb-1">Ghi chú:</span> <span className="italic">{selected.notes}</span></div>}
                </div>
              </div>

              {/* Đơn thuốc */}
              {selected.prescription && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h2 className="text-lg font-bold font-heading mb-2 flex items-center gap-2 border-b border-border pb-3">
                    <Pill className="h-5 w-5 text-primary" /> Đơn thuốc chỉ định
                  </h2>
                  <p className="text-sm mt-3 mb-4">Chẩn đoán: <span className="font-bold text-destructive">{selected.prescription.diagnosis}</span></p>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-muted-foreground">
                          <th className="p-3 text-left font-medium">Tên thuốc</th>
                          <th className="p-3 text-left font-medium">Liều dùng</th>
                          <th className="p-3 text-left font-medium">Tần suất</th>
                          <th className="p-3 text-left font-medium">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.prescription.medications.map((med, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-3 font-medium text-primary">{med.name}</td>
                            <td className="p-3">{med.dosage}</td>
                            <td className="p-3">{med.frequency}</td>
                            <td className="p-3">{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selected.prescription.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground italic border-l-2 border-primary">
                      Lời dặn: {selected.prescription.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Chuyển khoa */}
              {selected.referral && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 shadow-card">
                  <h2 className="text-lg font-bold font-heading mb-3 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-accent" /> Chỉ định chuyển khoa
                  </h2>
                  <div className="grid gap-3 text-sm sm:grid-cols-2 bg-background p-4 rounded-lg border border-accent/20">
                    <div><span className="text-muted-foreground">Từ khoa:</span> <span className="font-medium ml-1">{selected.referral.fromDepartment}</span></div>
                    <div><span className="text-muted-foreground">Đến khoa:</span> <span className="font-medium ml-1 text-accent">{selected.referral.toDepartment}</span></div>
                    <div><span className="text-muted-foreground">BS chuyển:</span> <span className="font-medium ml-1">{selected.referral.fromDoctor}</span></div>
                    <div><span className="text-muted-foreground">BS nhận:</span> <span className="font-medium ml-1">{selected.referral.toDoctor || 'Chưa phân công'}</span></div>
                    <div className="sm:col-span-2 mt-1 pt-2 border-t border-border/50"><span className="text-muted-foreground">Lý do chuyển:</span> <span className="font-medium text-destructive ml-1">{selected.referral.reason}</span></div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                      Đặt lịch khám khoa mới <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HistoryPage;