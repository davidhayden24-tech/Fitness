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
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radius, spacing } from "../theme";

interface ChatMessage {
  id: string;
  role: "user" | "coach";
  text: string;
}

// Pricing model (spec section 9): plan generation + adaptation are free;
// the conversational coach is the paid layer. No payment flow is wired up
// yet (pricing numbers weren't specified), so this just gates the chat UI
// behind subscriptionStatus and points at a not-yet-built upgrade flow.
function Paywall() {
  return (
    <View style={styles.paywall}>
      <Text style={styles.paywallTitle}>Unlock the check-in coach</Text>
      <Text style={styles.paywallBody}>
        Free AdaptFit already adapts your plan around pain and feedback. The conversational
        coach - chatting before each session to adjust it on the fly - is part of AdaptFit
        Plus. Upgrade to unlock it.
      </Text>
      <PrimaryButton title="Upgrade (coming soon)" onPress={() => {}} disabled />
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

  useEffect(() => {
    api.getMe().then((user) => setSubscriptionStatus(user.subscriptionStatus));
  }, [api]);

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
    return <Paywall />;
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
});
