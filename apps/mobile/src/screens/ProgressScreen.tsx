import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useApi } from "../api/useApi";
import { colors, radius, spacing } from "../theme";

interface ProgressData {
  totalSessionsCompleted: number;
  currentStreakDays: number;
  adaptationsCount: number;
  recentAdaptations: { originalExerciseId: string; substituteExerciseId: string; trigger: string; timestamp: string }[];
}

export function ProgressScreen() {
  const api = useApi();
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    api.getProgress().then(setData);
  }, [api]);

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.currentStreakDays}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.totalSessionsCompleted}</Text>
          <Text style={styles.statLabel}>Sessions done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data.adaptationsCount}</Text>
          <Text style={styles.statLabel}>Adaptations made</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>How AdaptFit has adjusted for you</Text>
      <FlatList
        data={data.recentAdaptations}
        keyExtractor={(item, i) => `${item.originalExerciseId}-${i}`}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No adaptations yet - flag pain or give feedback during a session and this fills in.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.adaptationRow}>
            <Text style={styles.adaptationText}>
              {item.originalExerciseId} → {item.substituteExerciseId}
            </Text>
            <Text style={styles.adaptationMeta}>{item.trigger.replace("_", " ")}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: spacing(1.5), marginBottom: spacing(3) },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
    alignItems: "center",
  },
  statValue: { color: colors.primary, fontSize: 26, fontWeight: "700" },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: spacing(0.5), textAlign: "center" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: spacing(1.5) },
  adaptationRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(1.5),
    marginBottom: spacing(1),
  },
  adaptationText: { color: colors.text, fontSize: 14 },
  adaptationMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2, textTransform: "capitalize" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing(4) },
});
