import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { departments, doctors } from '@/data/mockData';
import { Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const DepartmentsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-heading mb-6">Khoa khám bệnh</h1>

        <div className="space-y-8">
          {departments.map((dept, i) => {
            const deptDoctors = doctors.filter((d) => d.departmentId === dept.id);
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold font-heading">{dept.name}</h2>
                    <p className="text-sm text-muted-foreground">{dept.description}</p>
                  </div>
                  <Link
                    to={`/booking?dept=${dept.id}`}
                    className="shrink-0 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Đặt khám
                  </Link>
                </div>

                {deptDoctors.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {deptDoctors.map((doc) => (
                      <div key={doc.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {doc.name.split(' ').pop()?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{doc.title} {doc.name.replace('BS. ', '')}</p>
                            <p className="text-xs text-muted-foreground">{doc.specialization} • {doc.experience} năm</p>
                            <div className="flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 fill-accent text-accent" />
                              {doc.rating}
                              {!doc.available && <span className="ml-2 text-destructive">Nghỉ</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DepartmentsPage;
