import { useSignIn, useSignUp } from "@clerk/expo";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, spacing } from "../theme";

// Uses Clerk's newer "Future" resource API (signUp.password() / signIn.password()
// + .finalize()) rather than the classic signUp.create()/setActive() pair -
// the classic hooks were moved behind @clerk/react's legacy entry point in
// this SDK version.
type Mode = "sign_in" | "sign_up" | "verify_email";

export function AuthScreen() {
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();

  const [mode, setMode] = useState<Mode>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: signUpError } = await signUp.password({ emailAddress: email, password });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize();
        return;
      }
      // Default Clerk config requires email verification before completing.
      await signUp.verifications.sendEmailCode();
      setMode("verify_email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize();
      } else {
        setError("That code didn't work - double check it and try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: signInError } = await signIn.password({ identifier: email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
      } else {
        setError("Sign-in needs an extra step this app doesn't support yet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "verify_email") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We sent a verification code to {email}.</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="Verification code"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        {submitting ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <PrimaryButton title="Verify" onPress={handleVerifyEmail} disabled={!code} />
        )}
      </View>
    );
  }

  const isSignUp = mode === "sign_up";

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>AdaptFit</Text>
        <Text style={styles.subtitle}>
          The home workout app that actually listens when something hurts.
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.buttonWrap}>
          {submitting ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <PrimaryButton
              title={isSignUp ? "Create account" : "Sign in"}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={!email.includes("@") || password.length < 8}
            />
          )}
        </View>

        <Text
          style={styles.switchModeText}
          onPress={() => {
            setError(null);
            setMode(isSignUp ? "sign_in" : "sign_up");
          }}
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing(3), paddingTop: spacing(10), gap: spacing(2) },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 15, marginBottom: spacing(2) },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    fontSize: 16,
  },
  error: { color: colors.danger },
  buttonWrap: { marginTop: spacing(1) },
  switchModeText: { color: colors.textMuted, textAlign: "center", marginTop: spacing(2) },
});
