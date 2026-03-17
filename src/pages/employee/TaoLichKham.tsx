import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Search, Clock, User, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLichHen, createLichHen, getBacSiList, getBenhNhan } from '@/services/employeeService';

// ── Types ──────────────────────────────────────────────────
interface LichHen {
  idLichHen: string; ngayHen: string; gioHen: string; trangThai: string;
  tenBenhNhan: string; sdtBenhNhan: string;
  tenBacSi: string; tenKhoa: string; ghiChu: string | null;
}
interface BacSi { idBacSi: string; hoTen: string; chuyenKhoa: string; tenKhoa: string; }
interface BenhNhan { idBenhNhan: string; hoTen: string; sdt: string; }
interface FormData {
  idBenhNhan: string; idBacSi: string;
  ngayHen: string; gioHen: string; ghiChu: string;
}
interface FormErrors { [k: string]: string; }

const EMPTY: FormData = { idBenhNhan: '', idBacSi: '', ngayHen: '', gioHen: '', ghiChu: '' };

const GIO_KHAM = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

const STATUS_COLOR: Record<string, string> = {
  'Đã đặt lịch':  'bg-blue-100 text-blue-700',
  'Đã xác nhận':  'bg-green-100 text-green-700',
  'Đã đến':       'bg-purple-100 text-purple-700',
  'Chờ khám':     'bg-yellow-100 text-yellow-700',
  'Hoàn thành':   'bg-gray-100 text-gray-600',
  'Hủy':          'bg-red-100 text-red-600',
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

  const openForm = () => { setForm(EMPTY); setErrors({}); setBnSearch(''); setShowForm(true); };
  const closeForm = () => { setShowForm(false); };

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
            { label: 'Chờ khám', value: lichList.filter(l => l.trangThai === 'Chờ khám').length },
            { label: 'Đã xác nhận', value: lichList.filter(l => l.trangThai === 'Đã xác nhận').length },
            { label: 'Hoàn thành', value: lichList.filter(l => l.trangThai === 'Hoàn thành').length },
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
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[lh.trangThai] || 'bg-gray-100 text-gray-600'}`}>
                    {lh.trangThai}
                  </span>
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={bnSearch} onChange={e => { setBnSearch(e.target.value); set('idBenhNhan', ''); }}
                      placeholder="Tìm theo tên hoặc SĐT..."
                      className={`pl-9 ${errors.idBenhNhan ? 'border-destructive' : ''}`} />
                  </div>
                  {/* Dropdown bệnh nhân */}
                  {benhNhanList.length > 0 && !form.idBenhNhan && (
                    <div className="border border-border rounded-lg mt-1 bg-background shadow-card overflow-hidden">
                      {benhNhanList.map(bn => (
                        <button key={bn.idBenhNhan} type="button"
                          onClick={() => { set('idBenhNhan', bn.idBenhNhan); setBnSearch(`${bn.hoTen} — ${bn.sdt}`); setBenhNhanList([]); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 border-b border-border last:border-0 transition-colors">
                          <span className="font-medium">{bn.hoTen}</span>
                          <span className="text-muted-foreground ml-2">{bn.sdt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {form.idBenhNhan && (
                    <p className="text-xs text-green-600 mt-1">✅ Đã chọn bệnh nhân</p>
                  )}
                  {errors.idBenhNhan && <p className="text-destructive text-xs mt-1">{errors.idBenhNhan}</p>}
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

                {/* Ngày + Giờ */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Ngày khám <span className="text-destructive">*</span>
                    </label>
                    <Input type="date" value={form.ngayHen}
                      min={new Date().toISOString().slice(0,10)}
                      onChange={e => set('ngayHen', e.target.value)}
                      className={errors.ngayHen ? 'border-destructive' : ''} />
                    {errors.ngayHen && <p className="text-destructive text-xs mt-1">{errors.ngayHen}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Giờ khám <span className="text-destructive">*</span>
                    </label>
                    <Select value={form.gioHen} onValueChange={v => set('gioHen', v)}>
                      <SelectTrigger className={errors.gioHen ? 'border-destructive' : ''}>
                        <SelectValue placeholder="-- Chọn giờ --" />
                      </SelectTrigger>
                      <SelectContent>
                        {GIO_KHAM.map(g => (
                          <SelectItem key={g} value={`${g}:00`}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gioHen && <p className="text-destructive text-xs mt-1">{errors.gioHen}</p>}
                  </div>
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