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
  backgroundColor = theme.colors.background,
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
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
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
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
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
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  shadow = 'md',
}) => {
  const cardStyle = [
    styles.card,
    theme.shadows[shadow],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
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
  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          size === 'sm' && styles.badgeTextSm,
          styles[`badgeText${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
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
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightAction,
}) => {
  return (
    <View style={styles.sectionHeader}>
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

// ============= EMPTY STATE =============
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
          variant="secondary"
          size="md"
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );
};

// ============= DIVIDER =============
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

// ============= BOTTOM ACTION BAR =============
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

// ============= STYLES =============
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
    borderRadius: theme.radius.md,
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
  },
  buttonTextPrimary: {
    color: theme.colors.white,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.gray100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonTextSecondary: {
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
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
  },

  // Badge
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
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
    color: theme.colors.primary,
    fontWeight: '600',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextWarning: {
    ...theme.typography.captionM,
    color: '#D97706',
    fontWeight: '600',
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
  },
  badgeTextError: {
    ...theme.typography.captionM,
    color: theme.colors.error,
    fontWeight: '600',
  },
  badgeInfo: {
    backgroundColor: '#DBEAFE',
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
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  tagIcon: {
    marginRight: theme.spacing.xs,
  },
  tagText: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
  },
  tagTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionHeaderTitle: {
    ...theme.typography.headingM,
    color: theme.colors.textPrimary,
  },
  sectionHeaderSubtitle: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
    marginBottom: theme.spacing.base,
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
  },
  emptyStateButton: {
    marginTop: theme.spacing.base,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  dividerSm: {
    marginVertical: theme.spacing.sm,
  },
  dividerLg: {
    marginVertical: theme.spacing.lg,
  },

  // Bottom Action Bar
  bottomActionBar: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.sm,
  },
});
