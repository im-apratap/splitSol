import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Container } from "../../src/components/Container";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { colors } from "../../src/theme/colors";
import { apiClient } from "../../src/api/client";
import { FontAwesome5 } from "@expo/vector-icons";

export default function CreateSettlementScreen() {
  const { groupId } = useLocalSearchParams();
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchMembers = React.useCallback(async () => {
    try {
      const res = await apiClient.get(`/groups/${groupId}`);
      setMembers(res.data.data.members);
      if (res.data.data.members.length > 0) {
        // Just defaulting to the first member for simplicity in the UI preview
        setToUserId(res.data.data.members[0]._id);
      }
    } catch {
      setError("Failed to fetch group members");
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId, fetchMembers]);

  const handleSettle = async () => {
    if (!toUserId || !amount || isNaN(Number(amount))) {
      setError("Please select a user and valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create Pending Settlement logic
      const res = await apiClient.post("/settlements/create", {
        groupId,
        toUserId,
        amount: Number(amount),
      });

      // In a full mobile App runtime with web3js we would invoke the Deep Link / Wallet Provider here
      // For now we simulate confirmation
      await apiClient.post("/settlements/confirm", {
        settlementId: res.data.data._id,
        txSignature:
          "simulated_mobile_tx_signature_" +
          Math.random().toString(36).substring(7),
      });

      router.back();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to settle",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settle Up</Text>
          <Text style={styles.subtitle}>
            Pay your friends securely on Solana
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.checkoutBanner}>
            <FontAwesome5 name="wallet" size={24} color={colors.secondary} />
            <Text style={styles.checkoutText}>Solana Devnet TX</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {members.length === 0 ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Input
              label="Select Beneficiary User ID (Simulated drop down)"
              placeholder="User ID"
              value={toUserId}
              onChangeText={setToUserId}
            />
          )}

          <Input
            label="Amount (in USD equivalent)"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Button
            title="Sign & Send via Solana"
            onPress={handleSettle}
            loading={loading}
            style={styles.actionButton}
            variant="secondary"
          />

          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
  },
  checkoutBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 241, 149, 0.15)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  checkoutText: {
    color: colors.secondary,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "700",
  },
  form: {
    width: "100%",
  },
  actionButton: {
    marginTop: 24,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
});
