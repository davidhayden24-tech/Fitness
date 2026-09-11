import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useApi } from "../api/useApi";
import { useSubscription } from "../billing/useSubscription";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radius, spacing } from "../theme";

interface ChatMessage {
  id: string;
  role: "user" | "coach";
  text: string;
}

// Pricing model (spec section 9): plan generation + adaptation are free;
// the conversational coach is the paid layer, sold as a Google Play
// subscription (see src/billing/useSubscription.ts). iOS purchases aren't
// wired up yet - the backend fails closed on that platform - so this falls
// back to a "not available yet" message there instead of a live button.
function Paywall({ onVerified }: { onVerified: () => void }) {
  const { isAndroid, displayPrice, state, error, subscribe } = useSubscription(onVerified);

  return (
    <View style={styles.paywall}>
      <Text style={styles.paywallTitle}>Unlock the check-in coach</Text>
      <Text style={styles.paywallBody}>
        Free AdaptFit already adapts your plan around pain and feedback. The conversational
        coach - chatting before each session to adjust it on the fly - is part of AdaptFit
        Plus{displayPrice ? ` (${displayPrice}/month)` : ""}.
      </Text>
      {isAndroid ? (
        <>
          <PrimaryButton
            title={state === "purchasing" || state === "verifying" ? "Processing..." : "Subscribe"}
            onPress={subscribe}
            disabled={state === "purchasing" || state === "verifying"}
          />
          {state === "error" && error && <Text style={styles.paywallError}>{error}</Text>}
        </>
      ) : (
        <Text style={styles.paywallError}>
          AdaptFit Plus is currently only available on Android. iOS support is coming soon.
        </Text>
      )}
    </View>
  );
}

export function CoachCheckinScreen() {
  const api = useApi();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "coach",
      text: "Hey! How are you feeling today? Anything sore, or short on time?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const refreshSubscriptionStatus = () => {
    api.getMe().then((user) => setSubscriptionStatus(user.subscriptionStatus));
  };

  useEffect(refreshSubscriptionStatus, [api]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    try {
      const { reply } = await api.checkin(userMessage.text);
      setMessages((prev) => [...prev, { id: `${Date.now()}-coach`, role: "coach", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "coach",
          text: "Sorry, I couldn't reach the coach service. Try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (subscriptionStatus === null) {
    return (
      <View style={styles.flex}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(4) }} />
      </View>
    );
  }

  if (subscriptionStatus !== "active") {
    return <Paywall onVerified={refreshSubscriptionStatus} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.bubbleUser : styles.bubbleCoach]}>
            <Text style={item.role === "user" ? styles.bubbleTextUser : styles.bubbleTextCoach}>
              {item.text}
            </Text>
          </View>
        )}
      />
      {sending && <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing(1) }} />}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Tell your coach how you're feeling..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={send}
        />
        <PrimaryButton title="Send" onPress={send} disabled={!input.trim() || sending} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing(2), gap: spacing(1) },
  bubble: { maxWidth: "85%", padding: spacing(1.5), borderRadius: radius.md, marginBottom: spacing(1) },
  bubbleUser: { backgroundColor: colors.primary, alignSelf: "flex-end" },
  bubbleCoach: { backgroundColor: colors.surface, alignSelf: "flex-start", borderWidth: 1, borderColor: colors.border },
  bubbleTextUser: { color: colors.primaryText },
  bubbleTextCoach: { color: colors.text },
  inputRow: {
    flexDirection: "row",
    gap: spacing(1),
    padding: spacing(2),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.25),
  },
  paywall: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing(4),
    gap: spacing(2),
  },
  paywallTitle: { color: colors.text, fontSize: 22, fontWeight: "700", textAlign: "center" },
  paywallBody: { color: colors.textMuted, fontSize: 14, textAlign: "center", lineHeight: 20 },
  paywallError: { color: colors.danger, fontSize: 13, textAlign: "center" },
});
