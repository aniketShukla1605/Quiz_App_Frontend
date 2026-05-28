import api from "../api/axios";

export const createQuiz = (data) =>
  api.post("/quiz/create", data);

export const getQuizQuestions = (id) =>
  api.get(`/quiz/get/${id}`);

export const startQuiz = (id) =>
  api.post(`/quiz/${id}/start`);

export const syncQuiz = (id, data) =>
  api.post(`/quiz/${id}/sync`, data);

export const submitQuiz = (id, data) =>
  api.post(`/quiz/${id}/submit`, data);