import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, TextInput, Title, HelperText } from "react-native-paper";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth } from "../firebase";

export default function BatchActionScreen({ route, navigation }) {
  const { batchId, actionType } = route.params;
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const handleAction = async () => {
    if (!quantity) return setErr("Вкажіть кількість");
    const batchRef = doc(db, "batches", batchId);
    const batchDoc = await getDoc(batchRef);
    const batch = batchDoc.data();
    let newQty = batch.quantity;
    let updates = {};
    if (actionType === "SALE") {
      newQty -= Number(quantity);
      updates.status = newQty <= 0 ? "продано" : batch.status;
      updates.quantity = newQty;
      updates.price = price ? Number(price) : batch.price;
    }
    if (actionType === "TRANSPLANT") {
      updates.status = "дорощування";
      updates.notes = note;
    }
    await addDoc(collection(db, "actionLogs"), {
      batchId,
      userId: auth.currentUser.uid,
      actionType,
      details: { quantity: Number(quantity), price: price ? Number(price) : null, note },
      timestamp: serverTimestamp(),
    });
    await updateDoc(batchRef, updates);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Title style={{ color: "#90ee90" }}>{actionType === "SALE" ? "Продаж" : "Пересадка"}</Title>
      <TextInput label="Кількість" value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={styles.input} />
      {actionType === "SALE" && (
        <TextInput label="Ціна, грн" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
      )}
      {actionType === "TRANSPLANT" && (
        <TextInput label="Примітка" value={note} onChangeText={setNote} style={styles.input} />
      )}
      <HelperText type="error" visible={!!err}>{err}</HelperText>
      <Button mode="contained" onPress={handleAction}>Підтвердити</Button>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#181818", padding: 20 }, input: { marginBottom: 14, backgroundColor: "#232323" } });