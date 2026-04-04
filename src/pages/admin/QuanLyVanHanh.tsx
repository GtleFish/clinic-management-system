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

function isChoKham(trangThai: string): boolean {
  return ['cho_kham', 'Chờ khám'].includes(trangThai);
}

function isDaDat(trangThai: string): boolean {
  return ['da_dat', 'Đã đặt lịch', 'Đã xác nhận'].includes(trangThai);
}

// Format khung giờ đẹp
function formatKhungGio(gioHen: string): string {
  if (!gioHen) return '';

  if (gioHen.startsWith('07:00')) return '07:00 - 09:00';
  if (gioHen.startsWith('09:00')) return '09:00 - 11:00';
  if (gioHen.startsWith('13:00')) return '13:00 - 15:00';
  if (gioHen.startsWith('15:00')) return '15:00 - 17:00';
  if (gioHen.startsWith('17:00')) return '17:00 (Cuối ca)';

  return gioHen.length > 8 ? gioHen : gioHen.slice(0, 5);
}

// Tính phút trễ
function getMinutesLate(gioHen: string): number {
  if (!gioHen) return 0;

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
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lateDialog, setLateDialog] = useState<LichHen | null>(null);

  // Fetch
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

  useEffect(() => {
    fetchLichHen();
  }, [fetchLichHen]);

  // Toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Filter
  const filtered = useMemo(() => {
    return lichHenList
      .filter(
        (a) =>
          isDaDat(a.trangThai) ||
          isChoKham(a.trangThai) ||
          a.trangThai === 'hoan_thanh' ||
          a.trangThai === 'huy'
      )
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

  // Stats
  const stats = useMemo(
    () => ({
      total: lichHenList.length,
      checkedIn: lichHenList.filter((a) => isChoKham(a.trangThai)).length,
      late: lichHenList.filter(
        (a) => isChoKham(a.trangThai) && getMinutesLate(a.gioHen) > 30
      ).length,
      waiting: lichHenList.filter((a) => isDaDat(a.trangThai)).length,
    }),
    [lichHenList]
  );

  // Handlers
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
      showToast('error', 'Không thể check-in');
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
      showToast('error', 'Không thể hủy');
    }
  };

  const handleMoveToEnd = async (id: string) => {
    try {
      await doiLichXuongCuoi(id);
      showToast('success', 'Đã dời xuống cuối');
      fetchLichHen();
    } catch {
      showToast('error', 'Không thể dời');
    }
  };

  // Status UI (fix bug thứ tự)
  const renderStatus = (lh: LichHen) => {
    const late = getMinutesLate(lh.gioHen);

    if (lh.trangThai === 'hoan_thanh')
      return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">✓ Hoàn thành</span>;

    if (lh.trangThai === 'huy')
      return <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Đã hủy</span>;

    if (isChoKham(lh.trangThai) && late > 30)
      return <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">⚠ Trễ</span>;

    if (isChoKham(lh.trangThai))
      return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Đang chờ khám</span>;

    if (isDaDat(lh.trangThai))
      return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">Đã đặt lịch</span>;

    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quản lý Check-in</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm kiếm..."
        className="border px-3 py-2 mb-4"
      />

      <table className="w-full border">
        <tbody>
          {filtered.map((lh) => (
            <tr key={lh.idLichHen}>
              <td>{formatKhungGio(lh.gioHen)}</td>
              <td>{lh.hoTenBenhNhan}</td>
              <td>{renderStatus(lh)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}