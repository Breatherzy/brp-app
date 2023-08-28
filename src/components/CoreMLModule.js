import { NativeModules } from 'react-native';

// Destructure the MLBridge from NativeModules
const { MLBridge } = NativeModules;

// Using the predict function
export const usePrediction = async () => {
  try {
    console.log("Predicting...");
    const result = await MLBridge.predict(0.1, 0.2, 0.3, 0.4, 0.5);
    console.log(result);
  } catch (error) {
    console.error("Error predicting:", error);
  }
}