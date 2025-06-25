import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import VarietiesListScreen from "../screens/Inventory/VarietiesListScreen";
import ReportsScreen from "../screens/ReportsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddActionModal from "../screens/AddActionModal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#90ee90",
      tabBarStyle: { backgroundColor: "#222" }
    }}
  >
    <Tab.Screen
      name="Головна"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
        )
      }}
    />
    <Tab.Screen
      name="Інвентар"
      component={VarietiesListScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="sprout" color={color} size={size} />
        )
      }}
    />
    <Tab.Screen
      name="Додати"
      component={AddActionModal}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="plus-circle" color={color} size={size + 8} />
        ),
        tabBarLabel: ""
      }}
    />
    <Tab.Screen
      name="Звіти"
      component={ReportsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
        )
      }}
    />
    <Tab.Screen
      name="Профіль"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" color={color} size={size} />
        )
      }}
    />
  </Tab.Navigator>
);

export default BottomTabNavigator;