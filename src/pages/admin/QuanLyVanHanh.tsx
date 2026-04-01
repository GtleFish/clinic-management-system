import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTatCaLichHen,
  checkInLichHen,
  huyLichHen,
  doiLichXuongCuoi,
} from '../../services/adminService';

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
const now = new Date();

// Nhận diện trạng thái "chờ khám" dù DB lưu tiếng Việt hay tiếng Anh
function isChoKham(trangThai: string): boolean {
  return ['cho_kham', 'Chờ khám'].includes(trangThai);
}
function isDaDat(trangThai: string): boolean {
  return ['da_dat', 'Đã đặt lịch', 'Đã xác nhận'].includes(trangThai);
}

// CHUYỂN ĐỔI GIỜ TỪ DB THÀNH KHUNG GIỜ HIỂN THỊ
function formatKhungGio(gioHen: string): string {
  if (!gioHen) return '';
  // Nếu DB đang lưu kiểu "09:00:00" hoặc "09:00-11:00"
  if (gioHen.startsWith('07:00')) return '07:00 - 09:00';
  if (gioHen.startsWith('09:00')) return '09:00 - 11:00';
  if (gioHen.startsWith('13:00')) return '13:00 - 15:00';
  if (gioHen.startsWith('15:00')) return '15:00 - 17:00';
  // Nếu là giờ dời xuống cuối ngày
  if (gioHen.startsWith('17:00')) return '17:00 (Cuối ca)';
  return gioHen.length > 8 ? gioHen : gioHen.slice(0, 5);
}

// TÍNH PHÚT TRỄ DỰA TRÊN GIỜ BẮT ĐẦU CỦA KHUNG GIỜ
function getMinutesLate(gioHen: string): number {
  if (!gioHen) return 0;
  // Lấy giờ bắt đầu (VD: từ "09:00-11:00" hoặc "09:00:00" -> lấy "09:00")
  const startTimeStr = gioHen.split('-')[0].trim().slice(0, 5);
  const [h, m] = startTimeStr.split(':').map(Number);
  
  if (isNaN(h) || isNaN(m)) return 0;

  const apt = new Date();
  apt.setHours(h, m, 0, 0);
  return Math.floor((now.getTime() - apt.getTime()) / 60000);
}

// ── Component ──────────────────────────────────────────────
export default function QuanLyVanHanh() {
  const [lichHenList, setLichHenList] = useState<LichHen[]>([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lateDialog, setLateDialog]   = useState<LichHen | null>(null);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchLichHen = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTatCaLichHen();
      setLichHenList(res.data);
    } catch {
      showToast('error', 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLichHen(); }, [fetchLichHen]);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filter ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return lichHenList
      .filter((a) => {
        return isDaDat(a.trangThai) || isChoKham(a.trangThai) || a.trangThai === 'hoan_thanh' || a.trangThai === 'huy';
      })
      .filter((a) => {
        const q = search.toLowerCase();
  
        const matchSearch =
          a.hoTenBenhNhan.toLowerCase().includes(q) ||
          (a.soDienThoai && a.soDienThoai.includes(search));
  
        const matchStatus =
          filterStatus === 'all' ||
          (filterStatus === 'da_dat' && isDaDat(a.trangThai)) ||
          (filterStatus === 'cho_kham' && isChoKham(a.trangThai));
  
        return matchSearch && matchStatus;
      });
  }, [lichHenList, search, filterStatus]);

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: lichHenList.length,
    checkedIn: lichHenList.filter((a) => isChoKham(a.trangThai)).length,
    late: lichHenList.filter(
      (a) => isChoKham(a.trangThai) && getMinutesLate(a.gioHen) > 30
    ).length,
    waiting: lichHenList.filter((a) => isDaDat(a.trangThai)).length,
  }), [lichHenList]);

  // ── Handlers ──────────────────────────────────────────────
  const handleCheckIn = (lh: LichHen) => {
    if (getMinutesLate(lh.gioHen) > 30) {
      setLateDialog(lh);
      return;
    }
    confirmCheckIn(lh.idLichHen);
  };

  const confirmCheckIn = async (id: string) => {
    try {
      await checkInLichHen(id);
      showToast('success', 'Check-in thành công!');
      fetchLichHen();
    } catch {
      showToast('error', 'Không thể check-in, vui lòng thử lại');
    } finally {
      setLateDialog(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Xác nhận hủy lịch hẹn này?')) return;
    try {
      await huyLichHen(id);
      showToast('success', 'Đã hủy lịch hẹn');
      fetchLichHen();
    } catch {
      showToast('error', 'Không thể hủy lịch hẹn');
    } finally {
      setLateDialog(null);
    }
  };

  const handleMoveToEnd = async (id: string) => {
    try {
      await doiLichXuongCuoi(id);
      showToast('success', 'Đã dời lịch xuống cuối danh sách');
      fetchLichHen();
    } catch {
      showToast('error', 'Không thể dời lịch hẹn');
    } finally {
      setLateDialog(null);
    }
  };

  // ── Status badge ──────────────────────────────────────────
  const renderStatus = (lh: LichHen) => {
    const late = getMinutesLate(lh.gioHen);
  
    if (lh.trangThai === 'hoan_thanh')
      return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">✓ Hoàn thành</span>;
  
    if (lh.trangThai === 'huy')
      return <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Đã hủy</span>;
  
    if (isChoKham(lh.trangThai))
      return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Đang chờ khám</span>;
  
    if (isDaDat(lh.trangThai))
      return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Đã đặt lịch</span>;
  
    if (isChoKham(lh.trangThai) && late > 30)
      return <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">⚠ Trễ</span>;
  
    return null;
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Check-in</h1>
        <p className="text-sm text-gray-500 mt-1">Xác nhận check-in bệnh nhân hôm nay</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng lịch hẹn',  value: stats.total,     color: 'bg-blue-50 text-blue-700',   icon: '📋' },
          { label: 'Đã check-in',    value: stats.checkedIn, color: 'bg-green-50 text-green-700', icon: '✅' },
          { label: 'Đến trễ >30p',   value: stats.late,      color: 'bg-amber-50 text-amber-700', icon: '⚠️' },
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

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc SĐT..."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <option value="all">Tất cả</option>
            <option value="da_dat">Đã đặt lịch</option>
            <option value="cho_kham">Chờ khám</option>
            <option value="hoan_thanh">Hoàn thành</option>
            <option value="huy">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Khung giờ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ngày</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bệnh nhân</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">SĐT</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bác sĩ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Khoa</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">Đang tải...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">Không có lịch hẹn nào</td>
              </tr>
            ) : (
              filtered.map((lh) => {
                const isLate = isChoKham(lh.trangThai) && getMinutesLate(lh.gioHen) > 30;
                return (
                  <tr
                    key={lh.idLichHen}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${isLate ? 'bg-amber-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      🕐 {formatKhungGio(lh.gioHen)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                        {new Date(lh.ngayHen).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{lh.hoTenBenhNhan}</td>
                    <td className="px-4 py-3 text-gray-600">{lh.soDienThoai}</td>
                    <td className="px-4 py-3 text-gray-700">{lh.hoTenBacSi}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {lh.tenKhoa}
                      </span>
                    </td>
                    <td className="px-4 py-3">{renderStatus(lh)}</td>
                    <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">

                            {/* ✅ Check-in: chỉ khi da_dat */}
                            {isDaDat(lh.trangThai) && (
                            <button
                                onClick={() => handleCheckIn(lh)}
                                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
                            >
                                ✓ Check-in
                            </button>
                            )}

                            {/* ✅ Hủy: da_dat + cho_kham */}
                            {(isDaDat(lh.trangThai) || isChoKham(lh.trangThai)) && (
                            <button
                                onClick={() => handleCancel(lh.idLichHen)}
                                className="bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium"
                            >
                                Hủy
                            </button>
                            )}

                            {/* 🟦 Chờ khám */}
                            {isChoKham(lh.trangThai) && (
                            <span className="text-blue-600 text-xs font-medium py-1.5">
                                Đang chờ khám
                            </span>
                            )}

                            {/* 🟩 Hoàn thành */}
                            {(lh.trangThai === 'da_kham' || lh.trangThai === 'hoan_thanh') && (
                            <span className="text-green-600 text-xs font-medium">
                                ✓ Hoàn tất
                            </span>
                            )}

                            {/* 🟥 Hủy */}
                            {lh.trangThai === 'huy' && (
                            <span className="text-red-400 text-xs font-medium">
                                Đã hủy
                            </span>
                            )}
                        </div>
                        </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
            Tổng: {filtered.length} lịch hẹn
          </div>
        )}
      </div>

      {/* Modal: Bệnh nhân đến trễ */}
      {lateDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <span className="text-xl">⚠️</span>
              <h2 className="text-lg font-semibold">Cảnh báo: Bệnh nhân đến trễ</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Bệnh nhân đã trễ hơn 30 phút so với giờ hẹn. Vui lòng chọn cách xử lý.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-2 text-sm mb-5">
              <div><span className="text-gray-500">Bệnh nhân:</span> <strong>{lateDialog.hoTenBenhNhan}</strong></div>
              <div><span className="text-gray-500">SĐT:</span> {lateDialog.soDienThoai}</div>
              <div><span className="text-gray-500">Giờ hẹn:</span> {formatKhungGio(lateDialog.gioHen)}</div>
              <div>
                <span className="text-gray-500">Trễ:</span>{' '}
                <strong className="text-amber-600">{getMinutesLate(lateDialog.gioHen)} phút</strong>
              </div>
              <div><span className="text-gray-500">Bác sĩ:</span> {lateDialog.hoTenBacSi}</div>
              <div><span className="text-gray-500">Khoa:</span> {lateDialog.tenKhoa}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setLateDialog(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => handleCancel(lateDialog.idLichHen)}
                className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm hover:bg-red-100 font-medium"
              >
                Hủy lịch hẹn
              </button>
              <button
                onClick={() => handleMoveToEnd(lateDialog.idLichHen)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 font-medium"
              >
                Dời cuối DS
              </button>
              <button
                onClick={() => confirmCheckIn(lateDialog.idLichHen)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 font-medium"
              >
                Vẫn check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg text-sm text-white shadow-lg z-50
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}