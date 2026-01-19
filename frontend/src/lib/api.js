import axios from "axios";

// Ajusta la URL base a tu backend
export const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Inyectar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
