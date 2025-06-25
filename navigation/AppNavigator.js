import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import BottomTabNavigator from "./BottomTabNavigator";
import LoginScreen from "../screens/LoginScreen";
import BatchesListScreen from "../screens/Inventory/BatchesListScreen";
import BatchDetailScreen from "../screens/Inventory/BatchDetailScreen";
import AddBatchScreen from "../screens/Inventory/AddBatchScreen";
import ScanQRScreen from "../screens/ScanQRScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="BatchesList" component={BatchesListScreen} />
          <Stack.Screen name="BatchDetail" component={BatchDetailScreen} />
          <Stack.Screen name="AddBatch" component={AddBatchScreen} />
          <Stack.Screen name="ScanQR" component={ScanQRScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}