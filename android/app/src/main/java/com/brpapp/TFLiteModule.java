package com.brpapp;

import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.Arrays;
import org.tensorflow.lite.DataType;
import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer;

public class TFLiteModule extends ReactContextBaseJavaModule {

  private Interpreter tflite;
  private TensorBuffer inputBuffer;
  private TensorBuffer outputBuffer;
  private Interpreter tfliteAcc;
  private TensorBuffer inputBufferAcc;
  private TensorBuffer outputBufferAcc;

  public TFLiteModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "TFLiteModule";
  }

  @ReactMethod
  public synchronized void loadModel(
    int sizeOfInput,
    String nameOfTheModel,
    Promise promise
  ) { // synchronized for safe model loading
    try {
      Interpreter.Options tfliteOptions = new Interpreter.Options();
      tflite = new Interpreter(loadModelFile(nameOfTheModel), tfliteOptions);
      // Initialize buffers after the model is loaded
      inputBuffer =
        TensorBuffer.createFixedSize(
          new int[] { 1, sizeOfInput },
          DataType.FLOAT32
        );
      outputBuffer =
        TensorBuffer.createFixedSize(
          tflite.getOutputTensor(0).shape(),
          DataType.FLOAT32
        );

      promise.resolve("Model loaded successfully");
    } catch (Exception e) {
      promise.reject("ERROR_LOADING_MODEL", e);
    }
  }

  @ReactMethod
  public synchronized void loadAccModel(
    int sizeOfInput,
    String nameOfTheModel,
    Promise promise
  ) { // synchronized for safe model loading
    try {
      Interpreter.Options tfliteOptions = new Interpreter.Options();
      tfliteAcc = new Interpreter(loadModelFile(nameOfTheModel), tfliteOptions);
      // Initialize buffers after the model is loaded
      inputBufferAcc =
        TensorBuffer.createFixedSize(
          new int[] { 1, sizeOfInput },
          DataType.FLOAT32
        );
      outputBufferAcc =
        TensorBuffer.createFixedSize(
          tfliteAcc.getOutputTensor(0).shape(),
          DataType.FLOAT32
        );

      promise.resolve("Model loaded successfully");
    } catch (Exception e) {
      promise.reject("ERROR_LOADING_MODEL", e);
    }
  }

  @ReactMethod
  public void predict(ReadableArray variables, Promise promise) {
    if (tflite == null) {
      promise.reject(
        "MODEL_NOT_LOADED",
        "Model not loaded. Make sure to call loadModel() first."
      );
      return;
    }

    // Set values for the inputArray
    float[] inputArray = new float[variables.size()];
    for (int i = 0; i < variables.size(); i++) {
      // Make sure the value is a number and cast it to float
      if (!variables.isNull(i) && variables.getType(i) == ReadableType.Number) {
        inputArray[i] = (float) variables.getDouble(i);
      } else {
        promise.reject(
          "INVALID_INPUT_TYPE",
          "Input must be an array of numbers."
        );
        return;
      }
    }

    // Load data into TensorBuffer
    inputBuffer.loadArray(inputArray);

    // Prepare output buffer
    float[] outputData = new float[tflite.getOutputTensor(0).shape()[1]];
    Arrays.fill(outputData, 0);
    outputBuffer.loadArray(outputData);

    // Run the prediction
    tflite.run(inputBuffer.getBuffer(), outputBuffer.getBuffer());

    int maxIndex = 0;
    float maxValue = outputBuffer.getFloatValue(0);
    for (int i = 1; i < outputData.length; i++) {
      if (outputBuffer.getFloatValue(i) > maxValue) {
        maxValue = outputBuffer.getFloatValue(i);
        maxIndex = i;
      }
    }

    // Return the index of the maximum value
    promise.resolve(maxIndex - 1);
  }

  @ReactMethod
  public void predictAcc(ReadableArray variables, Promise promise) {
    if (tfliteAcc == null) {
      promise.reject(
        "MODEL_NOT_LOADED",
        "Model not loaded. Make sure to call loadAccModel() first."
      );
      return;
    }

    // Set values for the inputArray
    float[] inputArray = new float[variables.size()];
    for (int i = 0; i < variables.size(); i++) {
      // Make sure the value is a number and cast it to float
      if (!variables.isNull(i) && variables.getType(i) == ReadableType.Number) {
        inputArray[i] = (float) variables.getDouble(i);
      } else {
        promise.reject(
          "INVALID_INPUT_TYPE",
          "Input must be an array of numbers."
        );
        return;
      }
    }

    // Load data into TensorBuffer
    inputBufferAcc.loadArray(inputArray);

    // Prepare output buffer
    float[] outputData = new float[tfliteAcc.getOutputTensor(0).shape()[1]];
    Arrays.fill(outputData, 0);
    outputBufferAcc.loadArray(outputData);

    // Run the prediction
    tfliteAcc.run(inputBufferAcc.getBuffer(), outputBufferAcc.getBuffer());

    int maxIndex = 0;
    float maxValue = outputBufferAcc.getFloatValue(0);
    for (int i = 1; i < outputData.length; i++) {
      if (outputBufferAcc.getFloatValue(i) > maxValue) {
        maxValue = outputBufferAcc.getFloatValue(i);
        maxIndex = i;
      }
    }

    // Return the index of the maximum value
    promise.resolve(maxIndex - 1);
  }

  private MappedByteBuffer loadModelFile(String nameOfTheModel)
    throws IOException {
    AssetManager assetManager = getReactApplicationContext().getAssets();
    AssetFileDescriptor fileDescriptor = assetManager.openFd(
      nameOfTheModel + ".tflite"
    );

    try (
      FileInputStream inputStream = new FileInputStream(
        fileDescriptor.getFileDescriptor()
      );
      FileChannel fileChannel = inputStream.getChannel()
    ) {
      long startOffset = fileDescriptor.getStartOffset();
      long declaredLength = fileDescriptor.getDeclaredLength();
      return fileChannel.map(
        FileChannel.MapMode.READ_ONLY,
        startOffset,
        declaredLength
      );
    }
  }
}
