import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function FoodScan() {
  return (
    <ScrollView
      style={{
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "600",
        }}
      >
        Food Scanner
      </Text>

      {/* image */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "space-between",
          paddingVertical: 20,
          backgroundColor: "gray",
          height: 200,
          borderRadius: 15,
          marginVertical: 20,
        }}
      ></View>

      {/* chat */}
      <View
        style={{
          gap: 15,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 8,
            width: "80%",
            marginLeft: "auto",
          }}
        >
          <View>
            <Text>Hi there, does this contain my allergies?</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "gray",
            padding: 10,
            borderRadius: 8,
            width: "80%",
          }}
        >
          <View>
            <Text>Yes it contains the following:</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 8,
            width: "80%",
            marginLeft: "auto",
          }}
        >
          <View>
            <Text>Hi there, does this contain my allergies?</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "gray",
            padding: 10,
            borderRadius: 8,
            width: "80%",
          }}
        >
          <View>
            <Text>Yes it contains the following:</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 8,
            width: "80%",
            marginLeft: "auto",
          }}
        >
          <View>
            <Text>Hi there, does this contain my allergies?</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "gray",
            padding: 10,
            borderRadius: 8,
            width: "80%",
          }}
        >
          <View>
            <Text>Yes it contains the following:</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 8,
            width: "80%",
            marginLeft: "auto",
          }}
        >
          <View>
            <Text>Hi there, does this contain my allergies?</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "gray",
            padding: 10,
            borderRadius: 8,
            width: "80%",
          }}
        >
          <View>
            <Text>Yes it contains the following:</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
