/**
 * Validate dữ liệu tạo tài khoản bác sĩ (AC2)
 */
const validateCreateDoctor = (req, res, next) => {
  const { hoTen, idKhoa, chuyenKhoa, namKinhNghiem, username, email } = req.body;
  const errors = [];

  // Kiểm tra các trường bắt buộc
  if (!hoTen || hoTen.trim() === '') {
    errors.push('Họ tên không được để trống');
  }
  if (!idKhoa || idKhoa.trim() === '') {
    errors.push('Khoa không được để trống');
  }
  if (!chuyenKhoa || chuyenKhoa.trim() === '') {
    errors.push('Chuyên khoa không được để trống');
  }
  if (!username || username.trim() === '') {
    errors.push('Tên đăng nhập không được để trống');
  }
  if (namKinhNghiem === undefined || namKinhNghiem === null || namKinhNghiem === '') {
    errors.push('Năm kinh nghiệm không được để trống');
  } else if (isNaN(namKinhNghiem) || Number(namKinhNghiem) < 0) {
    errors.push('Năm kinh nghiệm phải là số dương');
  }

  // Kiểm tra định dạng email (nếu có)
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email không đúng định dạng');
    }
  }

  // Kiểm tra độ dài username
  if (username && (username.length < 3 || username.length > 50)) {
    errors.push('Tên đăng nhập phải từ 3 đến 50 ký tự');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
  }

  next();
};

/**
 * Validate cập nhật tài khoản bác sĩ
 */
const validateUpdateDoctor = (req, res, next) => {
  const { hoTen, idKhoa, chuyenKhoa, namKinhNghiem, email } = req.body;
  const errors = [];

  if (hoTen !== undefined && hoTen.trim() === '') {
    errors.push('Họ tên không được để trống');
  }
  if (idKhoa !== undefined && idKhoa.trim() === '') {
    errors.push('Khoa không được để trống');
  }
  if (chuyenKhoa !== undefined && chuyenKhoa.trim() === '') {
    errors.push('Chuyên khoa không được để trống');
  }
  if (namKinhNghiem !== undefined && (isNaN(namKinhNghiem) || Number(namKinhNghiem) < 0)) {
    errors.push('Năm kinh nghiệm phải là số dương');
  }
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email không đúng định dạng');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
  }

  next();
};

module.exports = { validateCreateDoctor, validateUpdateDoctor };