import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { List, FAB, Text } from "react-native-paper";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function VarietiesListScreen({ navigation }) {
  const [varieties, setVarieties] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "varieties"), (snap) => {
      let arr = [];
      snap.forEach((doc) => arr.push({ ...doc.data(), varietyId: doc.id }));
      setVarieties(arr);
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={varieties}
        keyExtractor={(item) => item.varietyId}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            onPress={() => navigation.navigate("BatchesList", { varietyId: item.varietyId })}
            style={styles.listItem}
          />
        )}
        ListEmptyComponent={<Text style={{ color: "#aaa", textAlign: "center", marginTop: 30 }}>Немає сортів.</Text>}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Реалізуйте додавання нового сорту (admin) */}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818" },
  listItem: { backgroundColor: "#232323", marginVertical: 2 },
  fab: { position: "absolute", right: 16, bottom: 16, backgroundColor: "#90ee90" }
});