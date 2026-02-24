import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, Platform } from "react-native";
import { colors } from "../src/theme/colors";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      if (Platform.OS === "web") {
        setIsAuthenticated(false);
        return;
      }
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace("/(tabs)/home");
    } else if (isAuthenticated === false) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
