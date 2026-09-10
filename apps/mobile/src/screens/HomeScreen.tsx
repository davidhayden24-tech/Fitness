import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@clerk/expo";
import type { Exercise, WorkoutPlan, WorkoutSession } from "@adaptfit/shared";
import { useApi } from "../api/useApi";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const SPLIT_LABELS: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  core: "Core",
  full_body: "Full Body",
  rest: "Rest",
};

export function HomeScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const api = useApi();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [currentPlan, library] = await Promise.all([
        api.getCurrentPlan().catch(() => null),
        api.getExercises(),
      ]);
      setPlan(currentPlan);
      setExercises(library);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your plan.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const exerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? id;

  const renderSession = ({ item }: { item: WorkoutSession }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        Day {item.dayNumber} - {SPLIT_LABELS[item.splitType] ?? item.splitType}
      </Text>
      <Text style={styles.cardSubtitle}>
        {item.exercises.map((e) => exerciseName(e.exerciseId)).join(", ")}
      </Text>
      <View style={styles.cardButton}>
        <PrimaryButton
          title="Start session"
          onPress={() => navigation.navigate("SessionPlayer", { sessionId: item.id })}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AdaptFit</Text>
        <Text style={styles.link} onPress={() => signOut()}>
          Sign out
        </Text>
      </View>

      <View style={styles.navRow}>
        <PrimaryButton title="Check in with coach" onPress={() => navigation.navigate("Coach")} />
        <View style={{ height: spacing(1) }} />
        <PrimaryButton
          title="Progress"
          variant="ghost"
          onPress={() => navigation.navigate("Progress")}
        />
      </View>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(4) }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && plan && (
        <FlatList
          data={plan.sessions}
          keyExtractor={(s) => s.id}
          renderItem={renderSession}
          contentContainerStyle={{ paddingBottom: spacing(4) }}
          ListHeaderComponent={<Text style={styles.weekLabel}>Week {plan.weekNumber}</Text>}
        />
      )}

      {!loading && !plan && !error && (
        <Text style={styles.empty}>No plan yet - try signing in again.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing(3) },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(2),
  },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  link: { color: colors.textMuted, fontSize: 14 },
  navRow: { marginBottom: spacing(3) },
  weekLabel: { color: colors.textMuted, fontSize: 14, marginBottom: spacing(1) },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2),
    marginBottom: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: "600" },
  cardSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: spacing(0.5), marginBottom: spacing(1.5) },
  cardButton: { alignSelf: "flex-start" },
  error: { color: colors.danger, marginTop: spacing(2) },
  empty: { color: colors.textMuted, marginTop: spacing(4), textAlign: "center" },
});
