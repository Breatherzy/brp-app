package com.brpapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.Callback;
import android.content.res.AssetManager;
import android.content.res.AssetFileDescriptor;
import java.util.Arrays;

import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.DataType;
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer;

import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.io.FileInputStream;
import java.io.IOException;

public class TFLiteModule extends ReactContextBaseJavaModule {
    private Interpreter tflite;
    private TensorBuffer inputBuffer;
    private TensorBuffer outputBuffer;
    private float[] inputArray5 = new float[5];
    private float[] inputArray10 = new float[10];

    public TFLiteModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TFLiteModule";
    }

    @ReactMethod
    public synchronized void loadModel(int sizeOfInput, String nameOfTheModel, Promise promise) {  // synchronized for safe model loading
        try {
            Interpreter.Options tfliteOptions = new Interpreter.Options();
            tflite = new Interpreter(loadModelFile(nameOfTheModel), tfliteOptions);
            // Initialize buffers after the model is loaded
            inputBuffer = TensorBuffer.createFixedSize(new int[]{1, sizeOfInput}, DataType.FLOAT32);
            outputBuffer = TensorBuffer.createFixedSize(tflite.getOutputTensor(0).shape(), DataType.FLOAT32);

            promise.resolve("Model loaded successfully");
        } catch (Exception e) {
            promise.reject("ERROR_LOADING_MODEL", e);
        }
    }

    @ReactMethod
public void predict(ReadableArray variables, Promise promise) {
    if (tflite == null) {
        promise.reject("MODEL_NOT_LOADED", "Model not loaded. Make sure to call loadModel() first.");
        return;
    }

    // Set values for the inputArray
    float[] inputArray = new float[variables.size()];
    for (int i = 0; i < variables.size(); i++) {
        // Make sure the value is a number and cast it to float
        if (!variables.isNull(i) && variables.getType(i) == ReadableType.Number) {
            inputArray[i] = (float) variables.getDouble(i);
        } else {
            promise.reject("INVALID_INPUT_TYPE", "Input must be an array of numbers.");
            return;
        }
    }

    // Load data into TensorBuffer
    inputBuffer.loadArray(inputArray);

    // Prepare output buffer assuming the output is a single float value
    float[] outputData = new float[tflite.getOutputTensor(0).shape()[1]];
    Arrays.fill(outputData, 0);
    outputBuffer.loadArray(outputData);

    // Run the prediction
    tflite.run(inputBuffer.getBuffer(), outputBuffer.getBuffer());

    // Return the result
    promise.resolve(outputBuffer.getFloatValue(0));
}


    @ReactMethod
    public void predict(float variable1, float variable2, float variable3, float variable4, float variable5, float variable6, float variable7, float variable8, float variable9, float variable10, Promise promise) {
         if (tflite == null) {
            promise.reject("MODEL_NOT_LOADED", "Model not loaded. Make sure to call loadModel() first.");
            return;
        }

        // Set values for the inputArray
        inputArray10[0] = variable1;
        inputArray10[1] = variable2;
        inputArray10[2] = variable3;
        inputArray10[3] = variable4;
        inputArray10[4] = variable5;
        inputArray10[5] = variable6;
        inputArray10[6] = variable7;
        inputArray10[7] = variable8;
        inputArray10[8] = variable9;
        inputArray10[9] = variable10;

        // Load data into TensorBuffer
        inputBuffer.loadArray(inputArray10);

        float[] emptyData = new float[tflite.getOutputTensor(0).shape()[1]];
        Arrays.fill(emptyData, 0);
        outputBuffer.loadArray(emptyData);

        tflite.run(inputBuffer.getBuffer(), outputBuffer.getBuffer());

        promise.resolve(outputBuffer.getFloatValue(0));
    }

    private MappedByteBuffer loadModelFile(String nameOfTheModel) throws IOException {
        AssetManager assetManager = getReactApplicationContext().getAssets();
        AssetFileDescriptor fileDescriptor = assetManager.openFd(nameOfTheModel+".tflite");

        try (FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
             FileChannel fileChannel = inputStream.getChannel()) {
            long startOffset = fileDescriptor.getStartOffset();
            long declaredLength = fileDescriptor.getDeclaredLength();
            return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
        }
    }
}
