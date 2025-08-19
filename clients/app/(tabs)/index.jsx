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
  Clock
} from 'lucide-react-native';

import { useRef, useState, useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
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
  background-color: #ffffff;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
`;

const GreetingText = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const SubtitleText = styled(Text)`
  font-family: 'Figtree';
  font-size: 16px;
  color: #6b7280;
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

const carouselData = [
  {
    text: "Scan your meal for allergies",
    subtitle: "AI-powered food analysis",
    icon: <MaterialIcons name="scanner" size={40} color="#fff" />,
    gradient: ['#ff6b6b', '#ff8e8e'],
    backgroundColor: '#ff6b6b'
  },
  {
    text: "Share your QR code in emergency",
    subtitle: "Quick medical access",
    icon: <MaterialIcons name="qr-code" size={40} color="#fff" />,
    gradient: ['#a855f7', '#c084fc'],
    backgroundColor: '#a855f7'
  },
  {
    text: "Save for time in need",
    subtitle: "Emergency preparedness",
    icon: <MaterialIcons name="favorite" size={40} color="#fff" />,
    gradient: ['#f59e0b', '#fbbf24'],
    backgroundColor: '#f59e0b'
  },
];

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
  const router = useRouter()
  const [greeting, setGreeting] = useState('Good morning');

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
  } = useUserData()


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
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselData.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
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
          <TouchableOpacity 
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#0076D6',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Bell size={24} color="white" />
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#E63946',
              borderWidth: 2,
              borderColor: '#ffffff'
            }} />
          </TouchableOpacity>
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

        <Card style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
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
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ 
                fontFamily: 'Figtree-SemiBold',
                fontSize: 24,
                fontWeight: '700',
                color: '#1CBF73'
              }}>
                12
              </Text>
              <Text style={{ 
                fontFamily: 'Figtree',
                fontSize: 12,
                color: '#6b7280'
              }}>
                Scans Today
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ 
                fontFamily: 'Figtree-SemiBold',
                fontSize: 24,
                fontWeight: '700',
                color: '#F59E0B'
              }}>
                3
              </Text>
              <Text style={{ 
                fontFamily: 'Figtree',
                fontSize: 12,
                color: '#6b7280'
              }}>
                Alerts
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ 
                fontFamily: 'Figtree-SemiBold',
                fontSize: 24,
                fontWeight: '700',
                color: '#0076D6'
              }}>
                98%
              </Text>
              <Text style={{ 
                fontFamily: 'Figtree',
                fontSize: 12,
                color: '#6b7280'
              }}>
                Safety Score
              </Text>
            </View>
          </View>
        </Card>
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

function EnhancedCarouselCard(props) {
  const { data, index } = props;
  const item = data[index];
  
  return (
    <TouchableOpacity
      style={[
        styles.carouselCard,
        { backgroundColor: item.backgroundColor }
      ]}
    >
      <View style={styles.carouselContent}>
        <View style={styles.carouselIcon}>
          {item.icon}
        </View>
        <View style={styles.carouselText}>
          <Text style={styles.carouselTitle}>
            {item.text}
          </Text>
          <Text style={styles.carouselSubtitle}>
            {item.subtitle}
          </Text>
        </View>
      </View>
      <MaterialIcons name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  avatar: {
    height: 48,
    width: 48,
    backgroundColor: "#6366f1",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#0f0f14',
  },
  mainActions: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  viewAllText: {
    color: "#a855f7",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsContainer: {
    marginTop: 15,
  },
  quickActionsContent: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  carousel: {
    marginBottom: 15,
  },
  carouselCard: {
    width: width - 40,
    height: 120,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  carouselContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carouselIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  carouselText: {
    flex: 1,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  activitySubtitle: {
    color: "#9ca3af",
    fontSize: 13,
  },
  activityTime: {
    color: "#6b7280",
    fontSize: 12,
  },
  
});
