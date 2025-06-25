import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

export default function AddActionModal({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={{ color: "#90ee90" }}>Виберіть дію:</Text>
      <Button mode="contained" style={styles.btn} onPress={() => navigation.navigate("AddBatch", {})}>
        Додати нову партію
      </Button>
      <Button mode="outlined" style={styles.btn} onPress={() => navigation.navigate("ScanQR", {})}>
        Логувати дію (QR)
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818", justifyContent: "center", alignItems: "center" },
  btn: { width: 220, marginVertical: 8 }
});