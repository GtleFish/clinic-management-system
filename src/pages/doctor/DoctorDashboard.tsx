import SidebarLayout from "../../components/layout/SidebarLayout";
import { Card, CardContent } from "../../components/ui/card";
import { sampleAppointments, doctors } from "../../data/mockData";
import { Users, CalendarCheck, Clock, Stethoscope } from "lucide-react";

const DoctorDashboard = () => {
  // Đổi "doc1" thành "BS-001" cho khớp với Database của team
  const currentDoctor = doctors.find(d => d.id === "BS-001");
  const todayApts = sampleAppointments.filter((a) => a.doctorId === "BS-001");
  
  const stats = [
    { label: "Bệnh nhân hôm nay", value: todayApts.length, icon: Users, color: "text-primary" },
    { label: "Đã khám", value: todayApts.filter((a) => a.status === "completed").length, icon: CalendarCheck, color: "text-success" },
    { label: "Đang chờ", value: todayApts.filter((a) => a.status === "confirmed" || a.status === "pending").length, icon: Clock, color: "text-warning" },
    { label: "Đang khám", value: todayApts.filter((a) => a.status === "in-progress").length, icon: Stethoscope, color: "text-accent" },
  ];

  return (
    <SidebarLayout role="doctor">
      <h1 className="text-2xl font-bold mb-6">Xin chào, {currentDoctor?.name} 👨‍⚕️</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card border-0">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`p-3 rounded-xl bg-secondary ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-card border-0">
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg mb-4">Lịch khám hôm nay</h2>
          <div className="space-y-3">
            {todayApts.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div>
                  <p className="font-semibold">{apt.patientName}</p>
                  <p className="text-sm text-muted-foreground">{apt.time} • {apt.departmentName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apt.status === "completed" ? "bg-success/10 text-success" :
                  apt.status === "confirmed" ? "bg-accent/10 text-accent" :
                  "bg-warning/10 text-warning"
                }`}>
                  {apt.status === "completed" ? "Hoàn thành" : apt.status === "confirmed" ? "Đã xác nhận" : "Chờ"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
};

export default DoctorDashboard;