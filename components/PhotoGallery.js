import React from "react";
import { ScrollView, Image, StyleSheet } from "react-native";

export default function PhotoGallery({ photos }) {
  return (
    <ScrollView horizontal style={{ minHeight: 110 }}>
      {(photos || []).map((url, idx) => (
        <Image key={idx} source={{ uri: url }} style={styles.photo} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  photo: { width: 100, height: 100, borderRadius: 8, margin: 8 }
});