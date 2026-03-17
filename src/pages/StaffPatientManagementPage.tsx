import { useState } from 'react';
import { Search, Plus, Edit, User, Phone, MapPin, FileText, CalendarDays, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/use-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Dữ liệu mẫu ban đầu
const initialPatients = [
  { id: '1', name: 'Nguyễn Văn An', phone: '0901234567', cccd: '012345678912', dob: '1990-05-15', gender: 'Nam', address: '123 Đường ABC, Quận 1, TP.HCM' },
  { id: '2', name: 'Trần Thị Bình', phone: '0912345678', cccd: '098765432109', dob: '1985-08-20', gender: 'Nữ', address: '456 Đường XYZ, Quận 3, TP.HCM' },
];

const StaffPatientManagementPage = () => {
  const { toast } = useToast();
  
  // States
  const [patients, setPatients] = useState(initialPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State quản lý form (Dùng chung cho cả Thêm và Sửa)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', cccd: '', dob: '', gender: 'Nam', address: ''
  });

  // AC3: Lọc danh sách bệnh nhân theo Tên hoặc SĐT
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.phone.includes(searchQuery)
  );

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', cccd: '', dob: '', gender: 'Nam', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (patient: any) => {
    setEditingId(patient.id);
    setFormData({ ...patient });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.name || !formData.phone) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập Họ tên và Số điện thoại', variant: 'destructive' });
      return;
    }

    if (editingId) {
      // AC2: Chỉnh sửa thông tin
      setPatients(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
      toast({ title: 'Thành công', description: 'Đã cập nhật thông tin bệnh nhân.', className: 'bg-primary text-primary-foreground border-none' });
    } else {
      // AC1: Thêm mới thông tin
      const newPatient = { ...formData, id: `pt-${Date.now()}` };
      setPatients([newPatient, ...patients]);
      toast({ title: 'Thành công', description: 'Đã thêm hồ sơ bệnh nhân mới.', className: 'bg-primary text-primary-foreground border-none' });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">Quản lý bệnh nhân</h1>
            <p className="mt-1 text-sm text-muted-foreground">Phân hệ dành cho nhân viên</p>
          </div>
          <Button onClick={openAddModal} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Thêm bệnh nhân
          </Button>
        </div>

        {/* Thanh tìm kiếm (AC3) */}
        <div className="mb-6 bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm theo Tên hoặc Số điện thoại..." 
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Danh sách bệnh nhân */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Họ và tên</th>
                  <th className="px-6 py-4 font-medium">Số điện thoại</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">CCCD</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Ngày sinh</th>
                  <th className="px-6 py-4 font-medium hidden xl:table-cell">Địa chỉ</th>
                  <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">{patient.name}</td>
                      <td className="px-6 py-4">{patient.phone}</td>
                      <td className="px-6 py-4 hidden md:table-cell">{patient.cccd || '—'}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">{patient.dob ? patient.dob.split('-').reverse().join('/') : '—'}</td>
                      <td className="px-6 py-4 hidden xl:table-cell truncate max-w-[200px]">{patient.address || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(patient)} className="gap-2">
                          <Edit className="h-4 w-4" /> Sửa
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Không tìm thấy bệnh nhân nào khớp với từ khóa "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Thêm/Sửa Bệnh Nhân */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-elevated overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold font-heading">
                  {editingId ? 'Chỉnh sửa thông tin' : 'Thêm bệnh nhân mới'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Họ và tên <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input required className="pl-10" placeholder="Nguyễn Văn A" value={formData.name} onChange={handleInputChange('name')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input required type="tel" className="pl-10" placeholder="0901 234 567" value={formData.phone} onChange={handleInputChange('phone')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Số CCCD</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-10" placeholder="012345678912" value={formData.cccd} onChange={handleInputChange('cccd')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày sinh</Label>
                      <Input type="date" value={formData.dob} onChange={handleInputChange('dob')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Giới tính</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.gender} onChange={handleInputChange('gender')}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-10" placeholder="Số nhà, đường, phường/xã..." value={formData.address} onChange={handleInputChange('address')} />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
                  <Button type="submit" className="gradient-primary text-primary-foreground">Lưu thông tin</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffPatientManagementPage;