import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Container } from "../../src/components/Container";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { colors } from "../../src/theme/colors";
import { apiClient, clearTokens } from "../../src/api/client";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/users/me");
      setUser(res.data.data);
    } catch (err: any) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await apiClient.post("/users/logout");
          } catch {
            // Ignore failure on backend, still clear locally
          }
          await clearTokens();
          router.replace("/(auth)/login");
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <Container style={styles.centerElement}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <FontAwesome5 name="user-alt" size={40} color={colors.primary} />
          </View>

          <Text style={styles.name}>{user?.name || "User"}</Text>
          <Text style={styles.username}>@{user?.username || "unknown"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Wallet Details</Text>
        <Card style={styles.walletCard}>
          <FontAwesome5
            name="wallet"
            size={24}
            color={colors.secondary}
            style={styles.walletIcon}
          />
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Solana Public Key</Text>
            <Text
              style={styles.walletKey}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {user?.pubKey || "Not Set"}
            </Text>
          </View>
        </Card>

        <View style={{ flex: 1 }} />

        <Button
          title="Sign Out"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textStyle={{ fontWeight: "700" }}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  centerElement: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary, // Dark black text
  },
  username: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  walletIcon: {
    marginRight: 16,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  walletKey: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  logoutBtn: {
    marginBottom: 16,
  },
});
