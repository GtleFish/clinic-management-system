import { useState } from "react";
import SidebarLayout from "../../components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { sampleAppointments, doctors, departments } from "../../data/mockData";
import { type Appointment } from "../../types";
import { useToast } from "../../hooks/use-toast";
import {
  Stethoscope, User, Clock, CalendarCheck, Search,
  Send, ArrowRightLeft, ClipboardList, AlertCircle, CheckCircle2
} from "lucide-react";

// Sửa doc1 thành BS-001 cho đúng mã team
const currentDoctor = doctors.find((d) => d.id === "BS-001")!;

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  pending: { label: "Chờ khám", variant: "outline", icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: "Đã xác nhận", variant: "secondary", icon: <CalendarCheck className="w-3 h-3" /> },
  "in-progress": { label: "Đang khám", variant: "default", icon: <Stethoscope className="w-3 h-3" /> },
  completed: { label: "Hoàn thành", variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled: { label: "Đã hủy", variant: "destructive", icon: <AlertCircle className="w-3 h-3" /> },
};

const DoctorExamination = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [transferDept, setTransferDept] = useState("");
  const [transferDoctor, setTransferDoctor] = useState("");

  const doctorAppointments = sampleAppointments.filter(
    (a) => a.doctorId === currentDoctor.id && a.departmentName === currentDoctor.departmentName
  );

  const filteredAppointments = doctorAppointments.filter((a) =>
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const waitingCount = filteredAppointments.filter((a) => a.status === "pending" || a.status === "confirmed").length;
  const inProgressCount = filteredAppointments.filter((a) => a.status === "in-progress").length;
  const completedCount = filteredAppointments.filter((a) => a.status === "completed").length;

  const openExam = (apt: Appointment) => {
    setSelectedApt(apt);
    setDiagnosis(apt.prescription?.diagnosis || "");
    const targetDept = apt.referral?.toDepartment;
    setTransferDept(targetDept ? departments.find((d) => d.name === targetDept)?.id || "" : "");
    setTransferDoctor("");
    setExamDialogOpen(true);
  };

  const transferDoctors = transferDept ? doctors.filter((d) => d.departmentId === transferDept && d.id !== currentDoctor.id) : [];

  const handleSubmit = () => {
    toast({
      title: "Đã lưu kết quả khám!",
      description: transferDept
        ? `Chuyển khoa thành công cho bệnh nhân ${selectedApt?.patientName}`
        : `Kết quả khám đã được lưu cho ${selectedApt?.patientName}`,
    });
    setExamDialogOpen(false);
  };

  return (
    <SidebarLayout role="doctor">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">👨‍⚕️</span>
          <div>
            <h1 className="text-2xl font-bold">{currentDoctor.name}</h1>
            <p className="text-muted-foreground text-sm">
              {currentDoctor.departmentName} • {currentDoctor.specialization} • {currentDoctor.experience} năm kinh nghiệm
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card border-0">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{waitingCount}</p>
              <p className="text-xs text-muted-foreground">Đang chờ khám</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">Đang khám</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách bệnh nhân */}
      <Card className="shadow-card border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
              Danh sách lịch hẹn — {currentDoctor.departmentName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Hiển thị bệnh nhân có lịch hẹn tại khoa <span className="font-medium text-foreground">{currentDoctor.departmentName}</span> với <span className="font-medium text-foreground">{currentDoctor.name}</span>
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm bệnh nhân..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bệnh nhân</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày khám</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giờ</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khoa</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chẩn đoán</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Stethoscope className="w-10 h-10 text-muted-foreground/40" />
                        <p>Không có lịch hẹn nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const config = statusConfig[apt.status];
                    return (
                      <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{apt.patientName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{apt.date}</td>
                        <td className="p-4 text-sm font-medium">{apt.time}</td>
                        <td className="p-4 text-sm">{apt.departmentName}</td>
                        <td className="p-4">
                          <Badge variant={config.variant} className="gap-1 text-xs">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground max-w-[160px] truncate">
                          {apt.prescription?.diagnosis || "—"}
                        </td>
                        <td className="p-4">
                          {apt.status !== "completed" && apt.status !== "cancelled" ? (
                            <Button size="sm" onClick={() => openExam(apt)} className="gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5" />
                              Khám
                            </Button>
                          ) : apt.status === "completed" ? (
                            <Button size="sm" variant="outline" onClick={() => openExam(apt)} className="gap-1.5">
                              <ClipboardList className="w-3.5 h-3.5" />
                              Xem
                            </Button>
                          ) : null}
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

      {/* Dialog khám bệnh */}
      <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Khám bệnh — {selectedApt?.patientName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedApt?.date} • {selectedApt?.time} • {selectedApt?.departmentName}
            </p>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {selectedApt && (
              <Card className="border bg-secondary/30">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Thông tin bệnh nhân
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Họ tên:</span> {selectedApt.patientName}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label className="font-semibold">Chẩn đoán</Label>
              <Textarea
                placeholder="Nhập chẩn đoán bệnh..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4" /> Chuyển khoa (tuỳ chọn)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Khoa tiếp nhận</Label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    value={transferDept}
                    onChange={(e) => { setTransferDept(e.target.value); setTransferDoctor(""); }}
                  >
                    <option value="">— Không chuyển khoa —</option>
                    {departments.filter((d) => d.id !== currentDoctor.departmentId).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {transferDept && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bác sĩ tiếp nhận</Label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      value={transferDoctor}
                      onChange={(e) => setTransferDoctor(e.target.value)}
                    >
                      <option value="">— Chọn bác sĩ —</option>
                      {transferDoctors.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setExamDialogOpen(false)}>Đóng</Button>
            <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground gap-1.5">
              <Send className="w-4 h-4" /> Hoàn tất khám
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default DoctorExamination;