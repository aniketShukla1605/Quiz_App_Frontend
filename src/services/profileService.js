import api from "../api/axios";

export const getProfile = () =>
  api.get("/profile/me");

export const updateProfile = (data) =>
  api.put("/profile/me", data);

export const uploadAvatar = (formData) =>
  api.post("/profile/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteAvatar = () =>
  api.delete("/profile/me/avatar");

export const getHistory = () =>
  api.get("/profile/me/history");