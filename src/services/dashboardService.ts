import API from "../api/api";

export const getDashboard = () => API.get("/dashboard");
export const getHealth = () => API.get("/health");
export const getChart = (apiName: string) =>
  API.get(`/metrics/chart?api=${apiName}`);
export const getHistory = (apiName: string) =>
  API.get(`/metrics/history?api=${apiName}`);
