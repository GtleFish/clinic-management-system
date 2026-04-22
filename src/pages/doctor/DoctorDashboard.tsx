import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../../components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Users, CalendarCheck, Clock, CheckCircle2,
  FileCheck, Loader2, Stethoscope, ArrowRight,
} from "lucide-react";
import { getLichHenCuaToi, getKetQuaChoDuyet } from "../../services/doctorService";

interface KetQuaItem {
  idLichSu: string;
  ngayKham: string;
  chanDoan: string;
  huongDieuTri: string | null;
  tenBenhNhan: string;
  tenBacSiKham: string;
  tenBacSiKy: string;
  isTruongKhoa: boolean;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const idBacSi: string       = currentUser?.idBacSi     || "";
  const hoTen: string         = currentUser?.hoTen       || "Bác sĩ";
  const isTruongKhoa: boolean = !!currentUser?.isTruongKhoa;

  // Thống kê từ lịch hẹn hôm nay
  const [stats, setStats] = useState({
    total: 0, hoanThanh: 0, daDen: 0, daXacNhan: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Kết quả chờ duyệt (trưởng khoa)
  const [ketQuaList,   setKetQuaList]   = useState<KetQuaItem[]>([]);
  const [loadingKetQua, setLoadingKetQua] = useState(false);

  useEffect(() => {
    if (!idBacSi) { setLoadingStats(false); return; }
    getLichHenCuaToi(idBacSi)
      .then((res) => {
        const list = res.data || [];
        setStats({
          total:       list.length,
          hoanThanh:   list.filter((a: any) => a.trangThai === "Hoàn thành").length,
          daDen:       list.filter((a: any) => a.trangThai === "Đã đến").length,
          daXacNhan:   list.filter((a: any) => a.trangThai === "Đã xác nhận").length,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [idBacSi]);

  useEffect(() => {
    if (!isTruongKhoa || !currentUser?.idKhoa) return;
    setLoadingKetQua(true);
    getKetQuaChoDuyet(currentUser.idKhoa)
      .then((res) => setKetQuaList(res.data || []))
      .catch(console.error)
      .finally(() => setLoadingKetQua(false));
  }, [isTruongKhoa, currentUser?.idKhoa]);

  const statCards = [
    { label: "Lịch hẹn hôm nay", value: stats.total,       icon: Users,         color: "text-primary"  },
    { label: "Hoàn thành",       value: stats.hoanThanh,   icon: CheckCircle2,  color: "text-success"  },
    { label: "Chờ khám",         value: stats.daDen,       icon: Clock,         color: "text-warning"  },
    { label: "Đã xác nhận",      value: stats.daXacNhan,   icon: CalendarCheck, color: "text-accent"   },
  ];

  return (
    <SidebarLayout role="doctor">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Xin chào, {hoTen} 👨‍⚕️</h1>
          {isTruongKhoa && (
            <Badge className="mt-1 bg-primary/10 text-primary border-primary/20">
              Trưởng khoa
            </Badge>
          )}
        </div>
        <Button
          className="gap-2 gradient-primary text-primary-foreground"
          onClick={() => navigate("/doctor/examination")}
        >
          <Stethoscope className="w-4 h-4" />
          Vào khám
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-card border-0">
            <CardContent className="flex items-center gap-4 p-6">
              {loadingStats ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className={`p-3 rounded-xl bg-secondary ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab duyệt kết quả — chỉ trưởng khoa */}
      {isTruongKhoa && (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Kết quả khám trong khoa — 7 ngày gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingKetQua ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tải...</span>
              </div>
            ) : ketQuaList.length === 0 ? (
              <p className="text-muted-foreground py-4">Không có kết quả khám nào trong 7 ngày gần nhất.</p>
            ) : (
              <div className="space-y-3">
                {ketQuaList.map((item) => (
                  <div key={item.idLichSu} className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{item.tenBenhNhan}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.ngayKham} • Bác sĩ khám: {item.tenBacSiKham}
                        </p>
                      </div>
                      <Badge variant={item.isTruongKhoa ? "default" : "secondary"}>
                        {item.isTruongKhoa ? "Đã duyệt" : "Chờ duyệt"}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Chẩn đoán:</span> {item.chanDoan}</p>
                      {item.huongDieuTri && (
                        <p><span className="text-muted-foreground">Hướng điều trị:</span> {item.huongDieuTri}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                        Ký bởi: {item.tenBacSiKy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </SidebarLayout>
  );
};

export default DoctorDashboard;
