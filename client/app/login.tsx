import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ScreenContainer, Button } from '@/components/ui/primitives';
import { IconSymbol } from '@/components/ui/icon-symbol';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const redirectUrl = AuthSession.makeRedirectUri({
    scheme: 'ridezon',
    path: 'auth/callback',
  });

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google OAuth later
    // Temporarily bypass authentication for development
    setLoading(true);

    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)' as any);
    }, 1000);
  };

  return (
    <ScreenContainer backgroundColor={theme.colors.white}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      <View style={styles.content}>
        {/* Top Section: Logo & Branding */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.appName}>Ridezon</Text>
          <Text style={styles.tagline}>Campus rides, simplified.</Text>
        </View>

        {/* Bottom Section: Actions */}
        <View style={styles.actionSection}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Let's get started</Text>
            <Text style={styles.welcomeSubtitle}>
              Join your university community to find safe and affordable rides.
            </Text>
          </View>

          <Button
            title={loading ? 'Signing in...' : 'Continue with Google'}
            onPress={handleGoogleSignIn}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            leftIcon={<IconSymbol name="g.circle.fill" size={20} color={theme.colors.white} />}
            style={styles.googleButton}
          />

          <Text style={styles.footerText}>
            Only <Text style={styles.highlight}>.edu</Text> email addresses are accepted to ensure community safety.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    color: theme.colors.white,
    marginTop: 4, // Optical adjustment
  },
  appName: {
    ...theme.typography.headingXL,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    ...theme.typography.bodyL,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionSection: {
    width: '100%',
    paddingBottom: theme.spacing.xl,
  },
  welcomeContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...theme.typography.headingL,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  googleButton: {
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.captionM,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: theme.spacing.lg,
  },
  highlight: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
