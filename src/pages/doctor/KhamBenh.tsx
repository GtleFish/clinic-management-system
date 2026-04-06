import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getBacSiTruongList,
  getBenhNhanDetail,
  getDanhSachChoKham,
  getKhoaList,
  luuKetQuaKham,
} from "@/services/doctorService";

interface ChoKhamItem {
  idLichHen: string;
  idBenhNhan: string;
  gioHen: string;
  trangThai: string;
  tenBenhNhan: string;
  tuoi?: number;
  sdt?: string;
  benhNen?: string;
  tenKhoa?: string;
}

interface Khoa {
  idKhoa: string;
  tenKhoa: string;
}

interface BacSiTruong {
  idBacSiTruong: string;
  hoTen: string;
}

interface BenhNhanDetail {
  hoTen: string;
  tuoi?: number;
  gioiTinh?: string;
  sdt?: string;
  benhNen?: string;
}

const defaultForm = {
  trieuChung: "",
  chanDoan: "",
  huongDieuTri: "",
  idBacSiTruong: "",
  khoaTiepTheo: "",
};

export default function KhamBenh() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<ChoKhamItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [benhNhanDetail, setBenhNhanDetail] = useState<BenhNhanDetail | null>(null);
  const [khoaList, setKhoaList] = useState<Khoa[]>([]);
  const [bacSiTruongList, setBacSiTruongList] = useState<BacSiTruong[]>([]);
  const [form, setForm] = useState(defaultForm);

  const idBacSi = localStorage.getItem("idBacSi") || "BS-TEST";

  const selected = useMemo(
    () => list.find((item) => item.idLichHen === selectedId) || null,
    [list, selectedId],
  );

  const fetchDanhSach = async () => {
    setLoading(true);
    try {
      const res = await getDanhSachChoKham(idBacSi, date);
      setList(res.data || []);
      if (!res.data?.some((item: ChoKhamItem) => item.idLichHen === selectedId)) {
        setSelectedId("");
      }
    } catch {
      toast({ title: "Không thể tải danh sách chờ khám", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDanhSach();
  }, [date]);

  useEffect(() => {
    getKhoaList().then((res) => setKhoaList(res.data || [])).catch(() => setKhoaList([]));
    getBacSiTruongList().then((res) => setBacSiTruongList(res.data || [])).catch(() => setBacSiTruongList([]));
  }, []);

  useEffect(() => {
    if (!selected?.idBenhNhan) {
      setBenhNhanDetail(null);
      return;
    }
    getBenhNhanDetail(selected.idBenhNhan)
      .then((res) => setBenhNhanDetail(res.data || null))
      .catch(() => setBenhNhanDetail(null));
  }, [selected?.idBenhNhan]);

  const setField = (key: keyof typeof defaultForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (isChiDinhKhoa: boolean) => {
    if (!selected) return;
    if (!form.trieuChung.trim() || !form.chanDoan.trim() || !form.idBacSiTruong) {
      toast({
        title: "Thiếu thông tin bắt buộc",
        description: "Vui lòng nhập triệu chứng, chẩn đoán và bác sĩ trưởng",
        variant: "destructive",
      });
      return;
    }

    if (isChiDinhKhoa && !form.khoaTiepTheo) {
      toast({
        title: "Chưa chọn khoa tiếp theo",
        description: "Hãy chọn khoa trước khi chỉ định",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await luuKetQuaKham({
        idLichHen: selected.idLichHen,
        trieuChung: form.trieuChung,
        chanDoan: form.chanDoan,
        huongDieuTri: form.huongDieuTri || null,
        idBacSiTruong: form.idBacSiTruong,
        khoaTiepTheo: isChiDinhKhoa ? form.khoaTiepTheo : undefined,
      });
      toast({
        title: "Đã lưu kết quả khám",
        className: "bg-primary text-primary-foreground border-none",
      });
      setForm(defaultForm);
      setSelectedId("");
      setBenhNhanDetail(null);
      fetchDanhSach();
    } catch {
      toast({ title: "Không thể lưu kết quả khám", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="mb-4">
              <div className="mb-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                US-DOC-02
              </div>
              <h1 className="text-xl font-bold font-heading">Danh sách chờ khám</h1>
            </div>

            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-4" />

            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="rounded-lg border border-border bg-background p-6 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Không có bệnh nhân chờ khám</p>
              </div>
            ) : (
              <div className="space-y-2">
                {list.map((item, index) => (
                  <button
                    key={item.idLichHen}
                    onClick={() => setSelectedId(item.idLichHen)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedId === item.idLichHen
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {index + 1}. {item.tenBenhNhan}
                      </p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {item.trangThai}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.gioHen?.slice(0, 5)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <Stethoscope className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Chọn bệnh nhân để bắt đầu khám</p>
                </motion.div>
              ) : (
                <motion.div
                  key={selected.idLichHen}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <h2 className="font-heading text-lg font-semibold">{benhNhanDetail?.hoTen || selected.tenBenhNhan}</h2>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <p>Tuổi: {benhNhanDetail?.tuoi ?? selected.tuoi ?? "—"}</p>
                      <p>Giới tính: {benhNhanDetail?.gioiTinh || "—"}</p>
                      <p>SĐT: {benhNhanDetail?.sdt || selected.sdt || "—"}</p>
                      <p>Bệnh nền: {benhNhanDetail?.benhNen || selected.benhNen || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Triệu chứng *</label>
                      <textarea
                        value={form.trieuChung}
                        onChange={(e) => setField("trieuChung", e.target.value)}
                        placeholder="Mô tả triệu chứng bệnh nhân..."
                        rows={3}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Chẩn đoán tạm thời *</label>
                      <textarea
                        value={form.chanDoan}
                        onChange={(e) => setField("chanDoan", e.target.value)}
                        placeholder="Chẩn đoán ban đầu..."
                        rows={3}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Hướng điều trị</label>
                      <textarea
                        value={form.huongDieuTri}
                        onChange={(e) => setField("huongDieuTri", e.target.value)}
                        rows={3}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Bác sĩ trưởng khoa phụ trách *</label>
                        <Select value={form.idBacSiTruong} onValueChange={(v) => setField("idBacSiTruong", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn bác sĩ trưởng" />
                          </SelectTrigger>
                          <SelectContent>
                            {bacSiTruongList.map((item) => (
                              <SelectItem key={item.idBacSiTruong} value={item.idBacSiTruong}>
                                {item.hoTen}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">Chỉ định khoa tiếp theo (optional)</label>
                        <Select value={form.khoaTiepTheo || "none"} onValueChange={(v) => setField("khoaTiepTheo", v === "none" ? "" : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Không chỉ định" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Không chỉ định</SelectItem>
                            {khoaList.map((khoa) => (
                              <SelectItem key={khoa.idKhoa} value={khoa.idKhoa}>
                                {khoa.tenKhoa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        disabled={saving}
                        onClick={() => submit(true)}
                      >
                        Chỉ định khoa khác
                      </Button>
                      <Button
                        disabled={saving}
                        className="gradient-primary text-primary-foreground"
                        onClick={() => submit(false)}
                      >
                        Hoàn tất khám
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
