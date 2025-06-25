import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Title, DataTable, Button } from "react-native-paper";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ReportsScreen() {
  const [sales, setSales] = useState([]);
  const [sum, setSum] = useState(0);
  const [dateFrom, setDateFrom] = useState(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState("");

  const loadSales = async () => {
    let q = query(collection(db, "actionLogs"), where("actionType", "==", "SALE"));
    const docs = await getDocs(q);
    let arr = [];
    let total = 0;
    docs.forEach(docSnap => {
      let d = docSnap.data();
      if (
        (!dateFrom || (d.timestamp && d.timestamp.toDate().toISOString().slice(0, 10) >= dateFrom)) &&
        (!dateTo || (d.timestamp && d.timestamp.toDate().toISOString().slice(0, 10) <= dateTo))
      ) {
        arr.push(d);
        total += d.details?.price ? d.details.price * d.details.quantity : 0;
      }
    });
    setSales(arr);
    setSum(total);
  };

  useEffect(() => { loadSales(); }, []);

  return (
    <ScrollView style={styles.container}>
      <Title style={{ color: "#90ee90" }}>Фінансові звіти</Title>
      <View style={styles.filterRow}>
        <Text>З:</Text>
        <TextInput value={dateFrom} placeholder="YYYY-MM-DD" onChangeText={setDateFrom} style={styles.dateInput} />
        <Text>По:</Text>
        <TextInput value={dateTo} placeholder="YYYY-MM-DD" onChangeText={setDateTo} style={styles.dateInput} />
        <Button onPress={loadSales}>Фільтр</Button>
      </View>
      <Text style={styles.sum}>Сума продажів: {sum} грн</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Дата</DataTable.Title>
          <DataTable.Title>Партія</DataTable.Title>
          <DataTable.Title>К-сть</DataTable.Title>
          <DataTable.Title>Сума</DataTable.Title>
        </DataTable.Header>
        {sales.map((s, idx) => (
          <DataTable.Row key={idx}>
            <DataTable.Cell>{s.timestamp?.toDate?.().toLocaleDateString() || ""}</DataTable.Cell>
            <DataTable.Cell>{s.batchId}</DataTable.Cell>
            <DataTable.Cell>{s.details?.quantity}</DataTable.Cell>
            <DataTable.Cell>{s.details?.price ? s.details.price * s.details.quantity : ""}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818", padding: 18 },
  filterRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dateInput: { backgroundColor: "#232323", width: 110, marginHorizontal: 4, height: 36 },
  sum: { color: "#90ee90", marginVertical: 10, fontSize: 18 }
});