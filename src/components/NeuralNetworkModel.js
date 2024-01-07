import {NativeModules, Platform} from 'react-native';
// Depending on the platform, choose the appropriate NativeModule
const MLBridge =
  Platform.OS === 'ios' ? NativeModules.MLBridge : NativeModules.TFLiteModule;

export const useTensPrediction = async points => {
  try {
    if (Platform.OS === 'ios') {
      const result = await MLBridge.predict(...points.map(p => p.y));
      return result;
    } else {
      const result = await MLBridge.predict(points.map(p => p.y));
      return [result];
    }
  } catch (error) {
    console.error('Error predicting:', error);
  }
};

export const useAccPrediction = async points => {
  try {
    if (Platform.OS === 'ios') {
      const result = await MLBridge.predictAcc(...points.map(p => p.y));
      return result;
    } else {
      const result = await MLBridge.predictAcc(points.map(p => p.y));
      return [result];
    }
  } catch (error) {
    console.error('Error predicting:', error);
  }
};