import { useState } from 'react';
import { Calendar, FileText, ArrowRight, Pill, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { sampleAppointments } from '@/data/mockData';
import { Appointment } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-info/10 text-info' },
  'in-progress': { label: 'Đang khám', className: 'bg-primary/10 text-primary' },
  completed: { label: 'Hoàn thành', className: 'bg-success/10 text-success' },
  cancelled: { label: 'Đã hủy', className: 'bg-destructive/10 text-destructive' },
};

const HistoryPage = () => {
  const [selected, setSelected] = useState<Appointment | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-heading mb-6">Lịch sử khám bệnh</h1>

        {!selected ? (
          <div className="space-y-3">
            {sampleAppointments.map((apt, i) => {
              const status = statusMap[apt.status];
              return (
                <motion.button
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(apt)}
                  className="w-full rounded-xl border border-border bg-card p-5 text-left shadow-card transition-all hover:shadow-elevated"
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
                    <span className="font-medium text-foreground">{apt.totalFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {apt.prescription && <span className="flex items-center gap-1 text-xs text-primary"><Pill className="h-3 w-3" /> Có đơn thuốc</span>}
                    {apt.referral && <span className="flex items-center gap-1 text-xs text-accent"><Share2 className="h-3 w-3" /> Có chuyển khoa</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4 gap-1 text-sm">
              ← Quay lại danh sách
            </Button>

            <div className="space-y-4">
              {/* Appointment info */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-heading">Chi tiết lịch khám</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusMap[selected.status].className}`}>
                    {statusMap[selected.status].label}
                  </span>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><span className="text-muted-foreground">Bác sĩ:</span> <span className="font-medium">{selected.doctorName}</span></div>
                  <div><span className="text-muted-foreground">Khoa:</span> <span className="font-medium">{selected.departmentName}</span></div>
                  <div><span className="text-muted-foreground">Ngày:</span> <span className="font-medium">{selected.date}</span></div>
                  <div><span className="text-muted-foreground">Giờ:</span> <span className="font-medium">{selected.time}</span></div>
                  <div><span className="text-muted-foreground">Cọc:</span> <span className="font-medium">{selected.deposit.toLocaleString('vi-VN')}đ</span></div>
                  <div><span className="text-muted-foreground">Tổng phí:</span> <span className="font-bold text-primary">{selected.totalFee.toLocaleString('vi-VN')}đ</span></div>
                  {selected.notes && <div className="sm:col-span-2"><span className="text-muted-foreground">Ghi chú:</span> <span>{selected.notes}</span></div>}
                </div>
              </div>

              {/* Prescription */}
              {selected.prescription && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h2 className="text-lg font-bold font-heading mb-1 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" /> Đơn thuốc
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">Chẩn đoán: <span className="font-medium text-foreground">{selected.prescription.diagnosis}</span></p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="pb-2 text-left font-medium">Thuốc</th>
                          <th className="pb-2 text-left font-medium">Liều dùng</th>
                          <th className="pb-2 text-left font-medium">Tần suất</th>
                          <th className="pb-2 text-left font-medium">Thời gian</th>
                          <th className="pb-2 text-left font-medium">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.prescription.medications.map((med, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="py-2 font-medium">{med.name}</td>
                            <td className="py-2">{med.dosage}</td>
                            <td className="py-2">{med.frequency}</td>
                            <td className="py-2">{med.duration}</td>
                            <td className="py-2 text-muted-foreground">{med.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selected.prescription.notes && (
                    <p className="mt-3 text-sm text-muted-foreground italic">📝 {selected.prescription.notes}</p>
                  )}
                </div>
              )}

              {/* Referral */}
              {selected.referral && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 shadow-card">
                  <h2 className="text-lg font-bold font-heading mb-3 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-accent" /> Chuyển khoa
                  </h2>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div><span className="text-muted-foreground">Từ khoa:</span> <span className="font-medium">{selected.referral.fromDepartment}</span></div>
                    <div><span className="text-muted-foreground">Đến khoa:</span> <span className="font-medium">{selected.referral.toDepartment}</span></div>
                    <div><span className="text-muted-foreground">BS chuyển:</span> <span className="font-medium">{selected.referral.fromDoctor}</span></div>
                    <div><span className="text-muted-foreground">BS nhận:</span> <span className="font-medium">{selected.referral.toDoctor || 'Chưa xác định'}</span></div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Lý do:</span> <span>{selected.referral.reason}</span></div>
                  </div>
                  <div className="mt-4">
                    <Button size="sm" className="gradient-primary text-primary-foreground gap-2">
                      Đặt lịch khám chuyển khoa <ArrowRight className="h-4 w-4" />
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
