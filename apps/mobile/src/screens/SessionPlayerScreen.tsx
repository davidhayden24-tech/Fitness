import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Exercise, PlannedExercise, SkipReason, WorkoutSession } from "@adaptfit/shared";
import { SESSION_FEEDBACK } from "@adaptfit/shared";
import { useApi } from "../api/useApi";
import { ExerciseAnimation } from "../components/ExerciseAnimation";
import { patternForSubstituteGroup } from "../animations/exercisePatternMap";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "SessionPlayer">;

interface CompletedRecord {
  exerciseId: string;
  setsCompleted: number | null;
  durationCompletedSeconds: number | null;
}
interface SkippedRecord {
  exerciseId: string;
  reason: SkipReason;
}

export function SessionPlayerScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const api = useApi();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [setsDone, setSetsDone] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completed, setCompleted] = useState<CompletedRecord[]>([]);
  const [skipped, setSkipped] = useState<SkippedRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    (async () => {
      const plan = await api.getCurrentPlan().catch(() => null);
      const found = plan?.sessions.find((s) => s.id === sessionId) ?? null;
      const library = await api.getExercises();
      setSession(found);
      setExercises(library);
      if (found?.exercises[0]?.durationSeconds) {
        setSecondsLeft(found.exercises[0].durationSeconds);
      }
      setLoading(false);
    })();
  }, [api, sessionId]);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, secondsLeft]);

  const planned: PlannedExercise | undefined = session?.exercises[index];
  const exercise = planned ? exercises.find((e) => e.id === planned.exerciseId) : undefined;
  const animationPattern = useMemo(
    () => (exercise ? patternForSubstituteGroup(exercise.substituteGroupId) : undefined),
    [exercise]
  );

  const isLast = session ? index === session.exercises.length - 1 : true;

  useEffect(() => {
    setTimerRunning(false);
    setSetsDone(0);
    if (planned?.durationSeconds) setSecondsLeft(planned.durationSeconds);
  }, [index, planned?.durationSeconds]);

  const advance = (record: CompletedRecord | null, skip?: SkippedRecord) => {
    if (record) setCompleted((prev) => [...prev, record]);
    if (skip) setSkipped((prev) => [...prev, skip]);
    if (isLast) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleCompleteSet = () => {
    if (!planned) return;
    const nextSetsDone = setsDone + 1;
    setSetsDone(nextSetsDone);
    if (!planned.sets || nextSetsDone >= planned.sets) {
      advance({ exerciseId: planned.exerciseId, setsCompleted: nextSetsDone, durationCompletedSeconds: null });
    }
  };

  const handleDurationDone = () => {
    if (!planned) return;
    advance({
      exerciseId: planned.exerciseId,
      setsCompleted: null,
      durationCompletedSeconds: planned.durationSeconds,
    });
  };

  const handlePainOrTooHard = async (reason: "pain" | "too_hard") => {
    if (!planned) return;
    await api.giveExerciseFeedback(planned.exerciseId, reason);
    advance(null, { exerciseId: planned.exerciseId, reason });
  };

  const handleSkip = () => {
    if (!planned) return;
    advance(null, { exerciseId: planned.exerciseId, reason: "not_feeling_it" });
  };

  const submitLog = async (feedback: (typeof SESSION_FEEDBACK)[number]) => {
    if (!session) return;
    setSubmitting(true);
    try {
      await api.logSession({
        sessionId: session.id,
        completedExercises: completed,
        skippedExercises: skipped,
        feedback,
        durationSeconds: Math.round((Date.now() - startedAt.current) / 1000),
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Session not found.</Text>
        <PrimaryButton title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Nice work!</Text>
        <Text style={styles.subtitle}>How did that session feel?</Text>
        {submitting ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={{ gap: spacing(1.5), width: "100%", marginTop: spacing(3) }}>
            <PrimaryButton title="Felt good" onPress={() => submitLog("good")} />
            <PrimaryButton title="Too easy" variant="ghost" onPress={() => submitLog("too_easy")} />
            <PrimaryButton title="Too hard" variant="ghost" onPress={() => submitLog("too_hard")} />
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.progress}>
        Exercise {index + 1} of {session.exercises.length}
      </Text>
      <Text style={styles.title}>{exercise?.name ?? planned?.exerciseId}</Text>
      <Text style={styles.description}>{exercise?.description}</Text>

      <View style={styles.mediaPlaceholder}>
        {animationPattern && <ExerciseAnimation pattern={animationPattern} size={110} />}
        <Text style={styles.mediaPlaceholderText}>Placeholder animation - real video coming soon</Text>
      </View>

      {planned?.durationSeconds ? (
        <View style={styles.timerBlock}>
          <Text style={styles.timer}>{secondsLeft}s</Text>
          <View style={{ flexDirection: "row", gap: spacing(1) }}>
            <PrimaryButton
              title={timerRunning ? "Pause" : "Start"}
              onPress={() => setTimerRunning((r) => !r)}
            />
            <PrimaryButton title="Done" variant="ghost" onPress={handleDurationDone} />
          </View>
        </View>
      ) : (
        <View style={styles.timerBlock}>
          <Text style={styles.timer}>
            Set {setsDone + 1} of {planned?.sets ?? 1}
            {planned?.reps ? ` - ${planned.reps} reps` : ""}
          </Text>
          <PrimaryButton title="Complete set" onPress={handleCompleteSet} />
        </View>
      )}

      <View style={styles.feedbackRow}>
        <PrimaryButton title="This hurt" variant="danger" onPress={() => handlePainOrTooHard("pain")} />
        <PrimaryButton title="Too hard" variant="ghost" onPress={() => handlePainOrTooHard("too_hard")} />
        <PrimaryButton title="Skip" variant="ghost" onPress={handleSkip} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing(3), alignItems: "center" },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: spacing(3), gap: spacing(2) },
  progress: { color: colors.textMuted, fontSize: 13, marginBottom: spacing(1) },
  title: { color: colors.text, fontSize: 24, fontWeight: "700", textAlign: "center" },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: spacing(1) },
  description: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: spacing(1), marginBottom: spacing(2) },
  mediaPlaceholder: {
    width: "100%",
    height: 210,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1),
    marginBottom: spacing(3),
  },
  mediaPlaceholderText: { color: colors.textMuted, fontSize: 12 },
  timerBlock: { alignItems: "center", gap: spacing(1.5), marginBottom: spacing(4) },
  timer: { color: colors.text, fontSize: 32, fontWeight: "700" },
  feedbackRow: { flexDirection: "row", gap: spacing(1), flexWrap: "wrap", justifyContent: "center" },
});
