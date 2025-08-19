import React from "react";
import { TouchableOpacity, View, Platform } from "react-native";

export function CircularTabButton({
  children,
  onPress,
  accessibilityState,
}: {
  children?: React.ReactNode;
  onPress?: () => void;
  accessibilityState?: {
    selected: boolean;
  };
}) {
  const isSelected = accessibilityState?.selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          paddingTop: 10,
          backgroundColor: "#0076D6",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 35, // Elevates the circle above the tab bar
          ...Platform.select({
            ios: {
              shadowColor: "#0076D6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}
