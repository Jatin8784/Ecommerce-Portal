import axios from "axios";

// Locally, it contacts the backend directly.
// In production (Vercel), it uses "/api/v1" so the new vercel.json proxy rule seamlessly hides the third-party cookie!
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const isProduction = window.location.hostname !== "localhost";

export const axiosInstance = axios.create({
  baseURL: isProduction ? "/api/v1" : `${API_URL}/api/v1`,
  withCredentials: true,
});
