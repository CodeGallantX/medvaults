import * as Location from "expo-location";
import api from "../assets/api.js";

export const SendEmergencyAlert = async () => {
  try {
    // 🔐 Request permission with more detailed error handling
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied. Please enable it in settings.");
      return;
    }

    // Check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      alert("Location services are disabled. Please enable them in your device settings.");
      return;
    }

    // 📍 Get current location with timeout and accuracy options
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000, // 10 seconds timeout
    }).catch(error => {
      console.error("Location error:", error);
      throw new Error("Could not get your current location. Please check your connection and try again.");
    });

    const { latitude, longitude } = location.coords;

    // 🚀 Send location to backend
    const res = await api.post("/send_message/", {
      location: {
        latitude,
        longitude,
      },
    });

    console.log("Emergency sent ✅", res.data);
    alert("Emergency alert sent successfully!");
    return res.data; // Return the response data for further processing if needed
  } catch (error) {
    console.error(
      "Emergency alert failed ❌",
      error.response?.data || error.message
    );
    alert(error.message || "Something went wrong sending the alert. Please try again.");
    throw error; // Re-throw the error if you want calling code to handle it
  }
};