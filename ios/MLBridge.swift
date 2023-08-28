import React
import CoreML


func createMultiArray(from numbers: [Float]) -> MLMultiArray? {
    guard let multiArray = try? MLMultiArray(shape: [NSNumber(integerLiteral: numbers.count)], dataType: .float32) else {
        return nil
    }
    
    for (index, number) in numbers.enumerated() {
        multiArray[index] = NSNumber(value: number)
    }
    
    return multiArray
}

@objc(MLBridge)
class MLBridge: NSObject {
  @objc func predict(variable1: Double, variable2: Double, variable3: Double, variable4: Double, variable5: Double, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

      
        guard let inputArray = createMultiArray(from: [Float(variable1), Float(variable2), Float(variable3), Float(variable4), Float(variable5)]) else {
            reject("ERROR", "Failed to create input array", nil)
            return
        }
        
        let input = networkTestInput(dense_input: inputArray)
        
        guard let model = try? networkTest(configuration: MLModelConfiguration()),
              let output = try? model.prediction(input: input) else {
            reject("ERROR", "Failed to run the model", nil)
            return
        }

        resolve(output.Identity)
    }
}
