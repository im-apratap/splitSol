import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Container } from "../../src/components/Container";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { colors } from "../../src/theme/colors";
import { apiClient } from "../../src/api/client";

export default function CreateExpenseScreen() {
  const { groupId } = useLocalSearchParams();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddExpense = async () => {
    if (!description || !amount || isNaN(Number(amount))) {
      setError("Please provide a valid description and amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiClient.post("/expenses", {
        groupId,
        description,
        amount: Number(amount),
        splitType: "equal",
      });
      router.back();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to add expense",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <Text style={styles.subtitle}>Split a new bill with the group</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input
            label="Description"
            placeholder="Dinner, Taxi, Groceries..."
            value={description}
            onChangeText={setDescription}
            autoFocus
          />

          <Input
            label="Amount (in USD)"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Button
            title="Add Expense"
            onPress={handleAddExpense}
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
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
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
