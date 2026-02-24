import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../../src/components/Container";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { colors } from "../../src/theme/colors";
import { apiClient } from "../../src/api/client";
import { FontAwesome5 } from "@expo/vector-icons";

type TabType = "expenses" | "balances" | "members";

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("expenses");

  const fetchGroupData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [groupRes, expRes, balRes] = await Promise.all([
        apiClient.get(`/groups/${id}`),
        apiClient.get(`/expenses/group/${id}`),
        apiClient.get(`/expenses/balances/${id}`),
      ]);

      setGroup(groupRes.data.data);
      setExpenses(expRes.data.data || []);
      setBalances(balRes.data.data || []);
    } catch (err: any) {
      console.error("Failed to fetch group details", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id, fetchGroupData]);

  if (loading) {
    return (
      <Container style={styles.centerElement}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Container>
    );
  }

  if (!group) {
    return (
      <Container style={styles.centerElement}>
        <Text style={styles.errorText}>Group not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        />
      </Container>
    );
  }

  const renderTab = (tab: TabType, label: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderExpenseItem = ({ item }: { item: any }) => (
    <Card style={styles.itemCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseIcon}>
          <FontAwesome5 name="receipt" size={16} color={colors.primary} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDesc}>{item.description}</Text>
          <Text style={styles.expenseMeta}>
            Paid by {item.paidBy?.name || "Someone"}
          </Text>
        </View>
        <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
      </View>
    </Card>
  );

  const renderBalanceItem = ({ item }: { item: any }) => (
    <View style={styles.balanceRow}>
      <Text style={styles.balanceName}>{item.user?.name || "Unknown"}</Text>
      <Text
        style={[
          styles.balanceAmount,
          item.balance > 0 ? styles.balancePositive : styles.balanceNegative,
          item.balance === 0 && styles.balanceZero,
        ]}
      >
        {item.balance > 0 ? "+" : ""}
        {item.balance.toFixed(2)}
      </Text>
    </View>
  );

  const renderMemberItem = ({ item }: { item: any }) => (
    <View style={styles.memberRow}>
      <View style={styles.memberIcon}>
        <FontAwesome5 name="user" size={16} color={colors.primary} />
      </View>
      <Text style={styles.memberName}>{item.name}</Text>
      <Text style={styles.memberUsername}>@{item.username}</Text>
    </View>
  );

  return (
    <Container>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome5 name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.tabsContainer}>
        {renderTab("expenses", "Expenses")}
        {renderTab("balances", "Balances")}
        {renderTab("members", "Members")}
      </View>

      <View style={styles.content}>
        {activeTab === "expenses" && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={expenses}
              keyExtractor={(i) => i._id}
              renderItem={renderExpenseItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No expenses yet.</Text>
              }
            />
          </View>
        )}

        {activeTab === "balances" && (
          <View style={{ flex: 1 }}>
            <Card style={styles.balancesCard}>
              <Text style={styles.balancesTitle}>Group Settlements</Text>
              {balances.length === 0 ? (
                <Text style={styles.emptyText}>Everyone is settled up!</Text>
              ) : (
                balances.map((b, idx) => (
                  <React.Fragment key={idx}>
                    {renderBalanceItem({ item: b })}
                  </React.Fragment>
                ))
              )}
            </Card>
          </View>
        )}

        {activeTab === "members" && (
          <View style={{ flex: 1 }}>
            <Card style={styles.membersCard}>
              <Text style={styles.balancesTitle}>
                {group.members.length} Members
              </Text>
              {group.members.map((m: any, idx: number) => (
                <React.Fragment key={idx}>
                  {renderMemberItem({ item: m })}
                </React.Fragment>
              ))}
            </Card>
            {/* Add Member feature would go here logically */}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Add Expense"
          onPress={() =>
            router.push({
              pathname: "/expense/create",
              params: { groupId: id },
            } as any)
          }
          style={styles.actionBtn}
        />
        <Button
          title="Settle Up"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/settlement/create",
              params: { groupId: id },
            } as any)
          }
          style={styles.actionBtn}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  centerElement: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
  },
  itemCard: {
    marginBottom: 12,
    padding: 16,
  },
  expenseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  expenseMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.error,
  },
  balancesCard: {
    padding: 20,
  },
  balancesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  balanceName: {
    fontSize: 16,
    color: colors.text,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  balancePositive: {
    color: colors.success,
  },
  balanceNegative: {
    color: colors.error,
  },
  balanceZero: {
    color: colors.textMuted,
  },
  membersCard: {
    padding: 20,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  memberUsername: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 8,
  },
});
