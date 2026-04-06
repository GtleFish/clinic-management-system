import { useState, useEffect } from 'react';
import { Calendar, Pill, Share2, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Appointment } from '../types';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getPatientHistory } from '../services/patientService';

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-info/10 text-info' },
  'in-progress': { label: 'Đang chờ khám', className: 'bg-primary/10 text-primary' },
  completed: { label: 'Hoàn thành', className: 'bg-success/10 text-success' },
  cancelled: { label: 'Đã hủy', className: 'bg-destructive/10 text-destructive' },
};

const HistoryPage = () => {
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    const currentUser = JSON.parse(userStr);

    // GỌI API LẤY LỊCH SỬ KHÁM TỪ DATABASE
    getPatientHistory(currentUser.username)
      .then(res => {
        // Biến đổi dữ liệu từ Backend thành dạng mà giao diện hiểu được
        const dbAppointments = res.data.map((dbItem: any) => ({
          id: dbItem.idLichHen,
          patientName: currentUser.hoTen,
          doctorName: dbItem.doctorName || 'Chưa phân công',
          departmentName: dbItem.departmentName || 'Phòng khám',
          date: new Date(dbItem.ngayHen).toLocaleDateString('vi-VN'),
          // Gom giờ bắt đầu thành Khung giờ (VD: "07:00:00" -> "07:00 - 09:00")
          time: dbItem.gioHen.slice(0, 5) + ' - ' + String(Number(dbItem.gioHen.slice(0,2)) + 2).padStart(2, '0') + ':00', 
          status: dbItem.trangThai === 'da_dat' ? 'pending' 
                : dbItem.trangThai === 'cho_kham' ? 'in-progress'
                : dbItem.trangThai === 'hoan_thanh' ? 'completed'
                : dbItem.trangThai === 'huy' ? 'cancelled' : 'pending',
          totalFee: 300000, 
          deposit: 120000,
          notes: dbItem.ghiChu
        }));
        
        setAppointments(dbAppointments);
      })
      .catch(error => {
        console.error('Lỗi khi tải lịch sử:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold font-heading mb-6">Lịch sử khám bệnh</h1>

        {!isLoggedIn ? (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-warning mb-3 opacity-80" />
            <h2 className="text-lg font-semibold mb-2">Vui lòng đăng nhập</h2>
            <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để xem lịch sử khám bệnh cá nhân của mình.</p>
            <Button onClick={() => window.location.href = '/login'} className="gradient-primary">
              Đi đến trang Đăng nhập
            </Button>
          </div>
        ) : loading ? (
           <p className="text-center text-muted-foreground py-8">Đang tải dữ liệu từ hệ thống...</p>
        ) : !selected ? (
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
                </motion.button>
              );
            })}
            
            {appointments.length === 0 && (
               <div className="text-center py-12 rounded-xl border border-dashed border-border bg-muted/30">
                 <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                 <p className="text-muted-foreground">Bạn chưa có lịch sử khám bệnh nào trên hệ thống.</p>
               </div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4 gap-1 text-sm hover:bg-muted">
              ← Quay lại danh sách
            </Button>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center justify-between mb-4 pl-2">
                  <h2 className="text-lg font-bold font-heading">Chi tiết lịch khám</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusMap[selected.status]?.className}`}>
                    {statusMap[selected.status]?.label}
                  </span>
                </div>
                <div className="grid gap-4 text-sm sm:grid-cols-2 pl-2">
                  <div><span className="text-muted-foreground block text-xs mb-1">Bệnh nhân:</span> <span className="font-bold text-base">{selected.patientName}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Bác sĩ phụ trách:</span> <span className="font-semibold">{selected.doctorName}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Chuyên khoa:</span> <span className="font-medium">{selected.departmentName}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Ngày khám:</span> <span className="font-medium">{selected.date}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Khung giờ:</span> <span className="font-medium">{selected.time}</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Đã cọc:</span> <span className="font-medium text-success">{selected.deposit.toLocaleString('vi-VN')}đ</span></div>
                  <div><span className="text-muted-foreground block text-xs mb-1">Tổng phí:</span> <span className="font-bold text-primary text-base">{selected.totalFee.toLocaleString('vi-VN')}đ</span></div>
                  {selected.notes && <div className="sm:col-span-2 pt-2 border-t border-border/50"><span className="text-muted-foreground block text-xs mb-1">Ghi chú:</span> <span className="italic">{selected.notes}</span></div>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HistoryPage;