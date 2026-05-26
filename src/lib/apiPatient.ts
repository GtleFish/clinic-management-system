import { Patient } from "@/types/patient";

export const registerPatient = async (data: Patient) => {
  //const response = await fetch("http://localhost:3000/api/benhnhan/register", {
  const response = await fetch("https://clinic-backend-ncvc.onrender.com/api/benhnhan/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Đăng ký thất bại");
  }

  return result;
};
export const getMyProfile = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("https://clinic-backend-ncvc.onrender.com/api/benhnhan/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
export const updatePatient = async (idUser: string, data: object) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`https://clinic-backend-ncvc.onrender.com/api/benhnhan/update/${idUser}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};

export const changePassword = async (idUser: string, data: { oldPassword: string; newPassword: string }) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`https://clinic-backend-ncvc.onrender.com/api/benhnhan/change-password/${idUser}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};