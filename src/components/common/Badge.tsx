import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { lightTheme } from '@/constants/themes';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rounded' | 'pill' | 'square';
  outline?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  shape = 'rounded',
  outline = false,
  style,
  textStyle,
  testID,
}) => {
  const badgeStyle = [
    styles.badge,
    styles[variant],
    styles[size],
    styles[shape],
    outline && styles[`${variant}Outline`],
    style,
  ];

  const badgeTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    outline && styles[`${variant}OutlineText`],
    textStyle,
  ];

  return (
    <View style={badgeStyle} testID={testID}>
      <Text style={badgeTextStyle}>{children}</Text>
    </View>
  );
};

export interface NotificationBadgeProps {
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  maxCount = 99,
  showZero = false,
  dot = false,
  style,
  textStyle,
  testID,
}) => {
  if (!showZero && count === 0) {
    return null;
  }

  if (dot) {
    return (
      <View style={[styles.dot, style]} testID={testID} />
    );
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[styles.notificationBadge, style]} testID={testID}>
      <Text style={[styles.notificationText, textStyle]}>
        {displayCount}
      </Text>
    </View>
  );
};

export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: number;
  style?: ViewStyle;
  testID?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 12,
  style,
  testID,
}) => {
  const statusStyle = [
    styles.statusBadge,
    styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`],
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    style,
  ];

  return <View style={statusStyle} testID={testID} />;
};

export interface AchievementBadgeProps {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  rarity,
  icon,
  name,
  size = 'medium',
  style,
  testID,
}) => {
  const badgeStyle = [
    styles.achievementBadge,
    styles[`achievement${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`],
    styles[`achievement${size.charAt(0).toUpperCase() + size.slice(1)}`],
    style,
  ];

  return (
    <View style={badgeStyle} testID={testID}>
      {icon && (
        <Text style={styles.achievementIcon}>{icon}</Text>
      )}
      <Text style={styles.achievementName}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  success: {
    backgroundColor: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warning,
  },
  error: {
    backgroundColor: Colors.error,
  },
  info: {
    backgroundColor: Colors.info,
  },
  neutral: {
    backgroundColor: Colors.gray,
  },

  // Outline variants
  primaryOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  successOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  warningOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  errorOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  infoOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.info,
  },
  neutralOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.gray,
  },

  // Sizes
  small: {
    paddingHorizontal: lightTheme.spacing.xs,
    paddingVertical: 2,
    minHeight: 20,
  },
  medium: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    minHeight: 24,
  },
  large: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    minHeight: 32,
  },

  // Shapes
  rounded: {
    borderRadius: lightTheme.borderRadius.sm,
  },
  pill: {
    borderRadius: lightTheme.borderRadius.full,
  },
  square: {
    borderRadius: 0,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  successText: {
    color: Colors.white,
  },
  warningText: {
    color: Colors.white,
  },
  errorText: {
    color: Colors.white,
  },
  infoText: {
    color: Colors.white,
  },
  neutralText: {
    color: Colors.white,
  },

  // Outline text styles
  primaryOutlineText: {
    color: Colors.primary,
  },
  secondaryOutlineText: {
    color: Colors.secondary,
  },
  successOutlineText: {
    color: Colors.success,
  },
  warningOutlineText: {
    color: Colors.warning,
  },
  errorOutlineText: {
    color: Colors.error,
  },
  infoOutlineText: {
    color: Colors.info,
  },
  neutralOutlineText: {
    color: Colors.gray,
  },

  // Size-specific text styles
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },

  // Notification badge
  notificationBadge: {
    backgroundColor: Colors.error,
    borderRadius: lightTheme.borderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
  },
  notificationText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Dot badge
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    position: 'absolute',
    top: -4,
    right: -4,
  },

  // Status badges
  statusBadge: {
    borderWidth: 2,
    borderColor: Colors.white,
  },
  statusOnline: {
    backgroundColor: Colors.success,
  },
  statusOffline: {
    backgroundColor: Colors.gray,
  },
  statusBusy: {
    backgroundColor: Colors.error,
  },
  statusAway: {
    backgroundColor: Colors.warning,
  },

  // Achievement badges
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 2,
  },
  achievementCommon: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
  },
  achievementRare: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  achievementEpic: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  achievementLegendary: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  achievementSmall: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
  },
  achievementMedium: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
  },
  achievementLarge: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
  },
  achievementIcon: {
    fontSize: 16,
    marginRight: lightTheme.spacing.xs,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default Badge;