import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Title } from "react-native-paper";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { auth } from "../../firebase";

export default function AddBatchScreen({ route, navigation }) {
  const { varietyId } = route.params || {};
  const [quantity, setQuantity] = useState("");
  const [containerSize, setContainerSize] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    const docRef = await addDoc(collection(db, "batches"), {
      varietyId,
      quantity: Number(quantity),
      status: "укорінення",
      containerSize,
      location,
      dateAdded: serverTimestamp(),
      notes,
      photos: [],
      qrCodeValue: "",
      price: null,
      dateRooted: null,
    });
    // Оновити qrCodeValue для цієї партії
    await updateDoc(doc(db, "batches", docRef.id), { qrCodeValue: docRef.id });
    await addDoc(collection(db, "actionLogs"), {
      batchId: docRef.id,
      userId: auth.currentUser.uid,
      actionType: "CREATE",
      details: { quantity: Number(quantity) },
      timestamp: serverTimestamp(),
    });
    setLoading(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={{ color: "#90ee90", margin: 18 }}>Нова партія</Title>
      <TextInput label="Кількість" value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={styles.input} />
      <TextInput label="Об'єм контейнера" value={containerSize} onChangeText={setContainerSize} style={styles.input} />
      <TextInput label="Локація" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput label="Примітки" value={notes} onChangeText={setNotes} style={styles.input} multiline />
      <Button mode="contained" onPress={handleAdd} loading={loading} style={styles.button}>Створити партію</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181818", padding: 18 },
  input: { marginBottom: 12, backgroundColor: "#232323" },
  button: { marginTop: 10 }
});