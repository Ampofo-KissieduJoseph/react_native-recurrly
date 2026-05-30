import { useSignIn } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import '@/global.css';
import { colors } from '@/constant/theme';

const StyledSafeAreaView = styled(SafeAreaView);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

function validateCode(code: string): string | null {
  if (!code.trim()) return 'Verification code is required';
  if (!/^\d{6}$/.test(code.trim())) return 'Enter the 6-digit code from your email';
  return null;
}

// ─── Brand Header ─────────────────────────────────────────────────────────────

function BrandHeader() {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Recurly</Text>
          <Text className="auth-wordmark-sub">Smart Billing</Text>
        </View>
      </View>
    </View>
  );
}

// ─── MFA Step ─────────────────────────────────────────────────────────────────

interface MfaStepProps {
  signIn: ReturnType<typeof useSignIn>['signIn'];
  fetchStatus: ReturnType<typeof useSignIn>['fetchStatus'];
  clerkErrors: ReturnType<typeof useSignIn>['errors'];
  router: ReturnType<typeof useRouter>;
}

function MfaStep({ signIn, fetchStatus, clerkErrors, router }: MfaStepProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const handleVerify = async () => {
    const err = validateCode(code);
    if (err) { setCodeError(err); return; }
    setCodeError(null);

    await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          router.replace(url as Href);
        },
      });
    }
  };

  const handleResend = async () => {
    await signIn.mfa.sendEmailCode();
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  const clerkCodeErr = clerkErrors?.fields?.code?.message;
  const loading = fetchStatus === 'fetching';

  return (
    <StyledSafeAreaView className="auth-safe-area" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <BrandHeader />

          <View className="mt-6 items-center">
            <Text className="auth-title">Check your email</Text>
            <Text className="auth-subtitle">
              We sent a 6-digit verification code to your email address.
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              {/* Code field */}
              <View className="auth-field">
                <Text className="auth-label">Verification Code</Text>
                <TextInput
                  className={`auth-input ${(codeError || clerkCodeErr) ? 'auth-input-error' : ''}`}
                  value={code}
                  onChangeText={(v) => { setCode(v); setCodeError(null); }}
                  placeholder="000000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  textAlign="center"
                  style={{ letterSpacing: 8, fontSize: 22, fontFamily: 'sans-bold' }}
                />
                {(codeError || clerkCodeErr) && (
                  <Text className="auth-error">{codeError ?? clerkCodeErr}</Text>
                )}
              </View>

              {/* Verify button */}
              <Pressable
                className={`auth-button ${loading ? 'auth-button-disabled' : ''}`}
                onPress={handleVerify}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="auth-button-text">Verify Code</Text>
                )}
              </Pressable>

              {/* Resend */}
              <Pressable
                className="auth-secondary-button"
                onPress={handleResend}
                disabled={resent || loading}>
                <Text className="auth-secondary-button-text">
                  {resent ? '✓ Code resent' : "Didn't receive a code? Resend"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Start over */}
          <Pressable
            className="mt-4 items-center py-2"
            onPress={() => signIn.reset()}>
            <Text className="auth-link">← Start over</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}

// ─── Main Sign-In Screen ───────────────────────────────────────────────────────

export default function SignInScreen() {
  const { signIn, isLoaded, errors: clerkErrors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loading = fetchStatus === 'fetching';

  // Guard against undefined signIn or Clerk not loaded yet
  if (!isLoaded || !signIn) {
    return null;
  }

  // ── MFA step ──
  if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
    return (
      <MfaStep
        signIn={signIn}
        fetchStatus={fetchStatus}
        clerkErrors={clerkErrors}
        router={router}
      />
    );
  }

  // ── Validate fields ──
  const validateAll = (): boolean => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    return !eErr && !pErr;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validateAll()) return;

    const { error } = await signIn.password({ emailAddress: email.trim(), password });
    if (error) return;

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          router.replace(url as Href);
        },
      });
    } else if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === 'email_code',
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const canSubmit = email.length > 0 && password.length > 0 && !loading;

  // Clerk global field errors
  const clerkIdentifierErr = clerkErrors?.fields?.identifier?.message;
  const clerkPasswordErr = clerkErrors?.fields?.password?.message;
  const clerkGlobalErr = clerkErrors?.global?.message;

  return (
    <StyledSafeAreaView className="auth-safe-area" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Brand */}
          <BrandHeader />

          {/* Heading */}
          <View className="mt-6 items-center">
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          {/* Form card */}
          <View className="auth-card">
            <View className="auth-form">
              {/* Global error */}
              {clerkGlobalErr && (
                <View className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <Text className="auth-error text-sm">{clerkGlobalErr}</Text>
                </View>
              )}

              {/* Email */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={`auth-input ${(emailError || clerkIdentifierErr) ? 'auth-input-error' : ''}`}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setEmailError(null); }}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
                {(emailError || clerkIdentifierErr) && (
                  <Text className="auth-error">{emailError ?? clerkIdentifierErr}</Text>
                )}
              </View>

              {/* Password */}
              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <View className="relative">
                  <TextInput
                    className={`auth-input ${(passwordError || clerkPasswordErr) ? 'auth-input-error' : ''}`}
                    value={password}
                    onChangeText={(v) => { setPassword(v); setPasswordError(null); }}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    style={{ paddingRight: 52 }}
                  />
                  <Pressable
                    className="absolute right-4 top-0 bottom-0 justify-center"
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}>
                    <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </Pressable>
                </View>
                {(passwordError || clerkPasswordErr) && (
                  <Text className="auth-error">{passwordError ?? clerkPasswordErr}</Text>
                )}
              </View>

              {/* Submit */}
              <Pressable
                className={`auth-button ${!canSubmit ? 'auth-button-disabled' : ''}`}
                onPress={handleSubmit}
                disabled={!canSubmit}>
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Footer link */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">New to Recurly?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
