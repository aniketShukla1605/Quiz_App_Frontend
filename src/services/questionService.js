import api from "../api/axios";

export const getAllQuestions = () =>
  api.get("/question/allQuestions");

export const getQuestionsByCategory = (category) =>
  api.get(`/question/category/${category}`);

export const addQuestion = (data) =>
  api.post("/question/add", data);

export const createQuizWithQuestions = (data) =>
  api.post("/question/createQuizWithQuestions", data);