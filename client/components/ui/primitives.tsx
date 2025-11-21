/**
 * Reusable UI Primitives
 * Design system building blocks
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

// ============= SCREEN CONTAINER =============
interface ScreenContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  backgroundColor = theme.colors.backgroundSecondary, // Default to secondary for better contrast with cards
  edges = ['top', 'bottom'],
}) => {
  return (
    <SafeAreaView style={[styles.screenContainer, { backgroundColor }]} edges={edges}>
      {children}
    </SafeAreaView>
  );
};

// ============= BUTTONS =============
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as ViewStyle,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as ViewStyle,
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    size === 'sm' ? theme.typography.buttonSmall : theme.typography.button,
    styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? theme.colors.white : theme.colors.primary}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.buttonIcon}>{leftIcon}</View>}
          <Text style={textStyle}>{title}</Text>
          {rightIcon && <View style={styles.buttonIcon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

// ============= CARD =============
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  shadow = 'sm',
  variant = 'elevated',
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && theme.shadows[shadow],
    variant === 'outlined' && styles.cardOutlined,
    variant === 'flat' && styles.cardFlat,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// ============= BADGE =============
interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantKey = `badge${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;
  const textVariantKey = `badgeText${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        styles[variantKey] as ViewStyle,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          size === 'sm' && styles.badgeTextSm,
          styles[textVariantKey] as TextStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

// ============= TAG / CHIP =============
interface TagProps {
  text: string;
  onPress?: () => void;
  selected?: boolean;
  leftIcon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  text,
  onPress,
  selected = false,
  leftIcon,
}) => {
  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {leftIcon && <View style={styles.tagIcon}>{leftIcon}</View>}
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{text}</Text>
    </TouchableOpacity>
  );
};

// ============= SECTION HEADER =============
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionHeaderSubtitle}>{subtitle}</Text>}
      </View>
      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress} activeOpacity={0.7}>
          <Text style={styles.sectionHeaderAction}>{rightAction.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>{icon}</View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="primary"
          size="md"
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );
};

interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg';
}

export const Divider: React.FC<DividerProps> = ({ spacing = 'md' }) => {
  return (
    <View
      style={[
        styles.divider,
        spacing === 'sm' && styles.dividerSm,
        spacing === 'lg' && styles.dividerLg,
      ]}
    />
  );
};

interface BottomActionBarProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  children,
  backgroundColor = theme.colors.white,
}) => {
  return (
    <View style={[styles.bottomActionBar, { backgroundColor }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Screen Container
  screenContainer: {
    flex: 1,
  },

  // Button Base
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full, // More modern rounded buttons
    paddingHorizontal: theme.spacing.xl,
  },
  buttonSm: {
    height: theme.buttonHeight.sm,
    paddingHorizontal: theme.spacing.base,
  },
  buttonMd: {
    height: theme.buttonHeight.md,
    paddingHorizontal: theme.spacing.lg,
  },
  buttonLg: {
    height: theme.buttonHeight.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonXl: {
    height: theme.buttonHeight.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginHorizontal: theme.spacing.sm,
  },

  // Button Variants
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  buttonTextPrimary: {
    color: theme.colors.white,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.primaryLight,
  },
  buttonTextSecondary: {
    color: theme.colors.primaryDark,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.gray300,
  },
  buttonTextOutline: {
    color: theme.colors.textPrimary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonTextGhost: {
    color: theme.colors.primary,
  },
  buttonDanger: {
    backgroundColor: theme.colors.error,
  },
  buttonTextDanger: {
    color: theme.colors.white,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl, // Larger radius for modern feel
    padding: theme.spacing.base,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cardFlat: {
    backgroundColor: theme.colors.gray50,
  },

  // Badge
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.sm, // Slightly squarer badges
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  badgeSuccess: {
    backgroundColor: theme.colors.primaryLight,
  },
  badgeTextSuccess: {
    ...theme.typography.captionM,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  badgeWarning: {
    backgroundColor: '#FFFBEB',
  },
  badgeTextWarning: {
    ...theme.typography.captionM,
    color: '#B45309',
    fontWeight: '600',
  },
  badgeError: {
    backgroundColor: '#FEF2F2',
  },
  badgeTextError: {
    ...theme.typography.captionM,
    color: theme.colors.error,
    fontWeight: '600',
  },
  badgeInfo: {
    backgroundColor: '#EFF6FF',
  },
  badgeTextInfo: {
    ...theme.typography.captionM,
    color: theme.colors.info,
    fontWeight: '600',
  },
  badgeNeutral: {
    backgroundColor: theme.colors.gray100,
  },
  badgeTextNeutral: {
    ...theme.typography.captionM,
    color: theme.colors.gray700,
    fontWeight: '600',
  },
  badgeText: {
    ...theme.typography.captionM,
    fontWeight: '600',
  },
  badgeTextSm: {
    ...theme.typography.captionS,
  },

  // Tag
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    ...theme.shadows.sm,
  },
  tagSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagIcon: {
    marginRight: theme.spacing.xs,
  },
  tagText: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: theme.colors.white,
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionHeaderTitle: {
    ...theme.typography.headingL,
    color: theme.colors.textPrimary,
  },
  sectionHeaderSubtitle: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderAction: {
    ...theme.typography.bodyM,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateIcon: {
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  emptyStateTitle: {
    ...theme.typography.headingM,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    maxWidth: 280,
  },
  emptyStateButton: {
    minWidth: 160,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: theme.spacing.lg,
  },
  dividerSm: {
    marginVertical: theme.spacing.md,
  },
  dividerLg: {
    marginVertical: theme.spacing.xl,
  },

  // Bottom Action Bar
  bottomActionBar: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
    backgroundColor: theme.colors.white,
    ...theme.shadows.lg, // Stronger shadow for floating feel
  },
});
