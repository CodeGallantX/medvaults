import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, Home, User, QrCode, History, Wallet } from 'lucide-react-native';
import { FloatingChatWidget } from '@/components/ui/FloatingChatWidget';

import { CircularTabButton } from '@/components/CircularTabButton';
import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0076D6",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            height: 60,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 8,
          }
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={28} color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="food_scan"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <QrCode size={30} color="#ffffff" />,
            tabBarButton: CircularTabButton, // Use custom circular button
            tabBarShowLabel: false, // Hide the label for cleaner look
          }}
        />
        <Tabs.Screen
          name="scan_history"
          options={{
            title: 'Scan History',
            tabBarIcon: ({ color }) => <History size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="save_money"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color }) => <Wallet size={28} color={color} />,
          }}
        />
      </Tabs>
      <FloatingChatWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles can be added here if needed
});