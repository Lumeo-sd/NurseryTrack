import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function BatchPhotoUploadScreen({ route, navigation }) {
  const { batchId } = route.params;
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets && res.assets[0].uri) setImage(res.assets[0].uri);
  };

  const uploadImage = async () => {
    setUploading(true);
    const img = await fetch(image);
    const blob = await img.blob();
    const fileRef = ref(storage, `batches/${batchId}/${Date.now()}.jpg`);
    await uploadBytes(fileRef, blob);
    const url = await getDownloadURL(fileRef);
    await updateDoc(doc(db, "batches", batchId), { photos: arrayUnion(url) });
    setUploading(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Button icon="camera" onPress={pickImage}>Зробити фото</Button>
      {image && <Image source={{ uri: image }} style={styles.img} />}
      {image && <Button loading={uploading} mode="contained" onPress={uploadImage}>Завантажити</Button>}
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent:"center", alignItems:"center", backgroundColor:"#181818" }, img: { width: 220, height: 220, margin: 16 } });