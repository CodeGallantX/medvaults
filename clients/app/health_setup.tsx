import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";

interface HealthSetupData {
  bloodType: string;
  allergies: string;
  occupation: string;
  healthGoal: string;
}

interface HealthOptionProps {
  label: string;
  value: string;
  onPress: () => void;
  category: string;
}

type RootStackParamList = {
  Registration: undefined;
  HealthSetup: undefined;
  Login: undefined;
  Dashboard: undefined;
};

type HealthSetupScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "HealthSetup"
>;

interface HealthSetupScreenProps {
  navigation: HealthSetupScreenNavigationProp;
}

const HealthSetupScreen: React.FC<HealthSetupScreenProps> = ({
  navigation,
}) => {
  const [healthData, setHealthData] = useState<HealthSetupData>({
    bloodType: "Type A+",
    allergies: "Seafood",
    occupation: "Teacher",
    healthGoal: "Exercise more",
  });

  const updateHealthData = (
    field: keyof HealthSetupData,
    value: string
  ): void => {
    setHealthData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContinue = (): void => {
    // Process health setup data and navigate to next screen
    console.log("Health setup data:", healthData);
    Alert.alert("Success", "Health profile setup completed!");
    // navigation.navigate('Dashboard');
  };

  const handleBloodTypePress = (): void => {
    // You would typically navigate to a picker screen or show a modal
    Alert.alert("Blood Type", "Select your blood type", [
      {
        text: "Type A+",
        onPress: () => updateHealthData("bloodType", "Type A+"),
      },
      {
        text: "Type A-",
        onPress: () => updateHealthData("bloodType", "Type A-"),
      },
      {
        text: "Type B+",
        onPress: () => updateHealthData("bloodType", "Type B+"),
      },
      {
        text: "Type B-",
        onPress: () => updateHealthData("bloodType", "Type B-"),
      },
      {
        text: "Type AB+",
        onPress: () => updateHealthData("bloodType", "Type AB+"),
      },
      {
        text: "Type AB-",
        onPress: () => updateHealthData("bloodType", "Type AB-"),
      },
      {
        text: "Type O+",
        onPress: () => updateHealthData("bloodType", "Type O+"),
      },
      {
        text: "Type O-",
        onPress: () => updateHealthData("bloodType", "Type O-"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleAllergiesPress = (): void => {
    Alert.alert("Allergies", "Select your allergies", [
      { text: "None", onPress: () => updateHealthData("allergies", "None") },
      {
        text: "Seafood",
        onPress: () => updateHealthData("allergies", "Seafood"),
      },
      { text: "Nuts", onPress: () => updateHealthData("allergies", "Nuts") },
      { text: "Dairy", onPress: () => updateHealthData("allergies", "Dairy") },
      {
        text: "Gluten",
        onPress: () => updateHealthData("allergies", "Gluten"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleOccupationPress = (): void => {
    Alert.alert("Occupation", "Select your occupation", [
      {
        text: "Teacher",
        onPress: () => updateHealthData("occupation", "Teacher"),
      },
      {
        text: "Doctor",
        onPress: () => updateHealthData("occupation", "Doctor"),
      },
      {
        text: "Engineer",
        onPress: () => updateHealthData("occupation", "Engineer"),
      },
      {
        text: "Student",
        onPress: () => updateHealthData("occupation", "Student"),
      },
      { text: "Other", onPress: () => updateHealthData("occupation", "Other") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleHealthGoalPress = (): void => {
    Alert.alert("Health Goals", "Select your health goal", [
      {
        text: "Exercise more",
        onPress: () => updateHealthData("healthGoal", "Exercise more"),
      },
      {
        text: "Lose weight",
        onPress: () => updateHealthData("healthGoal", "Lose weight"),
      },
      {
        text: "Gain muscle",
        onPress: () => updateHealthData("healthGoal", "Gain muscle"),
      },
      {
        text: "Improve diet",
        onPress: () => updateHealthData("healthGoal", "Improve diet"),
      },
      {
        text: "Better sleep",
        onPress: () => updateHealthData("healthGoal", "Better sleep"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const HealthOption: React.FC<HealthOptionProps> = ({
    label,
    value,
    onPress,
    category,
  }) => (
    <TouchableOpacity style={styles.healthOption} onPress={onPress}>
      <View>
        <Text style={styles.categoryLabel}>{category}</Text>
        <Text style={styles.optionValue}>{value}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Edd Health Setup</Text>
          <Text style={styles.subtitle}>ฅ/ิ่งเร์ฌเข้มร</Text>

          <HealthOption
            category="血型・血液型"
            label="Blood Type"
            value={healthData.bloodType}
            onPress={handleBloodTypePress}
          />

          <HealthOption
            category="ALLERGIES"
            label="Allergies"
            value={healthData.allergies}
            onPress={handleAllergiesPress}
          />

          <HealthOption
            category="OCCUPATION"
            label="Occupation"
            value={healthData.occupation}
            onPress={handleOccupationPress}
          />

          <HealthOption
            category="HEALTH GOALS"
            label="Health Goals"
            value={healthData.healthGoal}
            onPress={handleHealthGoalPress}
          />

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HealthSetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    backgroundColor: "white",
    flexGrow: 1,
    justifyContent: "center",
    // padding: 20,
  },
  formContainer: {
    borderRadius: 12,
    padding: 24,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  registerButton: {
    backgroundColor: "#4285f4",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#4285f4",
    fontSize: 14,
    fontWeight: "500",
  },
  healthOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  categoryLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "500",
  },
  optionValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  arrow: {
    fontSize: 18,
    color: "#ccc",
    fontWeight: "300",
  },
  continueButton: {
    backgroundColor: "#4285f4",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
