import axios from "axios";

// Create a configured axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.API_URL ?? "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle errors globally if needed
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here, e.g., logging or redirecting on 401
    // For now, just reject the promise to let the caller handle it
    return Promise.reject(error);
  }
);
