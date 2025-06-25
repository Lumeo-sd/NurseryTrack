import React from "react";
import QRCode from "react-native-qrcode-svg";
import { View } from "react-native";

export default function QRCodeComponent({ value }) {
  return (
    <View style={{ alignItems: "center" }}>
      <QRCode value={value} size={120} />
    </View>
  );
}