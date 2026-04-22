import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, CalendarCheck, Shield, Users, BarChart3 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const cards = [
  {
    title: "Quản lý tài khoản bác sĩ",
    desc: "Tạo, cập nhật và phân quyền tài khoản bác sĩ theo khoa.",
    icon: Users,
    path: "/admin/doctors",
    action: "Đi tới quản lý bác sĩ",
  },
  {
    title: "Quản lý bệnh nhân",
    desc: "Tra cứu hồ sơ bệnh nhân và theo dõi thông tin cơ bản.",
    icon: Shield,
    path: "/admin/patients",
    action: "Đi tới quản lý bệnh nhân",
  },
  {
    title: "Check-in vận hành",
    desc: "Xử lý check-in, cập nhật trạng thái và điều phối lịch khám.",
    icon: CalendarCheck,
    path: "/admin/checkin",
    action: "Đi tới check-in",
  },
  {
    title: "Báo cáo thống kê",
    desc: "Xem báo cáo doanh thu, số bệnh nhân và hiệu suất bác sĩ.",
    icon: BarChart3,
    path: "/admin/report",
    action: "Đi tới báo cáo",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Activity className="h-3.5 w-3.5" /> KHU VỰC QUẢN TRỊ
          </div>
          <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Chào mừng quản trị viên quay lại hệ thống Clinic Management.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={card.path}
                className="block rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-heading text-lg font-semibold">{card.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
                <p className="mt-4 text-sm font-medium text-primary">{card.action}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
