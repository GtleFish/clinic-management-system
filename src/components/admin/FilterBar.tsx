import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import api from "@/lib/api";

interface FilterBarProps {
  onDateRangeChange: (fromDate: string, toDate: string) => void;
  onDepartmentChange: (idKhoa: string | null) => void;
  onPeriodChange: (period: "daily" | "weekly" | "monthly" | "custom") => void;
  departments?: Array<{ idKhoa: string; tenKhoa: string }>;
  isLoading?: boolean;
}

const getDateRange = (period: "daily" | "weekly" | "monthly" | "custom") => {
  const today = new Date();
  const fromDate = new Date();

  switch (period) {
    case "daily":
      fromDate.setDate(today.getDate());
      break;
    case "weekly":
      fromDate.setDate(today.getDate() - 7);
      break;
    case "monthly":
      fromDate.setMonth(today.getMonth() - 1);
      break;
    case "custom":
      return null;
  }

  return {
    fromDate: fromDate.toISOString().split("T")[0],
    toDate: today.toISOString().split("T")[0],
  };
};

export default function FilterBar({
  onDateRangeChange,
  onDepartmentChange,
  onPeriodChange,
  departments = [],
  isLoading = false,
}: FilterBarProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "custom">("monthly");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [depts, setDepts] = useState<Array<{ idKhoa: string; tenKhoa: string }>>(departments);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepts(true);
        const response = await api.get('/admin/khoa');
        setDepts(response.data?.data || []);
      } catch (error) {
        console.error('Lỗi tải danh sách khoa:', error);
        setDepts(departments);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, [departments]);

  // Initialize with monthly date range
  useEffect(() => {
    const dateRange = getDateRange("monthly");
    if (dateRange) {
      setFromDate(dateRange.fromDate);
      setToDate(dateRange.toDate);
      onDateRangeChange(dateRange.fromDate, dateRange.toDate);
    }
  }, [onDateRangeChange]);

  const handlePeriodChange = (newPeriod: "daily" | "weekly" | "monthly") => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);

    const dateRange = getDateRange(newPeriod);
    if (dateRange) {
      setFromDate(dateRange.fromDate);
      setToDate(dateRange.toDate);
      onDateRangeChange(dateRange.fromDate, dateRange.toDate);
    }
  };

  const handleCustomDateChange = () => {
    if (fromDate && toDate) {
      onDateRangeChange(fromDate, toDate);
    }
  };

  const handleDepartmentChange = (value: string) => {
    const newValue = value === "all" ? null : value;
    setSelectedDepartment(newValue);
    onDepartmentChange(newValue);
  };

  return (
    <Card className="sticky top-0 z-10 border-b bg-card p-4 shadow-sm">
      <div className="space-y-4">
        {/* Period Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={period === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("daily")}
            disabled={isLoading}
          >
            Hàng ngày
          </Button>
          <Button
            variant={period === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("weekly")}
            disabled={isLoading}
          >
            Hàng tuần
          </Button>
          <Button
            variant={period === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("monthly")}
            disabled={isLoading}
          >
            Hàng tháng
          </Button>
          <Button
            variant={period === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("custom")}
            disabled={isLoading}
          >
            Tùy chọn
          </Button>
        </div>

        {/* Custom Date Range (shown when custom is selected) */}
        {period === "custom" && (
          <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Từ ngày</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Đến ngày</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleCustomDateChange}
              disabled={isLoading || !fromDate || !toDate}
              className="w-full sm:w-auto"
            >
              Áp dụng
            </Button>
          </div>
        )}

        {/* Department Filter */}
        {depts.length > 0 && (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Khoa/Chuyên khoa</label>
              <Select
                value={selectedDepartment || "all"}
                onValueChange={handleDepartmentChange}
                disabled={isLoading || loadingDepts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả các khoa</SelectItem>
                  {depts.map((dept) => (
                    <SelectItem key={dept.idKhoa} value={dept.idKhoa}>
                      {dept.tenKhoa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Info text */}
        <div className="text-xs text-muted-foreground">
          Hiện thị dữ liệu từ <span className="font-semibold">{fromDate}</span> đến{" "}
          <span className="font-semibold">{toDate}</span>
          {selectedDepartment && ` · Khoa: ${depts.find((d) => d.idKhoa === selectedDepartment)?.tenKhoa}`}
        </div>
      </div>
    </Card>
  );
}
