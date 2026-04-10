import axios from "axios";

const isLocalHost = typeof window !== "undefined"
  && ["localhost", "127.0.0.1"].includes(window.location.hostname);

const normalizeBaseUrl = (value) => value?.trim().replace(/\/+$/, "");

const getApiBaseUrl = () => {
  const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (isLocalHost) {
    return "http://localhost:5000/api";
  }

  return "https://scam-job-detection-application-2.onrender.com/api";
};

const API_BASE_URL = getApiBaseUrl();

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
