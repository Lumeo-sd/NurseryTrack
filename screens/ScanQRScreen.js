import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Button, Text } from "react-native-paper";

export default function ScanQRScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    navigation.navigate("BatchDetail", { batchId: data });
  };

  if (hasPermission === null) return <Text>Запит дозволу на камеру...</Text>;
  if (hasPermission === false) return <Text>Доступ до камери заборонено.</Text>;

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1, width: "100%" }}
      />
      {scanned && <Button onPress={() => setScanned(false)}>Сканувати ще раз</Button>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});