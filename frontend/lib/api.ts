// frontend/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Replace with LAN IP when testing on physical device
  withCredentials: true,
});

export default api;
