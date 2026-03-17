import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/use-toast';

// Tạo 1 tài khoản giả lập để test đăng nhập
const MOCK_ACCOUNT = {
  email: 'admin@medicare.vn',
  password: '123456'
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 4a. Alternative Flow: Để trống thông tin
    if (!email || !password) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.',
        variant: 'destructive',
      });
      return;
    }

    // 4b. Alternative Flow: Sai tài khoản hoặc mật khẩu
    if (email !== MOCK_ACCOUNT.email || password !== MOCK_ACCOUNT.password) {
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Email/Số điện thoại hoặc mật khẩu không chính xác.',
        variant: 'destructive',
      });
      return;
    }

    // Main Flow: Đăng nhập thành công (Bước 4, 5, 6)
    // Giả lập lưu phiên đăng nhập vào localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);

    toast({
      title: 'Đăng nhập thành công!',
      description: 'Chào mừng bạn quay trở lại hệ thống.',
      className: 'bg-primary text-primary-foreground border-none',
    });

    // Chuyển hướng về Trang chủ sau 1.5 giây
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold font-heading">Đăng nhập</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email hoặc Số điện thoại <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="text" // Đổi thành text để có thể nhập SĐT
                  placeholder="your@email.com hoặc 090..."
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu <span className="text-destructive">*</span></Label>
                {/* 4c. Alternative Flow: Nút Quên mật khẩu */}
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground mt-6">
              Đăng nhập
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;