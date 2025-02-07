import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import OfferDetailScreen from './OfferDetailScreen';
import HomePage from './HomePage';
import { useColorScheme } from '@/hooks/useColorScheme';
import SettingsScreen from './profile/SettingsScreen';
import PrivateProfileScreen from './profile/PrivateProfileScreen';
import PublicProfileScreen from './profile/PublicProfileScreen';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  useEffect(() => {
    const checkToken = async () => {
      await ApiService.loadTokenFromStorage();
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        console.log("Token found:", token);
        // Redirect to the home page or auto-login if needed
      } else {
        console.log("No token found, redirecting to login.");
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name="OfferDetailScreen" component={OfferDetailScreen} />
          <Stack.Screen name="profile/SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="profile/PrivateProfile" component={PrivateProfileScreen} />
          <Stack.Screen name="profile/PublicProfile" component={PublicProfileScreen} /> 
        </Stack>
    </ThemeProvider>
  );
}
