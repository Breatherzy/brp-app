package com.breath_research_project;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
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
    private float[] inputArray = new float[5];

    public TFLiteModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TFLiteModule";
    }

    @ReactMethod
    public synchronized void loadModel(Promise promise) {  // synchronized for safe model loading
        try {
            Interpreter.Options tfliteOptions = new Interpreter.Options();
            tfliteOptions.setNumThreads(4); // Set the number of threads you want to use
            tflite = new Interpreter(loadModelFile(), tfliteOptions);
            // Initialize buffers after the model is loaded
            inputBuffer = TensorBuffer.createFixedSize(new int[]{1, 5}, DataType.FLOAT32);
            outputBuffer = TensorBuffer.createFixedSize(tflite.getOutputTensor(0).shape(), DataType.FLOAT32);

            promise.resolve("Model loaded successfully");
        } catch (Exception e) {
            promise.reject("ERROR_LOADING_MODEL", e);
        }
    }

     @ReactMethod
    public void predict(float variable1, float variable2, float variable3, float variable4, float variable5, Promise promise) {
         if (tflite == null) {
            promise.reject("MODEL_NOT_LOADED", "Model not loaded. Make sure to call loadModel() first.");
            return;
        }

        // Set values for the inputArray
        inputArray[0] = variable1;
        inputArray[1] = variable2;
        inputArray[2] = variable3;
        inputArray[3] = variable4;
        inputArray[4] = variable5;

        // Load data into TensorBuffer
        inputBuffer.loadArray(inputArray);

        float[] emptyData = new float[tflite.getOutputTensor(0).shape()[1]];
        Arrays.fill(emptyData, 0);
        outputBuffer.loadArray(emptyData);

        tflite.run(inputBuffer.getBuffer(), outputBuffer.getBuffer());

        promise.resolve(outputBuffer.getFloatValue(0));
    }

    private MappedByteBuffer loadModelFile() throws IOException {
        AssetManager assetManager = getReactApplicationContext().getAssets();
        AssetFileDescriptor fileDescriptor = assetManager.openFd("networkTest.tflite");

        try (FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
             FileChannel fileChannel = inputStream.getChannel()) {
            long startOffset = fileDescriptor.getStartOffset();
            long declaredLength = fileDescriptor.getDeclaredLength();
            return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
        }
    }
}
