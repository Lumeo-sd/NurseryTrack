import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Button, Card, Title, Chip, Divider } from "react-native-paper";
import { db } from "../../firebase";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import QRCode from "react-native-qrcode-svg";
import { auth } from "../../firebase";

export default function BatchDetailScreen({ route, navigation }) {
  const { batchId } = route.params;
  const [batch, setBatch] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "batches", batchId), (docSnap) => {
      setBatch(docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [batchId]);

  useEffect(() => {
    const q = query(collection(db, "actionLogs"), where("batchId", "==", batchId));
    const unsub = onSnapshot(q, (snap) => {
      let arr = [];
      snap.forEach((doc) => arr.push({ ...doc.data(), id: doc.id }));
      arr.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setLogs(arr);
    });
    return () => unsub();
  }, [batchId]);

  if (loading || !batch) return <Text style={styles.loading}>Завантаження...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Партія {batch.batchId || batch.id}</Title>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Сорт: {batch.varietyId}</Text>
          <Text>К-сть: {batch.quantity}</Text>
          <Text>Статус: <Chip>{batch.status}</Chip></Text>
          <Text>Об'єм: {batch.containerSize}</Text>
          <Text>Локація: {batch.location}</Text>
          <Text>Ціна: {batch.price || "-"}</Text>
          <Text>Дата додавання: {batch.dateAdded?.toDate?.().toLocaleDateString() || "-"}</Text>
          {batch.notes ? <Text>Примітки: {batch.notes}</Text> : null}
        </Card.Content>
        <Card.Actions>
          <Button icon="qrcode" onPress={() => {}}>QR-код</Button>
          <Button icon="camera" onPress={() => {/* Додати фото */}}>Додати фото</Button>
          <Button icon="pencil" onPress={() => {/* Редагувати */}}>Редагувати</Button>
        </Card.Actions>
      </Card>
      <Text style={styles.subtitle}>Фото партії</Text>
      <ScrollView horizontal style={{ minHeight: 110 }}>
        {(batch.photos || []).map((url, idx) => (
          <Image key={idx} source={{ uri: url }} style={styles.photo} />
        ))}
      </ScrollView>
      <Divider style={{ marginVertical: 16 }} />
      <Text style={styles.subtitle}>QR-код партії:</Text>
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <QRCode value={batch.qrCodeValue || batch.id} size={120} backgroundColor="#181818" />
      </View>
      <Divider style={{ marginVertical: 16 }} />
      <Text style={styles.subtitle}>Історія дій</Text>
      {logs.map((log) => (
        <Card key={log.id} style={styles.logCard}>
          <Card.Content>
            <Text>{log.actionType} ({log.details?.quantity ? `К-сть: ${log.details.quantity}` : ""})</Text>
            <Text>{log.timestamp?.toDate?.().toLocaleString() || "-"}</Text>
            <Text>Користувач: {log.userId}</Text>
          </Card.Content>
        </Card>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818" },
  title: { color: "#90ee90", margin: 18, fontSize: 20 },
  card: { margin: 10, backgroundColor: "#232323" },
  subtitle: { color: "#90ee90", fontSize: 16, marginLeft: 18, marginTop: 18 },
  photo: { width: 100, height: 100, borderRadius: 8, margin: 8 },
  logCard: { margin: 8, backgroundColor: "#232323" },
  loading: { color: "#90ee90", textAlign: "center", marginTop: 50 }
});