import {
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { UserProvider } from '@/providers/UserProvider';
import { ThemeProvider } from '@/hooks/useTheme';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import ShakeDetector from "@/components/MyShakeComponent ";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Figtree': require("../assets/fonts/Figtree-VariableFont_wght.ttf"),
    'Figtree-SemiBold': require("../assets/fonts/Figtree-VariableFont_wght.ttf"),
    'Figtree-Medium': require("../assets/fonts/Figtree-VariableFont_wght.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <Stack>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ 
            headerShown: true,
            headerTitle: 'MedVault',
            headerRight: () => <ThemeToggleButton />
          }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen options={{ headerShown: false }} name="register" />
          <Stack.Screen options={{ headerShown: false }} name="login" />
          <Stack.Screen options={{ headerShown: false }} name="food_scanner" />
          <Stack.Screen options={{ headerShown: false }} name="emergency-profile" />
          <Stack.Screen options={{ headerShown: false }} name="health_setup" />
        </Stack>
        <ShakeDetector />
      </UserProvider>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
