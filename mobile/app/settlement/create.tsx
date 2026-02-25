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
import { Picker } from "@react-native-picker/picker";
import { signTransactionOnDevice } from "../../src/utils/solana";

export default function CreateSettlementScreen() {
  const { groupId } = useLocalSearchParams();
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [balances, setBalances] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const fetchData = React.useCallback(async () => {
    try {
      // Fetch current User profile
      const userRes = await apiClient.get("/users/me");
      const loggedInUserId = userRes.data.data._id;
      setCurrentUserId(loggedInUserId);

      // Fetch group members
      const res = await apiClient.get(`/groups/${groupId}`);
      const otherMembers = res.data.data.members.filter(
        (m: any) => m._id !== loggedInUserId,
      );
      setMembers(otherMembers);

      // Fetch group balances to know who the user owes
      const balanceRes = await apiClient.get(`/expenses/balances/${groupId}`);
      setBalances(balanceRes.data.data.balances);
      setSettlements(balanceRes.data.data.settlements);

      if (otherMembers.length > 0) {
        setToUserId(otherMembers[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch group data");
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId, fetchData]);

  const handleCheckAmount = () => {
    if (toUserId && settlements.length > 0 && currentUserId) {
      const oweThem = settlements.find(
        (s) => s.to._id === toUserId && s.from._id === currentUserId,
      );
      const theyOwe = settlements.find(
        (s) => s.from._id === toUserId && s.to._id === currentUserId,
      );

      if (oweThem) {
        setAmount(oweThem.amount.toString());
        setError(""); // Clear error
      } else if (theyOwe) {
        setAmount("0");
        setError(
          `You don't owe them. They actually owe you $${theyOwe.amount.toFixed(2)}.`,
        );
      } else {
        setAmount("0");
        setError("You don't owe this user anything.");
      }
    } else {
      setAmount("0");
      setError("No balances found or you don't owe anyone.");
    }
  };

  const handleSettle = async () => {
    if (!toUserId || !amount || isNaN(Number(amount))) {
      setError("Please select a user and valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiClient.post("/settlements/create", {
        groupId,
        toUserId,
        amount: Number(amount),
      });

      const { serializedTransaction, settlements } = res.data.data;

      if (!serializedTransaction) {
        throw new Error("No transaction object received from server");
      }

      // Prompt user to sign the transaction via Phantom/Solflare
      const signedTransaction = await signTransactionOnDevice(
        serializedTransaction,
      );

      // Submit the signed transaction back
      await apiClient.post("/settlements/submit", {
        settlementIds: settlements.map((s: any) => s.settlementId),
        signedTransaction,
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
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Who are you paying?</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={toUserId}
                  onValueChange={(itemValue) => setToUserId(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={colors.primary}
                >
                  {members.map((m) => (
                    <Picker.Item
                      key={m._id}
                      label={m.name || m.username}
                      value={m._id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          <Button
            title="Check Amount Owed"
            onPress={handleCheckAmount}
            variant="outline"
            style={styles.checkButton}
          />

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
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
  },
  checkoutBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 24,
    marginBottom: 24,
  },
  checkoutText: {
    color: colors.primary,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "700",
  },
  form: {
    width: "100%",
  },
  checkButton: {
    marginBottom: 16,
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
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerWrapper: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden", // Ensures picker doesn't bleed out of rounded corners
  },
  picker: {
    height: 56,
    width: "100%",
    color: colors.text,
  },
});
