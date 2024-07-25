import { NativeModules } from "react-native";
// Depending on the platform, choose the appropriate NativeModule
const MLBridge = NativeModules.TFLiteModule;

export const useTensPrediction = async (points) => {
  try {
    const result = await MLBridge.predict(points.map((p) => p.y));
    return [result];
  } catch (error) {
    console.error("Error predicting:", error);
  }
};

export const useAccPrediction = async (points) => {
  try {
    const result = await MLBridge.predictAcc(points.map((p) => p.y));
    return [result];
  } catch (error) {
    console.error("Error predicting:", error);
  }
};
