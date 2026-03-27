import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

export default API;
