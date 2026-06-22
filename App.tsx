// App.tsx
import 'react-native-gesture-handler'; // Required prerequisite package for smooth touch gesture support on iOS
import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // Context wrapper that maintains the global navigation state
import { createStackNavigator } from '@react-navigation/stack'; // Service that manages screen transitions using a native stack model

// Importing our screen layout components from our source directory
import LoginScreen from './src/LoginScreen';
import SignUpScreen from './src/SignUpScreen';
import DashboardScreen from './src/DashboardScreen';
import ReportIssueScreen from './src/ReportIssueScreen';
import TicketHistoryScreen from './src/TicketHistoryScreen';
import TechnicianOrdersScreen from './src/TechnicianOrdersScreen'; 
import AdminConsoleScreen from './src/AdminConsoleScreen';  
// Instantiating the Stack Navigator object
const Stack = createStackNavigator();

export default function App() {
  return (
    // NavigationContainer must wrap all navigation routing configurations
    <NavigationContainer>
      {/* headerShown: false hides the default native top-bar, 
        allowing us to build our own clean, custom dark UI headers 
      */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* The first Stack.Screen listed is loaded as the default home route of the application */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
        <Stack.Screen name="TicketHistory" component={TicketHistoryScreen} />
        <Stack.Screen name="TechnicianOrders" component={TechnicianOrdersScreen} />
        <Stack.Screen name="AdminConsole" component={AdminConsoleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
