import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text, Title } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../api/client";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Будь ласка, заповніть всі поля");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);

      // Save token and user data
      await AsyncStorage.setItem(
        "authToken",
        response.data.session.access_token,
      );
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      Alert.alert("Успіх", "Ви успішно увійшли");
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || "Помилка входу. Перевірте email і пароль.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Title style={{ color: "#90ee90", marginBottom: 32 }}>
        🌱 NurseryTrack
      </Title>

      <TextInput
        label="Електронна пошта"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        label="Пароль"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        editable={!loading}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Увійти
      </Button>

      <Button
        mode="outlined"
        onPress={handleRegister}
        style={styles.button}
        disabled={loading}
      >
        Реєстрація
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#181818",
  },
  input: {
    marginBottom: 14,
    backgroundColor: "#232323",
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: "#ff7373",
    textAlign: "center",
    marginBottom: 6,
  },
});
