// First, create a custom CircularTabButton component
// Save this as @/components/CircularTabButton.tsx or .js



// Then update your TabLayout component:

import { Tabs } from 'expo-router';
import React from 'react';

import { CircularTabButton } from '@/components/CircularTabButton';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#b9b9e3",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#0d0c0f",
          height: 60,
          borderWidth: 0
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="food_scan"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome name="qrcode" size={30} color="black" />,
          tabBarButton: CircularTabButton, // Use custom circular button
          tabBarShowLabel: false, // Hide the label for cleaner look
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}