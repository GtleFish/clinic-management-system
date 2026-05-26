const API_URL = import.meta.env.VITE_API_URL || 'const API_URL = import.meta.env.VITE_API_URL || 'https://clinic-backend-ncvc.onrender.com/api';';

export const loginUser = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { token, refreshToken, user }
};

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Bỏ qua lỗi network khi logout
  }
};