import { Link } from 'react-router-dom';
import { Calendar, Shield, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { departments, doctors } from '@/data/mockData';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const features = [
  { icon: Calendar, title: 'Đặt lịch dễ dàng', desc: 'Chọn khoa, bác sĩ và thời gian phù hợp chỉ trong vài bước' },
  { icon: Shield, title: 'Bảo mật thông tin', desc: 'Dữ liệu y tế được bảo vệ an toàn tuyệt đối' },
  { icon: Clock, title: 'Tiết kiệm thời gian', desc: 'Không cần xếp hàng, đặt cọc trực tuyến nhanh chóng' },
  { icon: Users, title: 'Đội ngũ chuyên gia', desc: 'Hơn 50 bác sĩ chuyên khoa giàu kinh nghiệm' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Star className="h-4 w-4" /> Hệ thống đặt lịch khám #1
            </div>
            <h1 className="text-4xl font-extrabold leading-tight font-heading md:text-5xl lg:text-6xl">
              Đặt lịch khám bệnh{' '}
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                trực tuyến
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Kết nối với đội ngũ bác sĩ chuyên khoa hàng đầu. Đặt lịch, khám bệnh, nhận đơn thuốc — tất cả trong một nền tảng.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/booking">
                <Button size="lg" className="gradient-primary text-primary-foreground gap-2 px-8 shadow-hero">
                  Đặt lịch ngay <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/departments">
                <Button size="lg" variant="outline">Xem khoa khám</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-background p-6 shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold font-heading">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold font-heading">Khoa khám bệnh</h2>
            <p className="mt-2 text-muted-foreground">Đa dạng chuyên khoa đáp ứng mọi nhu cầu</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.slice(0, 8).map((dept, i) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/booking?dept=${dept.id}`}
                  className="block rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1"
                >
                  <h3 className="font-semibold font-heading">{dept.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{dept.description}</p>
                  <p className="mt-3 text-xs text-primary font-medium">{dept.doctorCount} bác sĩ</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top doctors */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold font-heading">Bác sĩ nổi bật</h2>
            <p className="mt-2 text-muted-foreground">Đội ngũ chuyên gia hàng đầu</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.slice(0, 4).map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-background p-5 shadow-card"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {doc.name.split(' ').pop()?.[0]}
                </div>
                <h3 className="font-semibold font-heading text-sm">{doc.title} {doc.name.replace('BS. ', '')}</h3>
                <p className="text-xs text-muted-foreground">{doc.departmentName} • {doc.specialization}</p>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="font-medium">{doc.rating}</span>
                  <span className="text-muted-foreground">({doc.reviewCount})</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {doc.consultationFee.toLocaleString('vi-VN')}đ
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
