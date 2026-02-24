import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Since backend runs on localhost, we need to handle Android emulator vs iOS simulator/physical device
// In a real app, use environment variables.
const getBaseUrl = () => {
  if (__DEV__) {
    // Android emulator needs 10.0.2.2 to access host localhost
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000/api/v1";
    }
    // iOS simulator or web
    return "http://localhost:5000/api/v1";
  }
  return "https://api.split-sol.com/v1"; // Production URL placeholder
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// Add a request interceptor to inject the token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to inject token", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const clearTokens = async () => {
  await Promise.all([
    AsyncStorage.removeItem("accessToken"),
    AsyncStorage.removeItem("refreshToken"),
  ]);
};

export const setTokens = async (accessToken: string, refreshToken: string) => {
  await Promise.all([
    AsyncStorage.setItem("accessToken", accessToken),
    AsyncStorage.setItem("refreshToken", refreshToken),
  ]);
};
