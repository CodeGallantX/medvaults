import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, Home, User, QrCode, History, Landmark } from 'lucide-react-native';

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
            tabBarIcon: ({ color }) => <QrCode size={30} color="black" />,
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
            title: 'Save money',
            tabBarIcon: ({ color }) => <Landmark size={28} color={color} />,
          }}
        />
      </Tabs>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/AIDoctor")}
      >
        <MessageCircle size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 80, // Adjust this value to position the button above the tab bar
    backgroundColor: '#a855f7',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});