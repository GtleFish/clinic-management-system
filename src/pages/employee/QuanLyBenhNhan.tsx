import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Users, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getBenhNhan, createBenhNhan, updateBenhNhan } from '@/services/employeeService';

// ── Types ──────────────────────────────────────────────────
interface BenhNhan {
  idBenhNhan: string; hoTen: string; cccd: string;
  gioiTinh: string; ngaySinh: string; tuoi: number | null;
  sdt: string; gmail: string | null;
  soBaoHiem: string | null; benhNen: string | null;
}
interface FormData {
  hoTen: string; cccd: string; gioiTinh: string; ngaySinh: string;
  sdt: string; gmail: string; soBaoHiem: string; benhNen: string; tuoi: string;
}
interface FormErrors { [k: string]: string; }

const EMPTY: FormData = {
  hoTen: '', cccd: '', gioiTinh: '', ngaySinh: '',
  sdt: '', gmail: '', soBaoHiem: '', benhNen: '', tuoi: '',
};

// ── Validation ─────────────────────────────────────────────
function validate(f: FormData, isEdit: boolean): FormErrors {
  const e: FormErrors = {};
  if (!f.hoTen.trim())   e.hoTen   = 'Họ tên không được để trống';
  if (!isEdit && !f.cccd.trim()) e.cccd = 'CCCD không được để trống';
  if (!isEdit && f.cccd && !/^\d{12}$/.test(f.cccd)) e.cccd = 'CCCD phải gồm 12 chữ số';
  if (!f.gioiTinh)       e.gioiTinh = 'Vui lòng chọn giới tính';
  if (!f.ngaySinh)       e.ngaySinh = 'Ngày sinh không được để trống';
  if (!f.sdt.trim())     e.sdt     = 'Số điện thoại không được để trống';
  if (f.sdt && !/^0\d{9}$/.test(f.sdt)) e.sdt = 'SĐT không hợp lệ (10 số, bắt đầu 0)';
  if (f.gmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.gmail)) e.gmail = 'Email không hợp lệ';
  return e;
}

// ══════════════════════════════════════════════════════════
export default function QuanLyBenhNhan() {
  const [list,        setList]        = useState<BenhNhan[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editData,    setEditData]    = useState<BenhNhan | null>(null);
  const [form,        setForm]        = useState<FormData>(EMPTY);
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [formLoading, setFormLoading] = useState(false);
  const [toast,       setToast]       = useState<{ type: 'success'|'error'; msg: string } | null>(null);
  const [detailItem,  setDetailItem]  = useState<BenhNhan | null>(null);

  const isEdit = Boolean(editData);

  // ── Fetch (AC3) ────────────────────────────────────────
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBenhNhan(search);
      setList(res.data);
    } catch { notify('error', 'Không thể tải danh sách bệnh nhân'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const notify = (type: 'success'|'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ──────────────────────────────────────────
  const openCreate = () => {
    setEditData(null); setForm(EMPTY); setErrors({}); setShowForm(true);
  };
  const openEdit = (bn: BenhNhan) => {
    setEditData(bn);
    setForm({
      hoTen: bn.hoTen, cccd: bn.cccd, gioiTinh: bn.gioiTinh,
      ngaySinh: bn.ngaySinh, sdt: bn.sdt,
      gmail: bn.gmail || '', soBaoHiem: bn.soBaoHiem || '',
      benhNen: bn.benhNen || '', tuoi: bn.tuoi ? String(bn.tuoi) : '',
    });
    setErrors({}); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditData(null); };

  const set = (k: keyof FormData, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setFormLoading(true);
    try {
      if (isEdit && editData) {
        await updateBenhNhan(editData.idBenhNhan, form);
        notify('success', 'Cập nhật thông tin bệnh nhân thành công');
      } else {
        await createBenhNhan(form);
        notify('success', 'Thêm bệnh nhân thành công');
      }
      closeForm(); fetch();
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Có lỗi xảy ra');
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
              <Users className="h-3.5 w-3.5" /> US-EMP-01
            </div>
            <h1 className="text-3xl font-bold font-heading">Quản lý Bệnh nhân</h1>
            <p className="mt-1 text-muted-foreground">Thêm mới, chỉnh sửa và tìm kiếm thông tin bệnh nhân</p>
          </div>
          <Button onClick={openCreate} className="gradient-primary text-primary-foreground gap-2 shadow-hero">
            <Plus className="h-4 w-4" /> Thêm bệnh nhân
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Tổng bệnh nhân', value: list.length },
            { label: 'Kết quả tìm kiếm', value: list.length },
            { label: 'Hôm nay', value: 0 },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <p className="text-2xl font-bold font-heading text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search (AC3) */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="pl-9" />
          </div>
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">
              {search ? 'Không tìm thấy bệnh nhân phù hợp' : 'Chưa có bệnh nhân nào'}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((bn, i) => (
              <motion.div key={bn.idBenhNhan}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold font-heading">
                      {bn.hoTen.split(' ').pop()?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold font-heading text-sm">{bn.hoTen}</h3>
                      <p className="text-xs text-muted-foreground">{bn.sdt}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setDetailItem(bn)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => openEdit(bn)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CCCD</span>
                    <span className="font-medium">{bn.cccd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giới tính</span>
                    <span className="font-medium">{bn.gioiTinh}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày sinh</span>
                    <span className="font-medium">{new Date(bn.ngaySinh).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {bn.benhNen && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bệnh nền</span>
                      <span className="font-medium text-orange-600 truncate max-w-[120px]">{bn.benhNen}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Form ─────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
                <div>
                  <h2 className="text-lg font-semibold font-heading">
                    {isEdit ? 'Chỉnh sửa bệnh nhân' : 'Thêm bệnh nhân mới'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isEdit ? 'Cập nhật thông tin hồ sơ' : 'Nhập thông tin bệnh nhân đến khám lần đầu'}
                  </p>
                </div>
                <button onClick={closeForm} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Họ tên */}
                <Field label="Họ tên" required error={errors.hoTen}>
                  <Input value={form.hoTen} onChange={e => set('hoTen', e.target.value)}
                    placeholder="Nguyễn Văn A" className={errors.hoTen ? 'border-destructive' : ''} />
                </Field>

                {/* CCCD — chỉ khi tạo mới */}
                {!isEdit && (
                  <Field label="CCCD" required error={errors.cccd}>
                    <Input value={form.cccd} onChange={e => set('cccd', e.target.value)}
                      placeholder="012345678901" maxLength={12}
                      className={errors.cccd ? 'border-destructive' : ''} />
                  </Field>
                )}

                {/* Giới tính + Ngày sinh */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Giới tính" required error={errors.gioiTinh}>
                    <Select value={form.gioiTinh} onValueChange={v => set('gioiTinh', v)}>
                      <SelectTrigger className={errors.gioiTinh ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Ngày sinh" required error={errors.ngaySinh}>
                    <Input type="date" value={form.ngaySinh} onChange={e => set('ngaySinh', e.target.value)}
                      className={errors.ngaySinh ? 'border-destructive' : ''} />
                  </Field>
                </div>

                {/* SĐT + Tuổi */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Số điện thoại" required error={errors.sdt}>
                    <Input value={form.sdt} onChange={e => set('sdt', e.target.value)}
                      placeholder="0901234567"
                      className={errors.sdt ? 'border-destructive' : ''} />
                  </Field>
                  <Field label="Tuổi">
                    <Input type="number" min="0" value={form.tuoi}
                      onChange={e => set('tuoi', e.target.value)} placeholder="35" />
                  </Field>
                </div>

                {/* Gmail */}
                <Field label="Email" error={errors.gmail}>
                  <Input type="email" value={form.gmail} onChange={e => set('gmail', e.target.value)}
                    placeholder="email@gmail.com"
                    className={errors.gmail ? 'border-destructive' : ''} />
                </Field>

                {/* Số bảo hiểm */}
                <Field label="Số bảo hiểm y tế">
                  <Input value={form.soBaoHiem} onChange={e => set('soBaoHiem', e.target.value)}
                    placeholder="BH123456789" />
                </Field>

                {/* Bệnh nền */}
                <Field label="Bệnh nền / Tiền sử bệnh">
                  <textarea value={form.benhNen} onChange={e => set('benhNen', e.target.value)}
                    placeholder="VD: Tiểu đường type 2, huyết áp cao..."
                    rows={3}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </Field>

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={closeForm} className="flex-1">Hủy</Button>
                  <Button type="submit" disabled={formLoading} className="flex-1 gradient-primary text-primary-foreground">
                    {formLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm bệnh nhân'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal chi tiết ─────────────────────────────── */}
      <AnimatePresence>
        {detailItem && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
              className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold font-heading">Hồ sơ bệnh nhân</h2>
                <button onClick={() => setDetailItem(null)} className="rounded-lg p-1.5 hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-3 text-sm">
                {[
                  ['Họ tên', detailItem.hoTen],
                  ['CCCD', detailItem.cccd],
                  ['Giới tính', detailItem.gioiTinh],
                  ['Ngày sinh', new Date(detailItem.ngaySinh).toLocaleDateString('vi-VN')],
                  ['Tuổi', detailItem.tuoi ?? '—'],
                  ['Số điện thoại', detailItem.sdt],
                  ['Email', detailItem.gmail ?? '—'],
                  ['Số bảo hiểm', detailItem.soBaoHiem ?? '—'],
                  ['Bệnh nền', detailItem.benhNen ?? '—'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right max-w-[60%]">{value as string}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-5 flex gap-3">
                <Button variant="outline" onClick={() => setDetailItem(null)} className="flex-1">Đóng</Button>
                <Button onClick={() => { openEdit(detailItem); setDetailItem(null); }}
                  className="flex-1 gradient-primary text-primary-foreground">
                  Chỉnh sửa
                </Button>
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
              ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-destructive-foreground'}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}