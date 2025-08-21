import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { styled } from 'styled-components/native';
import { QuickActionCard } from '@/components/ui/QuickActionCard';
import { Card } from '@/components/ui/Card';
import { 
  QrCode, 
  Scan, 
  MessageCircle, 
  Activity,
  Bell,
  TrendingUp,
  Clock,
  Heart,
  Shield,
  Zap
} from 'lucide-react-native';

import { useRef, useState, useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View, FlatList, TouchableOpacity, Animated } from "react-native";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useUserData } from '@/hooks/useUserData';
import React from "react";

const { height, width } = Dimensions.get("window");

// Styled Components
const Container = styled(ScrollView)`
  flex: 1;
  background-color: #F9FAFB;
`;

const Header = styled(View)`
  padding: 24px;
  padding-top: 60px;
  background: linear-gradient(135deg, #0076D6 0%, #1CBF73 100%);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
`;

const GreetingText = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
`;

const SubtitleText = styled(Text)`
  font-family: 'Figtree';
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
`;

const SectionTitle = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
`;

const QuickActionsContainer = styled(View)`
  flex-direction: row;
  gap: 12px;
  margin-bottom: 32px;
`;

const RecentActivityContainer = styled(View)`
  padding: 0 24px;
  margin-bottom: 32px;
`;

const ActivityItem = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 12px;
  shadow-color: #000000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

const ActivityIconContainer = styled(View)<{ bgColor: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${({ bgColor }) => bgColor};
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const ActivityContent = styled(View)`
  flex: 1;
`;

const ActivityTitle = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
`;

const ActivitySubtitle = styled(Text)`
  font-family: 'Figtree';
  font-size: 14px;
  color: #6b7280;
`;

const ActivityTime = styled(Text)`
  font-family: 'Figtree';
  font-size: 12px;
  color: #9ca3af;
`;

const StatsCard = styled(View)`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin: 0 24px 24px 24px;
  shadow-color: #000000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 4;
`;

const StatsRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StatItem = styled(View)`
  align-items: center;
  flex: 1;
`;

const StatValue = styled(Text)<{ color: string }>`
  font-family: 'Figtree-SemiBold';
  font-size: 24px;
  font-weight: 700;
  color: ${({ color }) => color};
  margin-bottom: 4px;
`;

const StatLabel = styled(Text)`
  font-family: 'Figtree';
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

const NotificationBadge = styled(View)`
  position: absolute;
  top: 8;
  right: 8;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: #E63946;
  border-width: 2px;
  border-color: #ffffff;
`;

const PulseAnimation = styled(Animated.View)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #0076D6;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const quickActions = [
  {
    title: "QR Profile",
    subtitle: "Share medical info",
    icon: <QrCode size={24} color="#ffffff" />,
    color: "#0076D6",
    route: "/food_scan"
  },
  {
    title: "AI Scanner",
    subtitle: "Check allergens",
    icon: <Scan size={24} color="#ffffff" />,
    color: "#1CBF73",
    route: "/food_scanner"
  },
  {
    title: "AI Doctor",
    subtitle: "Get health advice",
    icon: <MessageCircle size={24} color="#ffffff" />,
    color: "#F59E0B",
    route: "/AIDoctor"
  }
];

const recentActivities = [
  {
    title: "Scanned pasta dish",
    subtitle: "Found: Gluten, Dairy",
    time: "2 hours ago",
    icon: <MaterialIcons name="restaurant" size={20} color="#ff6b6b" />,
    iconBg: '#ffe5e5'
  },
  {
    title: "Updated medical info",
    subtitle: "Blood type, allergies",
    time: "1 day ago",
    icon: <MaterialIcons name="medical-services" size={20} color="#10b981" />,
    iconBg: '#d1fae5'
  },
  {
    title: "Emergency contact added",
    subtitle: "Dr. Sarah Johnson",
    time: "3 days ago",
    icon: <MaterialIcons name="contact-phone" size={20} color="#3b82f6" />,
    iconBg: '#dbeafe'
  },
  {
    title: "Medication reminder",
    subtitle: "Took daily vitamins",
    time: "1 week ago",
    icon: <MaterialIcons name="medication" size={20} color="#8b5cf6" />,
    iconBg: '#ede9fe'
  },
  {
    title: "Health report generated",
    subtitle: "Monthly summary",
    time: "2 weeks ago",
    icon: <MaterialIcons name="assessment" size={20} color="#f59e0b" />,
    iconBg: '#fef3c7'
  }
];

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter();
  const [greeting, setGreeting] = useState('Good morning');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Function to handle "My Health" card press
  const handleMyHealthPress = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      router.push("/emergency-profile");
    } else {
      router.push("/login");
    }
  };

  const { 
    username, 
    email, 
    fullName, 
    lastName,
    firstName,
    error 
  } = useUserData();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.push("/login");
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    // Pulse animation for notification bell
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Container showsVerticalScrollIndicator={false}>
      <Header>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <GreetingText>
              {greeting}, {firstName || username}
            </GreetingText>
            <SubtitleText>
              Stay healthy, stay safe 🌟
            </SubtitleText>
          </View>
          <PulseAnimation style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={24} color="white" />
              <NotificationBadge />
            </TouchableOpacity>
          </PulseAnimation>
        </View>
      </Header>

      <View style={{ padding: 24 }}>
        <SectionTitle>Quick Actions</SectionTitle>
        <QuickActionsContainer>
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              color={action.color}
              onPress={() => router.push(action.route)}
            />
          ))}
        </QuickActionsContainer>

        {/* Enhanced Health Overview */}
        <StatsCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Activity size={24} color="#0076D6" />
            <Text style={{ 
              fontFamily: 'Figtree-SemiBold',
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
              marginLeft: 12
            }}>
              Health Overview
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity>
              <TrendingUp size={20} color="#10b981" />
            </TouchableOpacity>
          </View>
          
          <StatsRow>
            <StatItem>
              <StatValue color="#1CBF73">12</StatValue>
              <StatLabel>Scans Today</StatLabel>
            </StatItem>
            
            <View style={{ width: 1, height: 40, backgroundColor: '#e5e7eb', marginHorizontal: 16 }} />
            
            <StatItem>
              <StatValue color="#F59E0B">3</StatValue>
              <StatLabel>Alerts</StatLabel>
            </StatItem>
            
            <View style={{ width: 1, height: 40, backgroundColor: '#e5e7eb', marginHorizontal: 16 }} />
            
            <StatItem>
              <StatValue color="#0076D6">98%</StatValue>
              <StatLabel>Safety Score</StatLabel>
            </StatItem>
          </StatsRow>

          {/* Progress indicators */}
          <View style={{ marginTop: 20, flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
              <View style={{ width: '85%', height: '100%', backgroundColor: '#1CBF73', borderRadius: 2 }} />
            </View>
            <View style={{ flex: 1, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
              <View style={{ width: '60%', height: '100%', backgroundColor: '#F59E0B', borderRadius: 2 }} />
            </View>
            <View style={{ flex: 1, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
              <View style={{ width: '98%', height: '100%', backgroundColor: '#0076D6', borderRadius: 2 }} />
            </View>
          </View>
        </StatsCard>

        {/* Quick Health Actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleMyHealthPress}
          >
            <Shield size={24} color="#0076D6" style={{ marginBottom: 8 }} />
            <Text style={{ 
              fontFamily: 'Figtree-SemiBold',
              fontSize: 14,
              fontWeight: '600',
              color: '#111827'
            }}>
              My Health
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => router.push('/save_money')}
          >
            <Heart size={24} color="#E63946" style={{ marginBottom: 8 }} />
            <Text style={{ 
              fontFamily: 'Figtree-SemiBold',
              fontSize: 14,
              fontWeight: '600',
              color: '#111827'
            }}>
              Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Zap size={24} color="#F59E0B" style={{ marginBottom: 8 }} />
            <Text style={{ 
              fontFamily: 'Figtree-SemiBold',
              fontSize: 14,
              fontWeight: '600',
              color: '#111827'
            }}>
              Emergency
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <RecentActivityContainer>
        <SectionTitle>Recent Activity</SectionTitle>
        {recentActivities.slice(0, 4).map((activity, index) => (
          <ActivityItem key={index}>
            <ActivityIconContainer bgColor={activity.iconBg}>
              {activity.icon}
            </ActivityIconContainer>
            <ActivityContent>
              <ActivityTitle>{activity.title}</ActivityTitle>
              <ActivitySubtitle>{activity.subtitle}</ActivitySubtitle>
            </ActivityContent>
            <ActivityTime>{activity.time}</ActivityTime>
          </ActivityItem>
        ))}
        
        <TouchableOpacity 
          style={{
            alignItems: 'center',
            paddingVertical: 16,
            marginTop: 8
          }}
          onPress={() => router.push('/scan_history')}
        >
          <Text style={{
            fontFamily: 'Figtree-Medium',
            fontSize: 16,
            fontWeight: '600',
            color: '#0076D6'
          }}>
            View All Activity
          </Text>
        </TouchableOpacity>
      </RecentActivityContainer>
    </Container>
  );
}