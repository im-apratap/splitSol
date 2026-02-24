import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8000/api";
    }
    return "http://localhost:8000/api";
  }

  return "http://localhost:8000/api";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (Platform.OS === "web") return config;

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
  if (Platform.OS === "web") return;
  try {
    await Promise.all([
      AsyncStorage.removeItem("accessToken"),
      AsyncStorage.removeItem("refreshToken"),
    ]);
  } catch (e) {
    console.error("Failed to clear tokens", e);
  }
};

export const setTokens = async (accessToken: string, refreshToken: string) => {
  if (Platform.OS === "web") return;
  try {
    await Promise.all([
      AsyncStorage.setItem("accessToken", accessToken),
      AsyncStorage.setItem("refreshToken", refreshToken),
    ]);
  } catch (e) {
    console.error("Failed to set tokens", e);
  }
};
