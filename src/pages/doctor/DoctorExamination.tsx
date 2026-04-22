import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import {
  getLichHenCuaToi,
  luuKetQuaKham,
  getBenhNhanDetail,
  getKhoaList,
  getKetQuaKhamCuaBenhNhan,
} from "../../services/doctorService";
import {
  Stethoscope, User, Clock, Search,
  Send, ArrowRightLeft, ClipboardList, CheckCircle2,
  Loader2, ArrowUpDown, ChevronUp, ChevronDown,
} from "lucide-react";

interface LichHenItem {
  idLichHen: string;
  idBenhNhan: string;
  gioHen: string;
  trangThai: string;
  tenBenhNhan: string;
  tuoi: number | null;
  sdt: string;
  benhNen: string | null;
  tenKhoa: string;
}

interface BenhNhanDetail {
  idBenhNhan: string;
  hoTen: string;
  tuoi: number | null;
  gioiTinh: string;
  sdt: string;
  benhNen: string | null;
  soBaoHiem: string | null;
  lichSuGanNhat: { chanDoan: string; ngayKham: string } | null;
}

interface KetQuaKham {
  idLichSu: string;
  ngayKham: string;
  chanDoan: string;
  huongDieuTri: string | null;
  tenBacSi: string;
}

interface Khoa { idKhoa: string; tenKhoa: string; }

type SortField = "gioHen" | "trangThai";
type SortDir   = "asc" | "desc";

const STATUS_ORDER: Record<string, number> = {
  "Đã đến":     0,
  "Hoàn thành": 1,
  "Chờ khám":   2,
};

const DoctorExamination = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const idBacSi: string = currentUser?.idBacSi || "";
  const hoTen: string   = currentUser?.hoTen   || "Bác sĩ";

  const paramLichHen  = searchParams.get("lichHen")  || "";
  const paramBenhNhan = searchParams.get("benhNhan") || "";

  // ── List state ──────────────────────────────────────────
  const [list,       setList]       = useState<LichHenItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField,  setSortField]  = useState<SortField>("gioHen");
  const [sortDir,    setSortDir]    = useState<SortDir>("asc");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // ── Dialog state ────────────────────────────────────────
  const [selectedItem,    setSelectedItem]    = useState<LichHenItem | null>(null);
  const [benhNhanDetail,  setBenhNhanDetail]  = useState<BenhNhanDetail | null>(null);
  const [ketQuaDaKham,    setKetQuaDaKham]    = useState<KetQuaKham | null>(null);
  const [loadingDetail,   setLoadingDetail]   = useState(false);
  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [isViewMode,      setIsViewMode]      = useState(false); // true = xem kết quả, false = nhập mới

  // ── Form state ──────────────────────────────────────────
  const [chanDoan,     setChanDoan]     = useState("");
  const [huongDieuTri, setHuongDieuTri] = useState("");
  const [khoaTiepTheo, setKhoaTiepTheo] = useState("none");
  const [submitting,   setSubmitting]   = useState(false);

  const [khoaList, setKhoaList] = useState<Khoa[]>([]);

  // ── Fetch list ──────────────────────────────────────────
  const fetchList = () => {
    if (!idBacSi) { setLoading(false); return; }
    getLichHenCuaToi(idBacSi)
      .then((res) => setList(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, [idBacSi]);

  useEffect(() => {
    getKhoaList()
      .then((res) => setKhoaList(res.data || []))
      .catch(console.error);
  }, []);

  // ── Auto-open từ URL params ─────────────────────────────
  useEffect(() => {
    if (!paramLichHen || !paramBenhNhan) return;
    const found = list.find((l) => l.idLichHen === paramLichHen);
    const tempItem: LichHenItem = found ?? {
      idLichHen: paramLichHen, idBenhNhan: paramBenhNhan,
      gioHen: "", trangThai: "Đã đến", tenBenhNhan: "...",
      tuoi: null, sdt: "", benhNen: null, tenKhoa: "",
    };
    openDialog(tempItem);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramLichHen, paramBenhNhan]);

  // ── Sort & filter ───────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 ml-1" />
      : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const processed = list
    .filter((a) => {
      const matchSearch = a.tenBenhNhan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "all" || a.trangThai === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "gioHen") {
        cmp = a.gioHen.localeCompare(b.gioHen);
      } else {
        const oa = STATUS_ORDER[a.trangThai] ?? 99;
        const ob = STATUS_ORDER[b.trangThai] ?? 99;
        cmp = oa - ob;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  // ── Open dialog ─────────────────────────────────────────
  const openDialog = async (item: LichHenItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
    setLoadingDetail(true);
    setKetQuaDaKham(null);
    setBenhNhanDetail(null);

    const isCompleted = item.trangThai === "Hoàn thành";
    setIsViewMode(isCompleted);

    // Reset form nếu nhập mới
    if (!isCompleted) {
      setChanDoan(""); setHuongDieuTri(""); setKhoaTiepTheo("none");
    }

    try {
      const [detailRes, ketQuaRes] = await Promise.all([
        getBenhNhanDetail(item.idBenhNhan),
        isCompleted ? getKetQuaKhamCuaBenhNhan(item.idBenhNhan) : Promise.resolve(null),
      ]);
      setBenhNhanDetail(detailRes.data);
      if (isCompleted && ketQuaRes) setKetQuaDaKham(ketQuaRes.data);
    } catch {
      setBenhNhanDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setBenhNhanDetail(null);
    setKetQuaDaKham(null);
    if (paramLichHen) navigate("/doctor/examination", { replace: true });
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!chanDoan.trim()) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập chẩn đoán", variant: "destructive" });
      return;
    }
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await luuKetQuaKham({
        idLichHen:    selectedItem.idLichHen,
        chanDoan,
        huongDieuTri: huongDieuTri || null,
        idBacSi,
        khoaTiepTheo: khoaTiepTheo !== "none" ? khoaTiepTheo : null,
      });

      toast({
        title: "Đã lưu kết quả khám",
        description: khoaTiepTheo !== "none"
          ? "Đã chuyển bệnh nhân sang khoa tiếp theo"
          : `Hoàn tất khám cho ${selectedItem.tenBenhNhan}`,
      });

      closeDialog();
      fetchList();
      toast({
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể lưu kết quả khám",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────
  const stats = [
    { label: "Chờ khám",   value: list.filter((a) => a.trangThai === "Đã đến").length,     icon: Clock,        color: "text-warning" },
    { label: "Hoàn thành", value: list.filter((a) => a.trangThai === "Hoàn thành").length, icon: CheckCircle2, color: "text-success" },
  ];

  return (
    <SidebarLayout role="doctor">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">👨‍⚕️</span>
        <div>
          <h1 className="text-2xl font-bold">{hoTen}</h1>
          <p className="text-muted-foreground text-sm">Danh sách bệnh nhân chờ khám hôm nay</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card border-0">
            <CardContent className="flex items-center gap-3 p-5">
              <div className={`p-2 rounded-xl bg-secondary ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm bệnh nhân..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Đã đến">Chờ khám</SelectItem>
            <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
            Bệnh nhân hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th
                    className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleSort("gioHen")}
                  >
                    <span className="flex items-center">Giờ hẹn <SortIcon field="gioHen" /></span>
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khoa</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bệnh nền</th>
                  <th
                    className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleSort("trangThai")}
                  >
                    <span className="flex items-center">Trạng thái <SortIcon field="trangThai" /></span>
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /><span>Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : processed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Stethoscope className="w-10 h-10 text-muted-foreground/40" />
                        <p>{searchTerm ? "Không tìm thấy bệnh nhân" : "Không có bệnh nhân hôm nay"}</p>
                        {!searchTerm && <p className="text-xs">Bệnh nhân cần được check-in trước</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  processed.map((item) => {
                    const isCompleted = item.trangThai === "Hoàn thành";
                    return (
                      <tr key={item.idLichHen} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{item.tenBenhNhan}</p>
                              {item.tuoi && <p className="text-xs text-muted-foreground">{item.tuoi} tuổi • {item.sdt}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium">{item.gioHen?.slice(0, 5)}</td>
                        <td className="p-4 text-sm">{item.tenKhoa}</td>
                        <td className="p-4 text-sm text-muted-foreground max-w-[140px] truncate">{item.benhNen || "—"}</td>
                        <td className="p-4">
                          {isCompleted ? (
                            <Badge className="gap-1 bg-success/10 text-success border-success/20">
                              <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="w-3 h-3" /> {item.trangThai}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          {isCompleted ? (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openDialog(item)}>
                              <ClipboardList className="w-3.5 h-3.5" /> Xem kết quả
                            </Button>
                          ) : (
                            <Button size="sm" className="gap-1.5" onClick={() => openDialog(item)}>
                              <Stethoscope className="w-3.5 h-3.5" /> Khám
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isViewMode
                ? <><ClipboardList className="w-5 h-5 text-success" /> Kết quả khám — {selectedItem?.tenBenhNhan}</>
                : <><Stethoscope className="w-5 h-5 text-primary" /> Khám bệnh — {selectedItem?.tenBenhNhan}</>
              }
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedItem?.gioHen?.slice(0, 5)} • {selectedItem?.tenKhoa}
            </p>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Thông tin bệnh nhân */}
            <Card className="border bg-secondary/30">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" /> Thông tin bệnh nhân
                </h3>
                {loadingDetail ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                  </div>
                ) : benhNhanDetail ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-muted-foreground">Họ tên:</span> {benhNhanDetail.hoTen}</p>
                    <p><span className="text-muted-foreground">Tuổi:</span> {benhNhanDetail.tuoi ?? "—"}</p>
                    <p><span className="text-muted-foreground">Giới tính:</span> {benhNhanDetail.gioiTinh}</p>
                    <p><span className="text-muted-foreground">SĐT:</span> {benhNhanDetail.sdt}</p>
                    <p><span className="text-muted-foreground">Bảo hiểm:</span> {benhNhanDetail.soBaoHiem ?? "—"}</p>
                    <p><span className="text-muted-foreground">Bệnh nền:</span> {benhNhanDetail.benhNen ?? "—"}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không tải được thông tin bệnh nhân</p>
                )}
              </CardContent>
            </Card>

            {/* ── VIEW MODE: Hiển thị kết quả đã khám ── */}
            {isViewMode ? (
              loadingDetail ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải kết quả...
                </div>
              ) : ketQuaDaKham ? (
                <Card className="border border-success/20 bg-success/5">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="font-semibold text-sm text-success">Đã khám — {ketQuaDaKham.ngayKham}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Chẩn đoán</p>
                        <p className="font-medium">{ketQuaDaKham.chanDoan}</p>
                      </div>
                      {ketQuaDaKham.huongDieuTri && (
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Hướng điều trị</p>
                          <p>{ketQuaDaKham.huongDieuTri}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground pt-1 border-t">
                        Bác sĩ ký: {ketQuaDaKham.tenBacSi}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-sm text-muted-foreground">Không tìm thấy kết quả khám</p>
              )
            ) : (
              /* ── EDIT MODE: Form nhập kết quả ── */
              <>
                <div className="space-y-2">
                  <Label className="font-semibold">
                    Chẩn đoán <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="Nhập chẩn đoán bệnh..."
                    value={chanDoan}
                    onChange={(e) => setChanDoan(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Hướng điều trị</Label>
                  <Textarea
                    placeholder="Phác đồ điều trị, thuốc, tái khám..."
                    value={huongDieuTri}
                    onChange={(e) => setHuongDieuTri(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4" /> Chuyển khoa (tuỳ chọn)
                  </Label>
                  <Select value={khoaTiepTheo} onValueChange={setKhoaTiepTheo}>
                    <SelectTrigger>
                      <SelectValue placeholder="— Không chuyển khoa —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Không chuyển khoa —</SelectItem>
                      {khoaList
                        .filter((k) => k.idKhoa !== currentUser?.idKhoa)
                        .map((k) => (
                          <SelectItem key={k.idKhoa} value={k.idKhoa}>{k.tenKhoa}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>Đóng</Button>
            {!isViewMode && (
              <Button onClick={handleSubmit} disabled={submitting} className="gradient-primary text-primary-foreground gap-1.5">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
                  : <><Send className="w-4 h-4" /> Hoàn tất khám</>
                }
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default DoctorExamination;
