import axios from "axios";

const isLocalHost = typeof window !== "undefined"
  && ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (isLocalHost
    ? "http://localhost:5001/api"
    : "https://scam-job-detection-application-1.onrender.com/api");

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
