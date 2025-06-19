import React, { useEffect, useRef } from "react";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  CameraMode,
} from "expo-camera";
import { useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AntDesign,
  FontAwesome6,
} from "@expo/vector-icons";
import { useImagePicker } from "@/hooks/useImagePicker";

interface CameraScannerProps {
  setUploadUri: (uri: string | null) => void;
}

export default function CameraScanner({ setUploadUri }: CameraScannerProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("picture");

  const [uri, setUri] = useState<string | null>(null);
  const { imageUri, handleChooseImage, imageName, setImageUri } =
    useImagePicker();

  useEffect(() => {
    // When a picture is taken, pass it to parent
    if (uri) {
      setUploadUri(uri);
      setUri(null);
    }
  }, [uri, setUploadUri]);

  useEffect(() => {
    // When an image is picked from gallery, pass it to parent
    if (imageUri) {
      setUploadUri(imageUri);
      setImageUri(null);
    }
  }, [imageUri, setUploadUri, setImageUri]);

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={mode}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <TouchableOpacity
            hitSlop={20}
            onPress={handleChooseImage}
            style={styles.galleryButton}
          >
            <AntDesign name="picture" size={32} color="white" />
          </TouchableOpacity>
          
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: mode === "picture" ? "white" : "red",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          
          <Pressable onPress={toggleCameraFacing} style={styles.flipButton}>
            <FontAwesome6 name="camera-rotate" size={32} color="white" />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});