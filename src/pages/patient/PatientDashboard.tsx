import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, FileText, User } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Đặt lịch khám", desc: "Chọn khoa, bác sĩ và thời gian", icon: Calendar, to: "/booking" },
  { title: "Lịch sử khám", desc: "Xem lịch hẹn đã đặt", icon: Calendar, to: "/history" },
  { title: "Lịch sử chẩn đoán", desc: "Kết quả khám và đơn thuốc", icon: FileText, to: "/patient/lich-su-kham" },
  { title: "Hồ sơ cá nhân", desc: "Cập nhật thông tin", icon: User, to: "/profile" },
];

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="mb-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Bệnh nhân
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary">Trang dành cho bệnh nhân</h1>
          <p className="mt-1 text-muted-foreground">Chọn chức năng bên dưới để tiếp tục.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-heading font-semibold">{item.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.desc}</p>
                <Button asChild className="mt-4 w-full sm:w-auto gradient-primary text-primary-foreground">
                  <Link to={item.to}>Mở</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
