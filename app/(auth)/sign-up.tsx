import { useAuth, useSignUp } from '@clerk/expo';
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
  if (!/[A-Z]/.test(password)) return 'Must include at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Must include at least one number';
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

// ─── Password Strength Indicator ──────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const strengthColor =
    passedCount === 3 ? colors.success : passedCount >= 2 ? '#f59e0b' : colors.destructive;
  const strengthLabel = passedCount === 3 ? 'Strong' : passedCount >= 2 ? 'Fair' : 'Weak';

  return (
    <View className="gap-2">
      {/* Bars */}
      <View className="flex-row gap-1.5">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              backgroundColor: i < passedCount ? strengthColor : colors.border,
            }}
          />
        ))}
      </View>
      {/* Labels row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-3">
          {checks.map((c) => (
            <Text
              key={c.label}
              className="text-xs font-sans-medium"
              style={{ color: c.pass ? colors.success : colors.mutedForeground }}>
              {c.pass ? '✓' : '○'} {c.label}
            </Text>
          ))}
        </View>
        <Text className="text-xs font-sans-semibold" style={{ color: strengthColor }}>
          {strengthLabel}
        </Text>
      </View>
    </View>
  );
}

// ─── Verify Step ──────────────────────────────────────────────────────────────

interface VerifyStepProps {
  signUp: ReturnType<typeof useSignUp>['signUp'];
  fetchStatus: ReturnType<typeof useSignUp>['fetchStatus'];
  clerkErrors: ReturnType<typeof useSignUp>['errors'];
  email: string;
  router: ReturnType<typeof useRouter>;
}

function VerifyStep({ signUp, fetchStatus, clerkErrors, email, router }: VerifyStepProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const loading = fetchStatus === 'fetching' || isVerifying;

  const handleVerify = async () => {
    if (isVerifying || fetchStatus === 'fetching') return;
    const err = validateCode(code);
    if (err) { setCodeError(err); return; }
    setCodeError(null);

    setIsVerifying(true);
    try {
      await signUp.verifications.verifyEmailCode({ code: code.trim() });

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl('/');
            router.replace(url as Href);
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resent || loading) return;
    try {
      await signUp.verifications.sendEmailCode();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const clerkCodeErr = clerkErrors?.fields?.code?.message;

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
            <Text className="auth-title">Verify your email</Text>
            <Text className="auth-subtitle">
              We sent a 6-digit code to{'\n'}
              <Text className="font-sans-bold" style={{ color: colors.accent }}>
                {email}
              </Text>
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              {/* Code input */}
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
                  <Text className="auth-button-text">Verify Email</Text>
                )}
              </Pressable>

              {/* Resend */}
              <Pressable
                className="auth-secondary-button"
                onPress={handleResend}
                disabled={resent || loading}>
                <Text className="auth-secondary-button-text">
                  {resent ? '✓ Code resent!' : "Didn't receive a code? Resend"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Trust badge */}
          <View className="mt-6 flex-row items-center justify-center gap-2">
            <Text style={{ fontSize: 14 }}>🔒</Text>
            <Text className="auth-helper">Your email is verified securely</Text>
          </View>

          {/* Required for Clerk bot protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}

// ─── Main Sign-Up Screen ───────────────────────────────────────────────────────

export default function SignUpScreen() {
  const { isLoaded: signUpLoaded, signUp, errors: clerkErrors, fetchStatus } = useSignUp();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = fetchStatus === 'fetching' || isSubmitting;

  // Guard against uninitialized Clerk hooks
  if (!signUpLoaded || !authLoaded || !signUp) {
    return null;
  }

  // ── Already signed in — just bail ──
  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  // ── Email-verification step ──
  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <VerifyStep
        signUp={signUp}
        fetchStatus={fetchStatus}
        clerkErrors={clerkErrors}
        email={email}
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
    if (isSubmitting || loading || fetchStatus === 'fetching' || !signUpLoaded || !signUp) return;
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });
      if (error) {
        setIsSubmitting(false);
        return;
      }

      await signUp.verifications.sendEmailCode();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = email.length > 0 && password.length > 0 && !loading && signUpLoaded && !isSubmitting;

  // Clerk field errors
  const clerkEmailErr = clerkErrors?.fields?.emailAddress?.message;
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
            <Text className="auth-title">Create account</Text>
            <Text className="auth-subtitle">
              Start tracking all your subscriptions in one place
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
                  className={`auth-input ${(emailError || clerkEmailErr) ? 'auth-input-error' : ''}`}
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
                {(emailError || clerkEmailErr) && (
                  <Text className="auth-error">{emailError ?? clerkEmailErr}</Text>
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
                    placeholder="Create a password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={!loading ? handleSubmit : undefined}
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
                {/* Password strength */}
                {password.length > 0 && <PasswordStrength password={password} />}
              </View>

              {/* Submit */}
              <Pressable
                className={`auth-button ${!canSubmit ? 'auth-button-disabled' : ''}`}
                onPress={handleSubmit}
                disabled={!canSubmit}>
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Trust signals */}
          <View className="mt-5 flex-row items-center justify-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Text style={{ fontSize: 13 }}>🔒</Text>
              <Text className="auth-helper">End-to-end encrypted</Text>
            </View>
            <View className="h-3 w-px" style={{ backgroundColor: colors.border }} />
            <View className="flex-row items-center gap-1.5">
              <Text style={{ fontSize: 13 }}>🛡️</Text>
              <Text className="auth-helper">No spam, ever</Text>
            </View>
          </View>

          {/* Footer link */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="auth-link">Sign in</Text>
              </Pressable>
            </Link>
          </View>

          {/* Required for Clerk bot protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
