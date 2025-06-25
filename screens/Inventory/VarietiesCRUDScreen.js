import React, { useState, useEffect } from "react";
import { View, FlatList, Alert, StyleSheet } from "react-native";
import { TextInput, Button, Text, List, FAB, Dialog, Portal } from "react-native-paper";
import { db } from "../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { auth } from "../../firebase";

export default function VarietiesCRUDScreen() {
  const [varieties, setVarieties] = useState([]);
  const [name, setName] = useState("");
  const [latinName, setLatinName] = useState("");
  const [editId, setEditId] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "varieties"), (snap) => {
      let arr = [];
      snap.forEach((doc) => arr.push({ ...doc.data(), varietyId: doc.id }));
      setVarieties(arr);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editId) {
      await updateDoc(doc(db, "varieties", editId), { name, latinName });
    } else {
      await addDoc(collection(db, "varieties"), { name, latinName });
    }
    setName(""); setLatinName(""); setEditId(null); setVisible(false);
  };

  const handleEdit = (item) => {
    setName(item.name); setLatinName(item.latinName || ""); setEditId(item.varietyId); setVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Видалити?", "Видалити сорт?", [
      { text: "Скасувати" },
      { text: "Видалити", style: "destructive", onPress: async () => await deleteDoc(doc(db, "varieties", id)) }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#181818" }}>
      <FlatList
        data={varieties}
        keyExtractor={item => item.varietyId}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.latinName}
            right={() => (
              <>
                <Button onPress={() => handleEdit(item)}>Ред.</Button>
                <Button onPress={() => handleDelete(item.varietyId)} color="red">X</Button>
              </>
            )}
          />
        )}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ backgroundColor: "#232323" }}>
          <Dialog.Title>{editId ? "Редагувати сорт" : "Новий сорт"}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Назва" value={name} onChangeText={setName} />
            <TextInput label="Latin name" value={latinName} onChangeText={setLatinName} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Скасувати</Button>
            <Button onPress={handleSave}>Зберегти</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
const styles = StyleSheet.create({ fab: { position: "absolute", right: 18, bottom: 18, backgroundColor: "#90ee90" } });