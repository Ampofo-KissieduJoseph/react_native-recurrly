import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import '@/global.css';
import { colors } from '@/constant/theme';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Derive display name consistently with the home screen
  const displayName = user?.fullName
    || (user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim() : null)
    || user?.primaryEmailAddress?.emailAddress?.split('@')[0]
    || 'Account';

  const initial = displayName[0]?.toUpperCase() ?? '?';

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      {/* Page title */}
      <Text className="list-title mb-6">Settings</Text>

      {/* Account card */}
      <View className="rounded-3xl border border-border bg-card p-5 gap-4">
        <Text
          className="text-xs font-sans-semibold uppercase tracking-[1px]"
          style={{ color: colors.mutedForeground }}>
          Account
        </Text>

        {/* User info row */}
        {user && (
          <View className="flex-row items-center gap-3">
            {/* Avatar: Clerk profile photo OR lettered fallback */}
            {user.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="size-11 rounded-full"
              />
            ) : (
              <View
                className="size-11 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.accent + '22' }}>
                <Text className="text-base font-sans-bold" style={{ color: colors.accent }}>
                  {initial}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-sm font-sans-semibold" style={{ color: colors.primary }}>
                {displayName}
              </Text>
              {user.primaryEmailAddress && (
                <Text className="text-xs font-sans-medium" style={{ color: colors.mutedForeground }}>
                  {user.primaryEmailAddress.emailAddress}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Divider */}
        <View className="h-px" style={{ backgroundColor: colors.border }} />

        {/* Sign out button */}
        <Pressable
          className={`sub-cancel ${loading ? 'sub-cancel-disabled' : ''}`}
          style={{ backgroundColor: colors.destructive, opacity: loading ? 0.5 : 1 }}
          onPress={handleSignOut}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="sub-cancel-text">Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;