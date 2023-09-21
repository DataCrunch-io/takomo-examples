import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async () => {};

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        placeholder="Enter image prompt"
        onChangeText={setPrompt}
        value={prompt}
      />
      <Button title="Generate Image" onPress={handleSubmit} />
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: 200, marginTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
