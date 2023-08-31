import { NativeModules, Platform } from 'react-native';

// Depending on the platform, choose the appropriate NativeModule
const MLBridge = Platform.OS === 'ios' ? NativeModules.MLBridge : NativeModules.TFLiteModule;

export const usePrediction = async (points) => {
    try {
        if (Platform.OS === 'ios') {
            const result = await MLBridge.predict(...points.map(p => p.y));
            return result;
        } else { // Assuming Android as only other option
            // You might need to adjust this call based on how the TFLiteModule's predict function is set up
            const start = Date.now();
            const result = await MLBridge.predict(...points.map(p => p.y));
            const end = Date.now();
            console.log("Prediction took", end - start, "ms", Date());
            console.log("Prediction result:", result);
            return [result];
        }
    } catch (error) {
        console.error("Error predicting:", error);
    }
}
