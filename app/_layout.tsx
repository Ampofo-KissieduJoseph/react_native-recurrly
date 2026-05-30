import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { SplashScreen, Stack } from 'expo-router';
import '@/global.css';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function InitialLayout({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  if (!fontsLoaded || !isLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
  });

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <InitialLayout fontsLoaded={fontsLoaded} />
    </ClerkProvider>
  );
}
