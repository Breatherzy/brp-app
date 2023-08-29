import { NativeModules } from 'react-native';

// Destructure the MLBridge from NativeModules
const { MLBridge } = NativeModules;

// Using the predict function
export const usePrediction = async (points) => {
    try {
      const result = await MLBridge.predict(...points.map(p => p.y));
      return result;
    } catch (error) {
      console.error("Error predicting:", error);
    }
  }