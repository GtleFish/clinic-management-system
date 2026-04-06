import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, FileText, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDonThuoc, getLichSuKham } from "@/services/patientService";
import { useToast } from "@/hooks/use-toast";

interface LichSu {
  idLichSu: string;
  ngayKham: string;
  chanDoan: string;
  huongDieuTri: string;
  tenBacSiTruong: string;
}

interface DonThuoc {
  idDonThuoc: string;
  tenThuoc: string;
  soLuong: number;
  lieuLuong: string;
  ngayKeDon: string;
}

export default function LichSuKham() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<LichSu[]>([]);
  const [selected, setSelected] = useState<LichSu | null>(null);
  const [donThuoc, setDonThuoc] = useState<DonThuoc[]>([]);
  const [loadingDonThuoc, setLoadingDonThuoc] = useState(false);

  const idBenhNhan = localStorage.getItem("idBenhNhan") || "BN-TEST";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getLichSuKham(idBenhNhan);
        setList(res.data || []);
      } catch {
        toast({
          title: "Không thể tải lịch sử khám",
          description: "Vui lòng thử lại sau",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idBenhNhan, toast]);

  const openDetail = async (item: LichSu) => {
    setSelected(item);
    setLoadingDonThuoc(true);
    try {
      const res = await getDonThuoc(item.idLichSu);
      setDonThuoc(res.data || []);
    } catch {
      setDonThuoc([]);
      toast({
        title: "Không thể tải đơn thuốc",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setLoadingDonThuoc(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Calendar className="h-3.5 w-3.5" /> US-PAT-03
          </div>
          <h1 className="text-3xl font-bold font-heading text-primary">Lịch sử khám bệnh</h1>
          <p className="mt-1 text-muted-foreground">Tra cứu kết quả chẩn đoán và đơn thuốc điện tử</p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-20 text-center shadow-card">
            <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Chưa có lịch sử khám</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((item, i) => (
              <motion.button
                key={item.idLichSu}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openDetail(item)}
                className="w-full rounded-xl border border-border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.ngayKham).toLocaleDateString("vi-VN")}
                    </p>
                    <h3 className="mt-1 font-semibold font-heading text-primary">{item.tenBacSiTruong || "Chưa rõ bác sĩ"}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.chanDoan}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Đã khám</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-elevated"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="font-heading text-lg font-semibold">Chi tiết lượt khám</h2>
                  <p className="text-xs text-muted-foreground">
                    Ngày khám: {new Date(selected.ngayKham).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-md p-2 hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 py-4">
                <Tabs defaultValue="ket-qua">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ket-qua">Kết quả khám</TabsTrigger>
                    <TabsTrigger value="don-thuoc">Đơn thuốc</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ket-qua" className="space-y-4 pt-4">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Bác sĩ trưởng phụ trách</p>
                      <p className="font-medium">{selected.tenBacSiTruong || "Chưa cập nhật"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Chẩn đoán</p>
                      <p className="whitespace-pre-wrap text-sm">{selected.chanDoan || "Chưa cập nhật"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Hướng điều trị</p>
                      <p className="whitespace-pre-wrap text-sm">{selected.huongDieuTri || "Chưa cập nhật"}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="don-thuoc" className="pt-4">
                    {loadingDonThuoc ? (
                      <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />
                    ) : donThuoc.length === 0 ? (
                      <p className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                        Chưa có đơn thuốc cho lượt khám này.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="p-3 text-left font-medium">Tên thuốc</th>
                              <th className="p-3 text-left font-medium">Số lượng</th>
                              <th className="p-3 text-left font-medium">Liều lượng</th>
                              <th className="p-3 text-left font-medium">Ngày kê</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donThuoc.map((thuoc) => (
                              <tr key={thuoc.idDonThuoc} className="border-t border-border">
                                <td className="p-3">{thuoc.tenThuoc}</td>
                                <td className="p-3">{thuoc.soLuong}</td>
                                <td className="p-3">{thuoc.lieuLuong}</td>
                                <td className="p-3">
                                  {new Date(thuoc.ngayKeDon).toLocaleDateString("vi-VN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
