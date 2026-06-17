import api from "../api/axios";

export const register = (data) =>
  api.post("/auth/register", data);

export const login = (data) =>
  api.post("/auth/login", data);

export const logout = () =>
  api.post("/auth/logout");

export const refresh = () =>
  api.post("/auth/refresh");

export const googleLogin = (data) =>
  api.post("/auth/google", data);

export const verifyEmail = (token) =>
  api.get("/auth/verify-email", { params: { token } });
 
export const resendVerification = (email) =>
  api.post("/auth/resend-verification", { email });