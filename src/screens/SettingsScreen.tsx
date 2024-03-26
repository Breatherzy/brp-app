import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  NativeModules,
  Platform,
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

const SettingsScreen = ({ setStatusBar, modelName, setModelName }) => {
  useEffect(() => {
    if (Platform.OS === "android") {
      NativeModules.TFLiteModule.loadModel(6, `${modelName}_tens`);
      NativeModules.TFLiteModule.loadAccModel(12, `${modelName}_acc`);
    }
  }, [modelName]);

  useEffect(() => {
    console.log(`Model name: ${modelName}`);
    setStatusBar({
      selectedModel: modelName,
    });
  }, [modelName]);

  const handleModelSelection = (name) => {
    setModelName(name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.Text}>Select model type:</Text>
      <Pressable
        onPress={() => handleModelSelection("GRUModel")}
        style={[
          styles.Button,
          modelName === "GRUModel" && { backgroundColor: "#069400" },
        ]}
      >
        <Text style={styles.ButtonText}>GRUModel</Text>
      </Pressable>
      <Pressable
        onPress={() => handleModelSelection("LSTMModel")}
        style={[
          styles.Button,
          modelName === "LSTMModel" && { backgroundColor: "#069400" },
        ]}
      >
        <Text style={styles.ButtonText}>LSTMModel</Text>
      </Pressable>
    </View>
  );
};

const boxShadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0082FC",
    padding: 6,
  },
  Button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#0a398a",
    margin: 10,
    borderRadius: 12,
    ...boxShadow,
  },
  ButtonText: {
    fontSize: 20,
    letterSpacing: 0.25,
    color: Colors.white,
  },
  Text: {
    fontSize: 30,
    textAlign: "center",
    color: "black",
    justifyContent: "center",
  },
});

export default SettingsScreen;
