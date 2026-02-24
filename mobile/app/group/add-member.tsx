import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Container } from "../../src/components/Container";
import { Input } from "../../src/components/Input";
import { Button } from "../../src/components/Button";
import { colors } from "../../src/theme/colors";
import { apiClient } from "../../src/api/client";

export default function AddMemberScreen() {
  const { groupId } = useLocalSearchParams();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddMember = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiClient.post(`/groups/${groupId}/members`, {
        username: username.trim(),
      });
      // Navigate back to the group details screen, resolving the promise
      router.back();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to add user",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Member</Text>
          <Text style={styles.subtitle}>
            Invite someone to the group using their SplitSOL username.
          </Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input
            label="Username"
            placeholder="e.g. solanawhale"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoFocus
          />

          <Button
            title="Add to Group"
            onPress={handleAddMember}
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
