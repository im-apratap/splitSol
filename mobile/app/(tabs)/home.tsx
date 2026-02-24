import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Container } from "../../src/components/Container";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { colors } from "../../src/theme/colors";
import { apiClient } from "../../src/api/client";
import { router } from "expo-router";

export default function HomeScreen() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchGroups = async () => {
    try {
      setError("");
      // Using standard REST
      const res = await apiClient.get("/groups");
      setGroups(res.data.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load groups",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const renderGroupItem = ({ item }: { item: any }) => (
    <Card style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupIconContainer}>
          <FontAwesome5 name="users" size={20} color={colors.primary} />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.memberCount}>
            {item.members?.length || 0} members
          </Text>
        </View>
      </View>
      {/* We can navigate to individual group later */}
      <Button
        title="View Group"
        variant="outline"
        style={styles.viewBtn}
        onPress={() => router.push(`/group/${item._id}` as any)}
      />
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <Container style={styles.centerElement}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Create New Group"
            onPress={() => router.push("/group/create" as any)}
            style={styles.createBtn}
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={fetchGroups} variant="secondary" />
          </View>
        ) : null}

        {/* Groups List */}
        <Text style={styles.sectionTitle}>Your Groups</Text>

        <FlatList
          data={groups}
          keyExtractor={(item: any) => item._id}
          renderItem={renderGroupItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5
                name="folder-open"
                size={48}
                color={colors.border}
              />
              <Text style={styles.emptyText}>
                You don&apos;t have any groups yet
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
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
  actionsContainer: {
    marginBottom: 24,
  },
  createBtn: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  groupCard: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  memberCount: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  viewBtn: {
    marginVertical: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    marginBottom: 12,
    textAlign: "center",
  },
});
