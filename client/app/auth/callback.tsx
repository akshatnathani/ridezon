import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if profile is completed
        const profileCompleted = user.user_metadata?.profile_completed;
        
        if (profileCompleted) {
          // Profile already completed, go to home
          router.replace('/(tabs)');
        } else {
          // New user, needs to complete profile
          router.replace('/signup-complete');
        }
      } else {
        // No user found, go to login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      router.replace('/login');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
