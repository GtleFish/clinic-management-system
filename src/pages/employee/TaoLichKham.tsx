import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Search, Clock, User, X, AlertTriangle, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLichHen, createLichHen, getBacSiList, getBenhNhan, createBenhNhan, checkIn } from '@/services/employeeService';
import { getBookingCounts } from '@/services/patientService';

// ── Types ──────────────────────────────────────────────────
interface LichHen {
  idLichHen: string; ngayHen: string; gioHen: string; trangThai: string;
  tenBenhNhan: string; sdtBenhNhan: string;
  tenBacSi: string; tenKhoa: string; ghiChu: string | null;
}
interface BacSi { idBacSi: string; hoTen: string; chuyenKhoa: string; tenKhoa: string; }
interface BenhNhan { idBenhNhan: string; hoTen: string; sdt: string; cccd?: string; }
interface FormData {
  idBenhNhan: string; idBacSi: string;
  ngayHen: string; gioHen: string; ghiChu: string;
}
interface FormErrors { [k: string]: string; }

// Form tạo bệnh nhân mới
interface NewBNForm {
  hoTen: string; cccd: string; gioiTinh: string;
  ngaySinh: string; sdt: string; gmail: string;
  soBaoHiem: string; benhNen: string;
}
const EMPTY_BN: NewBNForm = {
  hoTen: '', cccd: '', gioiTinh: 'Nam',
  ngaySinh: '', sdt: '', gmail: '',
  soBaoHiem: '', benhNen: '',
};

const EMPTY: FormData = { idBenhNhan: '', idBacSi: '', ngayHen: '', gioHen: '', ghiChu: '' };

const TIME_BLOCKS = [
  { id: 'b1', label: '07:00 - 09:00', value: '07:00:00', max: 10 },
  { id: 'b2', label: '09:00 - 11:00', value: '09:00:00', max: 10 },
  { id: 'b3', label: '13:00 - 15:00', value: '13:00:00', max: 10 },
  { id: 'b4', label: '15:00 - 17:00', value: '15:00:00', max: 10 },
];

// --- ĐÃ ĐỒNG BỘ MÀU SẮC VỚI BÊN QUẢN LÝ VẬN HÀNH ---
const STATUS_COLOR: Record<string, string> = {
  // Nhóm Đã đặt lịch / Đã xác nhận (Màu xám/xanh)
  'da_dat':      'bg-blue-100 text-blue-700',
  'Đã đặt lịch': 'bg-blue-100 text-blue-700',
  'Đã xác nhận': 'bg-green-100 text-green-700',

  // Nhóm Chờ khám (Màu vàng)
  'cho_kham':    'bg-yellow-100 text-yellow-700',
  'Chờ khám':    'bg-yellow-100 text-yellow-700',

  // Nhóm Hoàn thành / Đã khám (Màu xám)
  'hoan_thanh':  'bg-gray-100 text-gray-600',
  'Hoàn thành':  'bg-gray-100 text-gray-600',
  'da_kham':     'bg-gray-100 text-gray-600',

  // Nhóm Hủy (Màu đỏ)
  'huy':         'bg-red-100 text-red-600',
  'Hủy':         'bg-red-100 text-red-600',
  'Đã hủy':      'bg-red-100 text-red-600',
};

function validate(f: FormData): FormErrors {
  const e: FormErrors = {};
  if (!f.idBenhNhan) e.idBenhNhan = 'Vui lòng chọn bệnh nhân';
  if (!f.idBacSi)   e.idBacSi   = 'Vui lòng chọn bác sĩ';
  if (!f.ngayHen)   e.ngayHen   = 'Vui lòng chọn ngày khám';
  else if (f.ngayHen < new Date().toISOString().slice(0, 10))
    e.ngayHen = 'Không thể đặt lịch trong quá khứ';
  if (!f.gioHen) e.gioHen = 'Vui lòng chọn giờ khám';
  return e;
}

// ══════════════════════════════════════════════════════════
export default function TaoLichKham() {
  const [lichList,     setLichList]     = useState<LichHen[]>([]);
  const [bacSiList,    setBacSiList]    = useState<BacSi[]>([]);
  const [benhNhanList, setBenhNhanList] = useState<BenhNhan[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState<FormData>(EMPTY);
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [formLoading,  setFormLoading]  = useState(false);
  const [toast,        setToast]        = useState<{ type: 'success'|'error'|'warn'; msg: string } | null>(null);
  const [filterDate,   setFilterDate]   = useState(new Date().toISOString().slice(0, 10));
  const [filterBacSi,  setFilterBacSi]  = useState('all');
  const [bnSearch,     setBnSearch]     = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<LichHen | null>(null);
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});

  // ── State tạo bệnh nhân mới ────────────────────────────
  const [showNewBN,    setShowNewBN]    = useState(false);
  const [newBNForm,    setNewBNForm]    = useState<NewBNForm>(EMPTY_BN);
  const [newBNErrors,  setNewBNErrors]  = useState<Record<string, string>>({});
  const [newBNLoading, setNewBNLoading] = useState(false);
  const [selectedBN,   setSelectedBN]  = useState<BenhNhan | null>(null);

  // ── Fetch ──────────────────────────────────────────────
  const fetchLich = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLichHen({
        date:    filterDate,
        idBacSi: filterBacSi === 'all' ? '' : filterBacSi,
      });
      setLichList(res.data);
    } catch { notify('error', 'Không thể tải danh sách lịch hẹn'); }
    finally { setLoading(false); }
  }, [filterDate, filterBacSi]);

  useEffect(() => { fetchLich(); }, [fetchLich]);
  useEffect(() => { getBacSiList().then(r => setBacSiList(r.data)).catch(() => {}); }, []);

  const notify = (type: 'success'|'error'|'warn', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Tìm bệnh nhân cho autocomplete ────────────────────
  useEffect(() => {
    if (bnSearch.length < 2) { setBenhNhanList([]); return; }
    getBenhNhan(bnSearch).then(r => setBenhNhanList(r.data.slice(0, 8))).catch(() => {});
  }, [bnSearch]);

  const set = (k: keyof FormData, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  // Fetch số chỗ đã đặt khi ngày thay đổi
  useEffect(() => {
    if (!form.ngayHen) { setBookingCounts({}); return; }
    getBookingCounts(form.ngayHen).then(res => {
      const counts: Record<string, number> = {};
      (res.data || []).forEach((item: any) => {
        const timeKey = item.gioHen?.slice(0, 5);
        const block = TIME_BLOCKS.find(b => b.value.startsWith(timeKey));
        if (block) counts[block.value] = Number(item.total);
      });
      setBookingCounts(counts);
    }).catch(() => {});
  }, [form.ngayHen]);

  const openForm = () => {
    setForm(EMPTY); setErrors({}); setBnSearch('');
    setShowNewBN(false); setNewBNForm(EMPTY_BN); setNewBNErrors({});
    setSelectedBN(null); setBenhNhanList([]);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); };
  const openCheckin = (lichHen: LichHen) => {
    setSelectedCheckin(lichHen);
    setCheckinNote(lichHen.ghiChu || '');
    setShowCheckinModal(true);
  };
  const closeCheckin = () => {
    setShowCheckinModal(false);
    setSelectedCheckin(null);
    setCheckinNote('');
  };

  const selectBenhNhan = (bn: BenhNhan) => {
    setSelectedBN(bn);
    set('idBenhNhan', bn.idBenhNhan);
    setBnSearch('');
    setBenhNhanList([]);
    setShowNewBN(false);
  };

  const setNewBN = (k: keyof NewBNForm, v: string) => {
    setNewBNForm(p => ({ ...p, [k]: v }));
    if (newBNErrors[k]) setNewBNErrors(p => ({ ...p, [k]: '' }));
  };

  const validateNewBN = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!newBNForm.hoTen.trim())  e.hoTen  = 'Vui lòng nhập họ tên';
    if (!newBNForm.cccd.trim())   e.cccd   = 'Vui lòng nhập CCCD';
    if (!newBNForm.sdt.trim())    e.sdt    = 'Vui lòng nhập số điện thoại';
    if (!newBNForm.ngaySinh)      e.ngaySinh = 'Vui lòng nhập ngày sinh';
    return e;
  };

  const handleCreateBenhNhan = async () => {
    const errs = validateNewBN();
    if (Object.keys(errs).length) { setNewBNErrors(errs); return; }
    setNewBNLoading(true);
    try {
      const res = await createBenhNhan(newBNForm);
      const created: BenhNhan = res.data;
      notify('success', `Đã tạo bệnh nhân: ${created.hoTen}`);
      selectBenhNhan(created);
      setShowNewBN(false);
      setNewBNForm(EMPTY_BN);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo bệnh nhân';
      notify('error', msg);
    } finally {
      setNewBNLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setFormLoading(true);
    try {
      await createLichHen(form);
      notify('success', 'Tạo lịch khám thành công');
      closeForm(); fetchLich();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.conflict) {
        notify('warn', data.message);
      } else {
        notify('error', data?.message || 'Có lỗi xảy ra');
      }
    } finally { setFormLoading(false); }
  };

  const handleCheckin = async () => {
    if (!selectedCheckin) return;
    setCheckinLoading(true);
    try {
      const res = await checkIn(selectedCheckin.idLichHen, checkinNote);
      if (res?.isDenTre) {
        notify('warn', 'Bệnh nhân đến trễ hơn 30 phút');
      } else {
        notify('success', 'Check-in thành công');
      }
      closeCheckin();
      fetchLich();
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Không thể check-in');
    } finally {
      setCheckinLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Calendar className="h-3.5 w-3.5" /> US-EMP-02
            </div>
            <h1 className="text-3xl font-bold font-heading">Tạo lịch khám tại quầy</h1>
            <p className="mt-1 text-muted-foreground">Hỗ trợ bệnh nhân không đặt lịch trực tuyến</p>
          </div>
          <Button onClick={openForm} className="gradient-primary text-primary-foreground gap-2 shadow-hero">
            <Plus className="h-4 w-4" /> Tạo lịch khám
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Tổng hôm nay', value: lichList.length },
            { label: 'Chờ khám', value: lichList.filter(l => l.trangThai === 'Chờ khám' || l.trangThai === 'cho_kham').length },
            { label: 'Đã xác nhận', value: lichList.filter(l => l.trangThai === 'Đã xác nhận').length },
            { label: 'Hoàn thành', value: lichList.filter(l => l.trangThai === 'Hoàn thành' || l.trangThai === 'hoan_thanh').length },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <p className="text-2xl font-bold font-heading text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="w-44" />
          <Select value={filterBacSi} onValueChange={setFilterBacSi}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Tất cả bác sĩ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bác sĩ</SelectItem>
              {bacSiList.map(bs => (
                <SelectItem key={bs.idBacSi} value={bs.idBacSi}>{bs.hoTen}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Lịch hẹn list (AC3) */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : lichList.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">Chưa có lịch hẹn nào trong ngày này</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {lichList.map((lh, i) => (
              <motion.div key={lh.idLichHen}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 shadow-card hover:shadow-elevated transition-all">
                <div className="flex items-center gap-4">
                  {/* Giờ */}
                  <div className="flex flex-col items-center min-w-[48px]">
                    <Clock className="h-4 w-4 text-primary mb-0.5" />
                    <span className="text-sm font-bold font-heading text-primary">
                      {lh.gioHen.slice(0, 5)}
                    </span>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  {/* Bệnh nhân */}
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-semibold font-heading text-sm">{lh.tenBenhNhan}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{lh.sdtBenhNhan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{lh.tenBacSi}</p>
                    <p className="text-xs text-muted-foreground">{lh.tenKhoa}</p>
                  </div>
                  {['Đã đặt lịch', 'Đã xác nhận', 'da_dat'].includes(lh.trangThai) ? (
                    <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => openCheckin(lh)}>
                      Check-in
                    </Button>
                  ) : (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[lh.trangThai] || 'bg-gray-100 text-gray-600'}`}>
                      {/* Hiển thị tiếng Việt nếu DB lưu mã */}
                      {lh.trangThai === 'cho_kham' ? 'Chờ khám' :
                       lh.trangThai === 'hoan_thanh' ? 'Hoàn thành' :
                       lh.trangThai === 'da_kham' ? 'Hoàn thành' :
                       lh.trangThai === 'huy' ? 'Đã hủy' : lh.trangThai}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Tạo lịch ─────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold font-heading">Tạo lịch khám</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Điền thông tin lịch hẹn cho bệnh nhân</p>
                </div>
                <button onClick={closeForm} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                {/* Tìm bệnh nhân */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Bệnh nhân <span className="text-destructive">*</span>
                  </label>

                  {/* Đã chọn → hiển thị chip + nút đổi */}
                  {selectedBN ? (
                    <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{selectedBN.hoTen}</span>
                        <span className="text-muted-foreground">{selectedBN.sdt}</span>
                      </div>
                      <button type="button" onClick={() => { setSelectedBN(null); set('idBenhNhan', ''); }}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                        Đổi
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Search box */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={bnSearch}
                          onChange={e => { setBnSearch(e.target.value); set('idBenhNhan', ''); setShowNewBN(false); }}
                          placeholder="Tìm theo tên, SĐT hoặc CCCD..."
                          className={`pl-9 ${errors.idBenhNhan ? 'border-destructive' : ''}`}
                        />
                      </div>

                      {/* Kết quả tìm kiếm */}
                      {benhNhanList.length > 0 && (
                        <div className="border border-border rounded-lg mt-1 bg-background shadow-card overflow-hidden">
                          {benhNhanList.map(bn => (
                            <button key={bn.idBenhNhan} type="button"
                              onClick={() => selectBenhNhan(bn)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 border-b border-border last:border-0 transition-colors">
                              <span className="font-medium">{bn.hoTen}</span>
                              <span className="text-muted-foreground ml-2 text-xs">{bn.sdt}</span>
                              {bn.cccd && <span className="text-muted-foreground ml-2 text-xs">CCCD: {bn.cccd}</span>}
                            </button>
                          ))}
                          {/* Nút tạo mới nếu không tìm thấy đúng */}
                          <button type="button"
                            onClick={() => { setShowNewBN(v => !v); setNewBNForm(p => ({ ...p, hoTen: bnSearch })); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-primary/5 flex items-center gap-2 font-medium">
                            <UserPlus className="h-3.5 w-3.5" />
                            Không tìm thấy? Tạo bệnh nhân mới
                          </button>
                        </div>
                      )}

                      {/* Nút tạo mới khi chưa có kết quả */}
                      {bnSearch.length >= 2 && benhNhanList.length === 0 && (
                        <button type="button"
                          onClick={() => { setShowNewBN(v => !v); setNewBNForm(p => ({ ...p, hoTen: bnSearch })); }}
                          className="mt-1 flex items-center gap-1.5 text-xs text-primary hover:underline">
                          <UserPlus className="h-3.5 w-3.5" />
                          Không tìm thấy — Tạo bệnh nhân mới
                          {showNewBN ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}
                    </>
                  )}

                  {errors.idBenhNhan && <p className="text-destructive text-xs mt-1">{errors.idBenhNhan}</p>}

                  {/* Form tạo bệnh nhân mới (inline) */}
                  <AnimatePresence>
                    {showNewBN && !selectedBN && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                          <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                            <UserPlus className="h-3.5 w-3.5" /> Tạo bệnh nhân mới
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <label className="text-xs font-medium mb-1 block">Họ tên <span className="text-destructive">*</span></label>
                              <Input value={newBNForm.hoTen} onChange={e => setNewBN('hoTen', e.target.value)}
                                placeholder="Nguyễn Văn A"
                                className={`h-8 text-sm ${newBNErrors.hoTen ? 'border-destructive' : ''}`} />
                              {newBNErrors.hoTen && <p className="text-destructive text-xs mt-0.5">{newBNErrors.hoTen}</p>}
                            </div>

                            <div>
                              <label className="text-xs font-medium mb-1 block">CCCD <span className="text-destructive">*</span></label>
                              <Input value={newBNForm.cccd} onChange={e => setNewBN('cccd', e.target.value)}
                                placeholder="012345678901"
                                className={`h-8 text-sm ${newBNErrors.cccd ? 'border-destructive' : ''}`} />
                              {newBNErrors.cccd && <p className="text-destructive text-xs mt-0.5">{newBNErrors.cccd}</p>}
                            </div>

                            <div>
                              <label className="text-xs font-medium mb-1 block">SĐT <span className="text-destructive">*</span></label>
                              <Input value={newBNForm.sdt} onChange={e => setNewBN('sdt', e.target.value)}
                                placeholder="0901234567"
                                className={`h-8 text-sm ${newBNErrors.sdt ? 'border-destructive' : ''}`} />
                              {newBNErrors.sdt && <p className="text-destructive text-xs mt-0.5">{newBNErrors.sdt}</p>}
                            </div>

                            <div>
                              <label className="text-xs font-medium mb-1 block">Ngày sinh <span className="text-destructive">*</span></label>
                              <Input type="date" value={newBNForm.ngaySinh} onChange={e => setNewBN('ngaySinh', e.target.value)}
                                className={`h-8 text-sm ${newBNErrors.ngaySinh ? 'border-destructive' : ''}`} />
                              {newBNErrors.ngaySinh && <p className="text-destructive text-xs mt-0.5">{newBNErrors.ngaySinh}</p>}
                            </div>

                            <div>
                              <label className="text-xs font-medium mb-1 block">Giới tính</label>
                              <select value={newBNForm.gioiTinh} onChange={e => setNewBN('gioiTinh', e.target.value)}
                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm">
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-medium mb-1 block">Email</label>
                              <Input value={newBNForm.gmail} onChange={e => setNewBN('gmail', e.target.value)}
                                placeholder="email@gmail.com" className="h-8 text-sm" />
                            </div>

                            <div>
                              <label className="text-xs font-medium mb-1 block">Số bảo hiểm</label>
                              <Input value={newBNForm.soBaoHiem} onChange={e => setNewBN('soBaoHiem', e.target.value)}
                                placeholder="BH123456789" className="h-8 text-sm" />
                            </div>

                            <div className="col-span-2">
                              <label className="text-xs font-medium mb-1 block">Bệnh nền</label>
                              <Input value={newBNForm.benhNen} onChange={e => setNewBN('benhNen', e.target.value)}
                                placeholder="Tiểu đường, huyết áp..." className="h-8 text-sm" />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button type="button" variant="outline" size="sm" className="flex-1"
                              onClick={() => { setShowNewBN(false); setNewBNForm(EMPTY_BN); setNewBNErrors({}); }}>
                              Hủy
                            </Button>
                            <Button type="button" size="sm" className="flex-1 gradient-primary text-primary-foreground"
                              onClick={handleCreateBenhNhan} disabled={newBNLoading}>
                              {newBNLoading ? 'Đang tạo...' : 'Tạo & chọn'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bác sĩ */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Bác sĩ <span className="text-destructive">*</span>
                  </label>
                  <Select value={form.idBacSi} onValueChange={v => set('idBacSi', v)}>
                    <SelectTrigger className={errors.idBacSi ? 'border-destructive' : ''}>
                      <SelectValue placeholder="-- Chọn bác sĩ --" />
                    </SelectTrigger>
                    <SelectContent>
                      {bacSiList.map(bs => (
                        <SelectItem key={bs.idBacSi} value={bs.idBacSi}>
                          {bs.hoTen} — {bs.tenKhoa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.idBacSi && <p className="text-destructive text-xs mt-1">{errors.idBacSi}</p>}
                </div>

                {/* Ngày + Khung giờ */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Ngày khám <span className="text-destructive">*</span>
                  </label>
                  <Input type="date" value={form.ngayHen}
                    min={new Date().toISOString().slice(0,10)}
                    onChange={e => { set('ngayHen', e.target.value); set('gioHen', ''); }}
                    className={errors.ngayHen ? 'border-destructive' : ''} />
                  {errors.ngayHen && <p className="text-destructive text-xs mt-1">{errors.ngayHen}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Khung giờ <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_BLOCKS.map(block => {
                      const booked = bookingCounts[block.value] || 0;
                      const isFull = booked >= block.max;
                      const isSelected = form.gioHen === block.value;
                      const disabled = isFull || !form.ngayHen;
                      return (
                        <button
                          key={block.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => { if (!disabled) set('gioHen', block.value); }}
                          className={`flex flex-col items-center justify-center rounded-lg border p-3 text-sm transition-all
                            ${!form.ngayHen
                              ? 'cursor-not-allowed border-border bg-muted opacity-50'
                              : isFull
                              ? 'cursor-not-allowed border-destructive/30 bg-destructive/5 text-destructive'
                              : isSelected
                              ? 'border-primary bg-primary text-primary-foreground shadow-md'
                              : 'border-border bg-background hover:border-primary hover:bg-primary/5'
                            }`}
                        >
                          <span className="font-semibold">{block.label}</span>
                          <span className={`text-xs mt-0.5 ${
                            isFull ? 'text-destructive font-bold' :
                            isSelected ? 'text-primary-foreground/80' :
                            'text-muted-foreground'
                          }`}>
                            {!form.ngayHen ? '—' : isFull ? 'Đã kín' : `Còn ${block.max - booked} chỗ`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {!form.ngayHen && (
                    <p className="text-xs text-muted-foreground mt-1 italic">Chọn ngày trước để xem khung giờ trống</p>
                  )}
                  {errors.gioHen && <p className="text-destructive text-xs mt-1">{errors.gioHen}</p>}
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ghi chú</label>
                  <textarea value={form.ghiChu} onChange={e => set('ghiChu', e.target.value)}
                    placeholder="VD: Bệnh nhân yêu cầu khám sớm..."
                    rows={2}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={closeForm} className="flex-1">Hủy</Button>
                  <Button type="submit" disabled={formLoading} className="flex-1 gradient-primary text-primary-foreground">
                    {formLoading ? 'Đang lưu...' : 'Tạo lịch khám'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Check-in ───────────────────────────── */}
      <AnimatePresence>
        {showCheckinModal && selectedCheckin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold font-heading">Xác nhận check-in</h2>
                <button onClick={closeCheckin} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="rounded-lg border border-border bg-background p-3 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Bệnh nhân:</span> {selectedCheckin.tenBenhNhan}</p>
                  <p><span className="text-muted-foreground">Giờ hẹn:</span> {selectedCheckin.gioHen.slice(0, 5)}</p>
                  <p><span className="text-muted-foreground">Bác sĩ:</span> {selectedCheckin.tenBacSi}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ghi chú</label>
                  <textarea
                    value={checkinNote}
                    onChange={(e) => setCheckinNote(e.target.value)}
                    rows={3}
                    placeholder="Ghi chú nếu bệnh nhân đến trễ..."
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={closeCheckin}>
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 gradient-primary text-primary-foreground"
                    onClick={handleCheckin}
                    disabled={checkinLoading}
                  >
                    {checkinLoading ? 'Đang xử lý...' : 'Xác nhận check-in'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:20, x:20 }} animate={{ opacity:1, y:0, x:0 }} exit={{ opacity:0, y:20, x:20 }}
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-elevated
              ${toast.type === 'success' ? 'bg-green-600 text-white'
              : toast.type === 'warn'    ? 'bg-orange-500 text-white'
              : 'bg-destructive text-destructive-foreground'}`}>
            {toast.type === 'success' ? '✅' : toast.type === 'warn' ? <AlertTriangle className="h-4 w-4" /> : '❌'}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}