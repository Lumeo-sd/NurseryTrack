import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { List, FAB, Text } from "react-native-paper";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function BatchesListScreen({ route, navigation }) {
  const { varietyId } = route.params;
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "batches"), where("varietyId", "==", varietyId));
    const unsub = onSnapshot(q, (snap) => {
      let arr = [];
      snap.forEach((doc) => arr.push({ ...doc.data(), id: doc.id }));
      setBatches(arr);
      setLoading(false);
    });
    return () => unsub();
  }, [varietyId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} color="#90ee90" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Партії для вибраного сорту</Text>
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`Партія ${item.batchId || item.id}`}
            description={`К-сть: ${item.quantity}, Статус: ${item.status}`}
            onPress={() => navigation.navigate("BatchDetail", { batchId: item.id })}
            style={styles.listItem}
          />
        )}
        ListEmptyComponent={<Text style={{ color: "#999", marginTop: 30, textAlign: "center" }}>Немає партій.</Text>}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("AddBatch", { varietyId })}
        label="Додати партію"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818" },
  title: { color: "#90ee90", fontSize: 20, margin: 18 },
  listItem: { backgroundColor: "#232323", marginVertical: 2 },
  fab: { position: "absolute", right: 16, bottom: 16, backgroundColor: "#90ee90" }
});