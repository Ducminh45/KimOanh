import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';
import Button from './Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom' | 'top';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  position = 'center',
  closeOnBackdrop = true,
  showCloseButton = true,
  animationType = 'fade',
  transparent = true,
  style,
  contentStyle,
  titleStyle,
  testID,
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const modalStyle = [
    styles.modal,
    styles[position],
    style,
  ];

  const contentStyles = [
    styles.content,
    styles[size],
    position === 'bottom' && styles.bottomContent,
    position === 'top' && styles.topContent,
    contentStyle,
  ];

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={modalStyle}>
          <TouchableWithoutFeedback>
            <View style={contentStyles}>
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && (
                    <Text style={[styles.title, titleStyle]}>{title}</Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                    >
                      <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={styles.body}>
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  testID?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttons = [{ text: 'OK', onPress: onClose }],
  testID,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      size="small"
      closeOnBackdrop={false}
      showCloseButton={false}
      testID={testID}
    >
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <View style={styles.alertButtons}>
          {buttons.map((button, index) => (
            <Button
              key={index}
              title={button.text}
              onPress={button.onPress || onClose}
              variant={
                button.style === 'destructive'
                  ? 'danger'
                  : button.style === 'cancel'
                  ? 'outline'
                  : 'primary'
              }
              style={[
                styles.alertButton,
                buttons.length > 1 && index < buttons.length - 1 && styles.alertButtonMargin,
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
};

export interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  testID?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  destructive = false,
  testID,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertModal
      visible={visible}
      onClose={onClose}
      title={title}
      message={message}
      buttons={[
        {
          text: cancelText,
          onPress: onClose,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: handleConfirm,
          style: destructive ? 'destructive' : 'default',
        },
      ]}
      testID={testID}
    />
  );
};

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
  testID?: string;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  title,
  children,
  height = screenHeight * 0.6,
  testID,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      position="bottom"
      animationType="slide"
      showCloseButton={false}
      contentStyle={{ height }}
      testID={testID}
    >
      <View style={styles.bottomSheetHandle} />
      {title && (
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.bottomSheetClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.bottomSheetContent}>
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: lightTheme.spacing.lg,
  },
  bottom: {
    justifyContent: 'flex-end',
  },
  top: {
    justifyContent: 'flex-start',
    paddingTop: 50, // Account for status bar
  },

  // Content
  content: {
    backgroundColor: Colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    ...lightTheme.shadows.lg,
  },
  small: {
    maxWidth: screenWidth * 0.8,
    minWidth: 280,
  },
  medium: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
  },
  large: {
    width: screenWidth * 0.95,
    maxHeight: screenHeight * 0.9,
  },
  fullscreen: {
    width: screenWidth,
    height: screenHeight,
    borderRadius: 0,
  },
  bottomContent: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: lightTheme.borderRadius.lg,
    borderTopRightRadius: lightTheme.borderRadius.lg,
  },
  topContent: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: lightTheme.borderRadius.lg,
    borderBottomRightRadius: lightTheme.borderRadius.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: lightTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: lightTheme.typography.h3.fontSize,
    fontWeight: lightTheme.typography.h3.fontWeight,
    color: Colors.text,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: lightTheme.spacing.md,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: '300',
  },

  // Body
  body: {
    padding: lightTheme.spacing.lg,
    flex: 1,
  },

  // Alert styles
  alertContent: {
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  alertMessage: {
    fontSize: lightTheme.typography.body1.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.xl,
    lineHeight: 24,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  alertButton: {
    flex: 1,
    maxWidth: 120,
  },
  alertButtonMargin: {
    marginRight: lightTheme.spacing.md,
  },

  // Bottom sheet styles
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.md,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingBottom: lightTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  bottomSheetTitle: {
    fontSize: lightTheme.typography.h4.fontSize,
    fontWeight: lightTheme.typography.h4.fontWeight,
    color: Colors.text,
    flex: 1,
  },
  bottomSheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetContent: {
    flex: 1,
    padding: lightTheme.spacing.lg,
  },
});

export default Modal;