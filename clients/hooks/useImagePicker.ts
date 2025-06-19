import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Platform } from "react-native";

export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null | undefined>("")

  const handleChooseImage = async () => {
    if (Platform.OS === "web") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageName(result.assets[0].fileName);
      console.log(result.assets[0])
    }
  };

  return { imageUri, handleChooseImage, imageName, setImageUri };
}
