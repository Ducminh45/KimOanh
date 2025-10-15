import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';
import Toast from 'react-native-toast-message';

interface BarcodeScannerScreenProps {
  navigation: any;
}

const BarcodeScannerScreen: React.FC<BarcodeScannerScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanning(true);

    try {
      // Call API to get product info from barcode
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const productData = await response.json();

      if (productData.status === 1) {
        const product = productData.product;
        
        // Navigate to scan result with product data
        navigation.navigate('ScanResult', {
          scannedFoods: [{
            name: product.product_name || 'Unknown Product',
            nameVi: product.product_name_vi || product.product_name,
            confidence: 0.95,
            calories: product.nutriments?.['energy-kcal_100g'] || 0,
            protein: product.nutriments?.proteins_100g || 0,
            carbohydrates: product.nutriments?.carbohydrates_100g || 0,
            fats: product.nutriments?.fat_100g || 0,
            fiber: product.nutriments?.fiber_100g || 0,
            servingSize: '100g',
            category: product.categories?.split(',')[0] || 'packaged_food',
            verified: true,
          }],
          imageUri: product.image_url,
          barcode: data,
        });

        Toast.show({
          type: 'success',
          text1: 'Tìm thấy sản phẩm!',
          text2: product.product_name,
        });
      } else {
        Alert.alert(
          'Không tìm thấy',
          'Không tìm thấy thông tin sản phẩm. Bạn có muốn thêm thủ công?',
          [
            { text: 'Hủy', onPress: () => setScanned(false) },
            {
              text: 'Thêm thủ công',
              onPress: () => navigation.navigate('AddFoodLog'),
            },
          ]
        );
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể quét mã vạch',
      });
      setScanned(false);
    } finally {
      setScanning(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>Đang yêu cầu quyền camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-off" size={64} color={Colors.gray400} />
          <Text style={styles.messageText}>Không có quyền truy cập camera</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestCameraPermission}
          >
            <Text style={styles.buttonText}>Cấp quyền</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Quét mã vạch</Text>
        <TouchableOpacity onPress={() => setScanned(false)}>
          <Ionicons name="flash" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Scanner Frame */}
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          {/* Corners */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          
          {/* Scan Line */}
          {!scanned && (
            <View style={styles.scanLine} />
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {scanning
            ? 'Đang tìm kiếm sản phẩm...'
            : scanned
            ? 'Đã quét! Đang xử lý...'
            : 'Đặt mã vạch vào giữa khung hình'}
        </Text>
        
        {scanned && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.resetButtonText}>Quét lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="barcode-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Quét mã vạch trên bao bì thực phẩm
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
          <Text style={styles.infoText}>
            Tự động lấy thông tin dinh dưỡng
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.white,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 300,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: '50%',
  },
  instructions: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: spacing.lg,
  },
  instructionText: {
    fontSize: fontSize.md,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  infoCard: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: Colors.text,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  messageText: {
    fontSize: fontSize.lg,
    color: Colors.white,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  buttonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

export default BarcodeScannerScreen;
