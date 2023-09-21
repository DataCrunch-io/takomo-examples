import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";

// Don't do in in production, env variables are public
const PIPELINE_URL = process.env.EXPO_PUBLIC_PIPELINE_URL;
const AUTH_TOKEN = process.env.EXPO_PUBLIC_AUTH_TOKEN;

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [imageLink, setImageLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a valid prompt.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(PIPELINE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({ input: prompt }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      console.log(data)
      setImageLink(data.data?.output?.downloadUrl);
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert("Error", "Failed to generate the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={loading}
        textContent={"Generating..."}
        textStyle={styles.spinnerText}
      />
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter image prompt"
        style={styles.input}
      />
      <Button title="Generate Image" onPress={handleGenerateImage} />
      {imageLink && <Image source={{ uri: imageLink }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    alignSelf: "center",
  },
  spinnerText: {
    color: "#FFF",
  },
});
