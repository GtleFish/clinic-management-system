import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Trang chủ',     path: '/' },
  { label: 'Đặt lịch khám', path: '/booking' },
  { label: 'Khoa khám',     path: '/departments' },
  { label: 'Lịch sử khám',  path: '/history' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('Tài khoản');

  // ✅ isLoggedIn reactive — đọc ngay từ đầu, cập nhật theo route
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );

  const location = useLocation();
  const navigate = useNavigate();

  // Cập nhật isLoggedIn & userName khi đổi route
  useEffect(() => {
    const token = !!localStorage.getItem("token");
    setIsLoggedIn(token);

    if (token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          setUserName(userObj.hoTen || userObj.name || userObj.username || 'Tài khoản');
        } catch (error) {
          console.error("Lỗi khi đọc thông tin user:", error);
        }
      }
    }
  }, [location.pathname]);

  // Tự đóng mobile menu khi đổi route
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("patientProfile");
    setIsLoggedIn(false);
    setUserName('Tài khoản');
    navigate("/login"); // ✅ không reload trang
  };
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground font-heading">MediCare</span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Desktop auth */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {userName}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Mobile auth */}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="flex-1">
                      <Button variant="outline" className="w-full gap-2" size="sm">
                        <User className="h-4 w-4" />
                        {userName}
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">Đăng nhập</Button>
                    </Link>
                    <Link to="/register" className="flex-1">
                      <Button className="w-full" size="sm">Đăng ký</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Header;