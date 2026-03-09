import { Link } from 'react-router-dom';
import { Calendar, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-heading">MediCare</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hệ thống đặt lịch khám bệnh trực tuyến hàng đầu, kết nối bạn với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <div className="flex flex-col gap-2">
              <Link to="/booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">Đặt lịch khám</Link>
              <Link to="/departments" className="text-sm text-muted-foreground hover:text-primary transition-colors">Khoa khám</Link>
              <Link to="/history" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lịch sử khám</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Hướng dẫn đặt lịch</span>
              <span className="text-sm text-muted-foreground">Câu hỏi thường gặp</span>
              <span className="text-sm text-muted-foreground">Chính sách bảo mật</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                1900 1234
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                info@medicare.vn
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                123 Đường ABC, TP.HCM
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 MediCare. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
