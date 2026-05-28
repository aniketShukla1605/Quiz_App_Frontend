import api from "../api/axios";

export const getMyHistory = () =>
  api.get("/results/me/history");

export const getMyScoreSummary = () =>
  api.get("/results/me/summary");

export const syncMyResults = () =>
  api.post("/results/me/sync");

export const getAttemptResult = (attemptId) =>
  api.get(`/results/attempt/${attemptId}`);

export const getLeaderboard = (quizId, limit = 10) =>
  api.get(`/results/quiz/${quizId}/leaderboard`, { params: { limit } });