import SidebarLayout from "../../components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { doctors } from "../../data/mockData";

const DoctorProfile = () => {
  // Tự động tìm thông tin BS-001 (BS Nguyễn Văn An)
  const doctor = doctors.find((d) => d.id === "BS-001") || {
    name: "BS. Nguyễn Văn An",
    specialization: "Tim mạch",
    experience: 15,
    departmentName: "Nội khoa"
  };

  const fields = [
    { label: "Họ và tên", value: doctor.name },
    { label: "Email", value: "an.nguyen@medicare.vn" }, // Email và phone tạm giữ vì mockData gốc chưa có
    { label: "Số điện thoại", value: "0987654321" },
    { label: "Chuyên khoa", value: doctor.specialization },
    { label: "Số năm kinh nghiệm", value: `${doctor.experience} năm` },
    { label: "Khoa", value: doctor.departmentName },
  ];

  return (
    <SidebarLayout role="doctor">
      <h1 className="text-2xl font-bold mb-6">Hồ sơ bác sĩ</h1>
      <Card className="shadow-card border-0 max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-4xl">👨‍⚕️</div>
            <div>
              <h2 className="text-xl font-bold">{doctor.name}</h2>
              <p className="text-muted-foreground">{doctor.departmentName} • {doctor.specialization}</p>
              <Badge variant="secondary" className="mt-1">{doctor.experience} năm kinh nghiệm</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label} className="space-y-1">
                <p className="text-sm text-muted-foreground">{f.label}</p>
                <p className="font-medium">{f.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
};

export default DoctorProfile;