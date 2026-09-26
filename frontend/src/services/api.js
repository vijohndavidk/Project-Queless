import axios from "axios";

// Every request React makes to Django goes through this single Axios
// instance, so the base URL and auth header only need to be set in one place.
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Attach the auth token (if we have one) to every outgoing request.
// The token itself will be set by AuthContext after a successful login,
// once we build authentication in Phase 3.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
