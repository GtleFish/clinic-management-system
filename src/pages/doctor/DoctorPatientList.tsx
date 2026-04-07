import SidebarLayout from "../../components/layout/SidebarLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { sampleAppointments } from "../../data/mockData";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const DoctorPatientList = () => {
  // Sửa doc1 thành BS-001
  const apts = sampleAppointments.filter((a) => a.doctorId === "BS-001");

  return (
    <SidebarLayout role="doctor">
      <h1 className="text-2xl font-bold mb-6">Danh sách bệnh nhân</h1>
      <Card className="shadow-card border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Bệnh nhân</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Ngày khám</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Giờ</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Trạng thái</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {apts.map((apt) => {
                  return (
                    <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold">{apt.patientName}</p>
                      </td>
                      <td className="p-4 text-sm">{apt.date}</td>
                      <td className="p-4 text-sm">{apt.time}</td>
                      <td className="p-4">
                        <Badge variant={apt.status === "completed" ? "default" : "outline"}>
                          {apt.status === "completed" ? "Hoàn thành" : apt.status === "confirmed" ? "Đã xác nhận" : "Chờ"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Link to={`/doctor/prescribe?appointment=${apt.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <FileText className="w-3 h-3" /> Kê đơn
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
};

export default DoctorPatientList;