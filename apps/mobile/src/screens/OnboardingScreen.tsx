import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FITNESS_LEVELS, GOALS, type ContraindicationTag, type FitnessLevel, type Goal } from "@adaptfit/shared";
import { useApi } from "../api/useApi";
import { BodyAreaPicker } from "../components/BodyAreaPicker";
import { ChipSelect } from "../components/ChipSelect";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, spacing } from "../theme";

const FITNESS_LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const GOAL_LABELS: Record<Goal, string> = {
  lose_weight: "Lose Weight",
  tone_up: "Tone Up",
  build_muscle: "Build Muscle",
  six_pack: "Six-Pack",
  improve_endurance: "Improve Endurance",
  general_fitness: "General Fitness",
};

export function OnboardingScreen({ onOnboarded }: { onOnboarded: () => void }) {
  const api = useApi();
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("beginner");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [flaggedInjuries, setFlaggedInjuries] = useState<ContraindicationTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = goals.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.completeOnboarding({ fitnessLevel, goals, flaggedInjuries });
      await api.generatePlan();
      onOnboarded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to AdaptFit</Text>
      <Text style={styles.subtitle}>
        The home workout app that actually listens when something hurts.
      </Text>

      <Text style={styles.label}>Fitness level</Text>
      <ChipSelect
        options={FITNESS_LEVELS.map((level) => ({ value: level, label: FITNESS_LEVEL_LABELS[level] }))}
        selected={[fitnessLevel]}
        onToggle={(value) => setFitnessLevel(value)}
      />

      <Text style={styles.label}>Goals</Text>
      <ChipSelect
        options={GOALS.map((goal) => ({ value: goal, label: GOAL_LABELS[goal] }))}
        selected={goals}
        onToggle={(value) =>
          setGoals((prev) => (prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]))
        }
      />

      <Text style={styles.label}>Any areas that hurt right now?</Text>
      <Text style={styles.hint}>
        We'll automatically avoid and substitute exercises that strain these.
      </Text>
      <BodyAreaPicker selected={flaggedInjuries} onChange={setFlaggedInjuries} />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttonWrap}>
        {submitting ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <PrimaryButton title="Build my plan" onPress={handleSubmit} disabled={!canSubmit} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing(3), paddingTop: spacing(8), gap: spacing(2) },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 15, marginBottom: spacing(2) },
  label: { color: colors.text, fontSize: 16, fontWeight: "600", marginTop: spacing(2) },
  hint: { color: colors.textMuted, fontSize: 13, marginBottom: spacing(1) },
  error: { color: colors.danger, marginTop: spacing(1) },
  buttonWrap: { marginTop: spacing(3), marginBottom: spacing(6) },
});
