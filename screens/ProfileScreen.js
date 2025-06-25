import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Title } from "react-native-paper";
import { auth } from "../firebase";

export default function ProfileScreen() {
  const handleLogout = () => auth.signOut();

  return (
    <View style={styles.container}>
      <Title style={{ color: "#90ee90" }}>Профіль</Title>
      <Button mode="contained" onPress={handleLogout} style={styles.logout}>
        Вийти з акаунта
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818", padding: 16, justifyContent: "center" },
  logout: { marginTop: 32 }
});