import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTatCaLichHen,
  checkInLichHen,
  huyLichHen,
  doiLichXuongCuoi,
} from '../../services/adminService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────
interface LichHen {
  idLichHen: string;
  ngayHen: string;
  gioHen: string;
  trangThai: 'da_dat' | 'cho_kham' | 'hoan_thanh' | 'huy' | string;
  hoTenBenhNhan: string;
  soDienThoai: string;
  hoTenBacSi: string;
  tenKhoa: string;
}

// ── Helpers ────────────────────────────────────────────────
function isChoKham(trangThai: string): boolean {
  return ['cho_kham', 'Chờ khám'].includes(trangThai);
}
function isDaDat(trangThai: string): boolean {
  return ['da_dat', 'Đã đặt lịch', 'Đã xác nhận'].includes(trangThai);
}

function formatKhungGio(gioHen: string): string {
  if (!gioHen) return '';
  if (gioHen.startsWith('07:00')) return '07:00 - 09:00';
  if (gioHen.startsWith('09:00')) return '09:00 - 11:00';
  if (gioHen.startsWith('13:00')) return '13:00 - 15:00';
  if (gioHen.startsWith('15:00')) return '15:00 - 17:00';
  if (gioHen.startsWith('17:00')) return '17:00 (Cuối ca)';
  return gioHen.length > 8 ? gioHen : gioHen.slice(0, 5);
}

// FIX 1: Đưa Date() vào trong hàm để lấy giờ thực tế tại thời điểm gọi
function getMinutesLate(gioHen: string): number {
  if (!gioHen) return 0;
  const startTimeStr = gioHen.split('-')[0].trim().slice(0, 5);
  const [h, m] = startTimeStr.split(':').map(Number);
  
  if (isNaN(h) || isNaN(m)) return 0;

  const apt = new Date();
  apt.setHours(h, m, 0, 0);
  
  const currentTime = new Date(); 
  return Math.floor((currentTime.getTime() - apt.getTime()) / 60000);
}

// ── Component ──────────────────────────────────────────────
export default function QuanLyVanHanh() {
  const [lichHenList, setLichHenList] = useState<LichHen[]>([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lateDialog, setLateDialog]   = useState<LichHen | null>(null);
  const navigate = useNavigate();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ─────────────────────────────────────────────────
  const fetchLichHen = useCallback(async (isPolling: boolean = false) => {
    if (!isPolling) setLoading(true);
    try {
      const res = await getTatCaLichHen();
      let data = Array.isArray(res) ? res : (res?.data || []);

      // Lọc ra các ca trễ chưa khám
      const lateAppointments = data.filter((lh: LichHen) => 
        isDaDat(lh.trangThai) && getMinutesLate(lh.gioHen) > 30
      );

      if (lateAppointments.length > 0) {
        // Gọi API hủy
        await Promise.all(lateAppointments.map((lh: LichHen) => huyLichHen(lh.idLichHen)));
        
        // Cập nhật lại data mới
        const newRes = await getTatCaLichHen();
        data = Array.isArray(newRes) ? newRes : (newRes?.data || []);
        
        // FIX 2: Bỏ điều kiện !isPolling để thông báo luôn hiện lên khi có ca bị hủy tự động
        showToast('success', `Hệ thống vừa tự động hủy ${lateAppointments.length} lịch hẹn trễ > 30 phút!`);
      }

      setLichHenList(data);
    } catch {
      if (!isPolling) showToast('error', 'Không thể tải danh sách lịch hẹn');
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchLichHen(); 
    const intervalId = setInterval(() => { fetchLichHen(true); }, 60000);
    return () => clearInterval(intervalId);
  }, [fetchLichHen]);

  // ── Filter & Stats ────────────────────────────────────────
  const filtered = useMemo(() => {
    return lichHenList
      .filter((a) => {
        return isDaDat(a.trangThai) || isChoKham(a.trangThai) || a.trangThai === 'hoan_thanh' || a.trangThai === 'huy' || a.trangThai === 'Hủy';
      })
      .filter((a) => {
        const q = search.toLowerCase();
        const matchSearch = (a.hoTenBenhNhan || '').toLowerCase().includes(q) || (a.soDienThoai && a.soDienThoai.includes(search));
        const matchStatus = filterStatus === 'all' || (filterStatus === 'da_dat' && isDaDat(a.trangThai)) || (filterStatus === 'cho_kham' && isChoKham(a.trangThai)) || (filterStatus === 'huy' && (a.trangThai === 'huy' || a.trangThai === 'Hủy'));
        return matchSearch && matchStatus;
      });
  }, [lichHenList, search, filterStatus]);

  const stats = useMemo(() => ({
    total: lichHenList.length,
    checkedIn: lichHenList.filter((a) => isChoKham(a.trangThai)).length,
    // FIX 3: Thống kê số ca đã bị hủy do trễ (trạng thái là hủy VÀ phút trễ > 30)
    late: lichHenList.filter((a) => 
      (a.trangThai === 'huy' || a.trangThai === 'Hủy') && getMinutesLate(a.gioHen) > 30
    ).length,
    waiting: lichHenList.filter((a) => isDaDat(a.trangThai)).length,
  }), [lichHenList]);

  // ── Handlers ──────────────────────────────────────────────
  const handleCheckIn = async (lh: LichHen) => {
    if (getMinutesLate(lh.gioHen) > 30) {
      setLateDialog(lh);
      return;
    }
    try {
      await checkInLichHen(lh.idLichHen);
      showToast('success', 'Check-in thành công!');
      fetchLichHen();
    } catch {
      showToast('error', 'Lỗi check-in');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Xác nhận hủy lịch hẹn này?')) return;
    try {
      await huyLichHen(id);
      showToast('success', 'Đã hủy lịch hẹn');
      fetchLichHen();
    } catch {
      showToast('error', 'Lỗi khi hủy');
    } finally {
      setLateDialog(null);
    }
  };

  const renderStatus = (lh: LichHen) => {
    if (lh.trangThai === 'hoan_thanh') return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">✓ Hoàn thành</span>;
    if (lh.trangThai === 'huy' || lh.trangThai === 'Hủy') return <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Đã hủy</span>;
    if (isChoKham(lh.trangThai)) return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Đang chờ khám</span>;
    if (isDaDat(lh.trangThai)) return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Đã đặt lịch</span>;
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Check-in</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống tự động hủy các lịch hẹn trễ 30 phút</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng lịch hẹn',  value: stats.total,     color: 'bg-blue-50 text-blue-700',   icon: '📋' },
          { label: 'Đã check-in',    value: stats.checkedIn, color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Đã hủy do trễ',  value: stats.late,      color: 'bg-amber-50 text-amber-700', icon: '⚠️' },
          { label: 'Đang chờ khám',  value: stats.waiting,   color: 'bg-gray-50 text-gray-700',   icon: '🕐' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 flex items-center gap-3 ${s.color}`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên hoặc SĐT..." className="border border-gray-300 rounded-md px-3 py-2 text-sm w-72" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
          <option value="all">Tất cả</option>
          <option value="da_dat">Đã đặt lịch</option>
          <option value="cho_kham">Chờ khám</option>
          <option value="huy">Đã hủy</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Khung giờ</th>
              <th className="text-left px-4 py-3">Ngày</th>
              <th className="text-left px-4 py-3">Bệnh nhân</th>
              <th className="text-left px-4 py-3">SĐT</th>
              <th className="text-left px-4 py-3">Bác sĩ</th>
              <th className="text-left px-4 py-3">Khoa</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10">Không có dữ liệu</td></tr>
            ) : (
              filtered.map((lh) => (
                <tr key={lh.idLichHen} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">🕐 {formatKhungGio(lh.gioHen)}</td>
                  <td className="px-4 py-3">{new Date(lh.ngayHen).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 font-semibold">{lh.hoTenBenhNhan}</td>
                  <td className="px-4 py-3">{lh.soDienThoai}</td>
                  <td className="px-4 py-3">{lh.hoTenBacSi}</td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">{lh.tenKhoa}</span></td>
                  <td className="px-4 py-3">{renderStatus(lh)}</td>
                  <td className="px-4 py-3 text-right">
                    {isDaDat(lh.trangThai) && (
                      <button onClick={() => handleCheckIn(lh)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700">✓ Check-in</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg text-sm text-white shadow-lg z-50 animate-bounce ${toast.type === 'success' ? 'bg-orange-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {lateDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-amber-600">⚠️ Bệnh nhân đến trễ</h2>
            <p className="text-sm text-gray-500 my-4">Bệnh nhân {lateDialog.hoTenBenhNhan} đã trễ {getMinutesLate(lateDialog.gioHen)} phút.</p>
            <div className="flex gap-2">
              <button onClick={() => setLateDialog(null)} className="flex-1 border py-2 rounded-lg text-sm">Đóng</button>
              <button onClick={() => handleCancel(lateDialog.idLichHen)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm">Hủy lịch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}