// App.tsx
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';

import LoginScreen from './src/LoginScreen';
import SignUpScreen from './src/SignUpScreen';
import DashboardScreen from './src/DashboardScreen';
import ReportIssueScreen from './src/ReportIssueScreen';
import TicketHistoryScreen from './src/TicketHistoryScreen';
import TechnicianOrdersScreen from './src/TechnicianOrdersScreen';
import AdminConsoleScreen from './src/AdminConsoleScreen';

// Prevent splash screen from auto-hiding before app initialization completes
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error if already prevented */
});

const Stack = createStackNavigator();

export default function App() {
  // Global auth state controlling active portal access ('student' | 'technician' | 'admin' | null)
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Display MS Connect splash logo for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Splash error:', e);
      } finally {
        setAppIsReady(true);
        // Hide splash screen and transition to login screen
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepareApp();
  }, []);

  // Return null or empty container while splash screen is displaying
  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === null ? (
          // ==================== AUTHENTICATION STACK ====================
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setUserRole={setUserRole} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          // ==================== PROTECTED CORE HUB ====================
          <>
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardScreen 
                  {...props} 
                  userRole={userRole} 
                  setUserRole={setUserRole} 
                />
              )}
            </Stack.Screen>
            
            <Stack.Screen name="ReportIssue">
              {(props) => <ReportIssueScreen {...props} setUserRole={setUserRole} />}
            </Stack.Screen>

            <Stack.Screen name="TicketHistory" component={TicketHistoryScreen} />

            <Stack.Screen name="TechnicianOrders">
              {(props) => <TechnicianOrdersScreen {...props} setUserRole={setUserRole} />}
            </Stack.Screen>

            <Stack.Screen name="AdminConsole">
              {(props) => <AdminConsoleScreen {...props} setUserRole={setUserRole} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}