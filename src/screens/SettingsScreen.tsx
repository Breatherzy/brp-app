import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, NativeModules, Platform } from 'react-native';
import { Colors } from "react-native/Libraries/NewAppScreen";


const THREE_STATE_MODEL = 0.8
const TWO_STATE_MODEL = 0

const SettingsScreen = ({ setPredMargin, setMovingAverage}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [modelName, setModelName] = useState('networkTest');
  const [sizeOfBuffer, setSizeOfBuffer] = useState(5);


  useEffect(() => {
    if (Platform.OS === 'android') {
      NativeModules.TFLiteModule.loadModel(sizeOfBuffer, modelName);
    }
  }, [sizeOfBuffer, modelName]);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
    setPredMargin(isEnabled ? TWO_STATE_MODEL : THREE_STATE_MODEL);
  };

  const handleModelSelection = (name, movingAverage) => {
    setModelName(name);
    setMovingAverage(movingAverage);
    setSizeOfBuffer(movingAverage);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleToggle} style={styles.Button}>
        <Text style={styles.ButtonText}>{isEnabled ? "2-state model" : "3-state model"}</Text>
      </Pressable>
      <Text style={styles.Text}>Select model type:</Text>
      
      <Pressable
        onPress={() => handleModelSelection('networkTest', 5)}
        style={styles.Button}
      >
        <Text style={styles.ButtonText}>State Model</Text>
      </Pressable>
      
      <Pressable
        onPress={() => handleModelSelection('stopNetwork', 10)}
        style={styles.Button}
      >
        <Text style={styles.ButtonText}>Mono Model</Text>
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
      width: '100%',
      height: '100%',
      backgroundColor: '#0082FC',
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
        textAlign: 'center',
        color: 'black',
        justifyContent: 'center',
        },
});

export default SettingsScreen;
