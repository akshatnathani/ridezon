import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const redirectUrl = AuthSession.makeRedirectUri({
    scheme: 'ridezon',
    path: 'auth/callback',
  });

  console.log('Redirect URL:', redirectUrl);

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google OAuth later
    // Temporarily bypass authentication for development
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)' as any);
    }, 1000);

    /* COMMENTED OUT - Google OAuth Implementation
    try {
      setLoading(true);

      console.log('Starting OAuth with redirect:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success' && result.url) {
          // Parse the URL to get tokens
          const url = result.url;
          let params: URLSearchParams;
          
          // Check if tokens are in hash or query
          if (url.includes('#')) {
            params = new URLSearchParams(url.split('#')[1]);
          } else if (url.includes('?')) {
            params = new URLSearchParams(url.split('?')[1]);
          } else {
            throw new Error('No authentication parameters found');
          }

          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          
          if (access_token && refresh_token) {
            const { data: { session }, error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) {
              throw sessionError;
            }

            // Verify email domain
            if (session?.user?.email) {
              if (!session.user.email.endsWith('.edu')) {
                await supabase.auth.signOut();
                Alert.alert(
                  'Invalid Email Domain',
                  'Only .edu email addresses are allowed. Please sign in with your university email.',
                  [{ text: 'OK' }]
                );
                setLoading(false);
                return;
              }

              // Success - navigate to callback which will check profile completion
              router.replace('/auth/callback');
            }
          } else {
            throw new Error('Authentication tokens not received');
          }
        } else if (result.type === 'cancel') {
          Alert.alert('Cancelled', 'Sign in was cancelled');
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Error', error.message || 'An error occurred during sign in');
      setLoading(false);
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.appName}>Ridezon</Text>
          <Text style={styles.tagline}>Student Ride Sharing</Text>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.subtitleText}>
            Sign in with your .edu email to continue
          </Text>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Only .edu email addresses are accepted
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#ffffff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 32,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  footerText: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
