import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight } from '@constants/themes';

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert('Image selected', 'Food scanning will be processed here');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>📸</Text>
          <Text style={styles.placeholderLabel}>Camera View</Text>
          <Text style={styles.subtitle}>Point at food to scan</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <View style={styles.spacer} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { flex: 1, width: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.gray800 },
  placeholderText: { fontSize: 80, marginBottom: spacing.md },
  placeholderLabel: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: Colors.white },
  subtitle: { fontSize: fontSize.md, color: Colors.gray400, marginTop: spacing.xs },
  controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: spacing.xl, backgroundColor: Colors.black },
  galleryButton: { backgroundColor: Colors.gray700, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 8 },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary },
  spacer: { width: 80 },
  message: { fontSize: fontSize.lg, color: Colors.white, textAlign: 'center', marginBottom: spacing.lg },
  button: { backgroundColor: Colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 8 },
  buttonText: { color: Colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});

export default CameraScreen;
