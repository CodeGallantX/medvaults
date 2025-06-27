import * as Location from "expo-location";
import api from "../assets/api.js"; // 👈 your centralized axios instance

export const SendEmergencyAlert = async () => {
  try {
    // 🔐 Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    // 📍 Get current location
    const location = await Location.getCurrentPositionAsync({});
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
  } catch (error) {
    console.error(
      "Emergency alert failed ❌",
      error.response?.data || error.message
    );
    alert("Something went wrong sending the alert.");
  }
};
