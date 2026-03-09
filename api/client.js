import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3005/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
      console.log("Token expired, please login again");
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (email, password, name) =>
    api.post("/auth/register", { email, password, name }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  getCurrentUser: () => api.get("/auth/me"),
};

// Batches API
export const batchesAPI = {
  getAll: () => api.get("/batches"),

  getById: (id) => api.get(`/batches/${id}`),

  create: (batchData) => api.post("/batches", batchData),

  update: (id, batchData) => api.put(`/batches/${id}`, batchData),

  delete: (id) => api.delete(`/batches/${id}`),

  getByStatus: (status) => api.get(`/batches/status/${status}`),
};

// Varieties API
export const varietiesAPI = {
  getAll: () => api.get("/varieties"),

  getById: (id) => api.get(`/varieties/${id}`),

  create: (varietyData) => api.post("/varieties", varietyData),

  update: (id, varietyData) => api.put(`/varieties/${id}`, varietyData),

  delete: (id) => api.delete(`/varieties/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadBatchPhoto: (batchId, fileUri) => {
    const formData = new FormData();
    formData.append("photo", {
      uri: fileUri,
      name: `batch-${batchId}-${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    return api.post(`/upload/batch/${batchId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadVarietyPhoto: (varietyId, fileUri) => {
    const formData = new FormData();
    formData.append("photo", {
      uri: fileUri,
      name: `variety-${varietyId}-${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    return api.post(`/upload/variety/${varietyId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deletePhoto: (fileName) => api.delete(`/upload/${fileName}`),
};

// Action Logs API
export const actionLogsAPI = {
  getForBatch: (batchId) => api.get(`/action-logs/batch/${batchId}`),

  getForUser: () => api.get("/action-logs/user"),

  getStats: (startDate, endDate) =>
    api.get("/action-logs/stats", {
      params: { startDate, endDate },
    }),
};

export default api;
