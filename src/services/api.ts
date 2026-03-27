import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? "https://api-doctor-backend-production.up.railway.app/api" 
    : "/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
