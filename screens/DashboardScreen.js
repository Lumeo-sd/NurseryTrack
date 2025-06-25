import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Title } from "react-native-paper";

export default function DashboardScreen() {
  // TODO: Підключіть статистику з Firestore
  return (
    <View style={styles.container}>
      <Title style={{ color: "#90ee90" }}>Головна</Title>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Всього рослин: ...</Text>
          <Text>Готово до продажу: ...</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818", padding: 16 },
  card: { marginVertical: 12, backgroundColor: "#222" }
});