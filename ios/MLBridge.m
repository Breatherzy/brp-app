//
//  MLBridge.m
//  breath_research_project
//
//  Created by Maciej Szefler on 28/08/2023.
//
// MLBridge.m
#import "MLBridge.h"
#import <CoreML/CoreML.h>
#import "networkTest.h"

@implementation MLBridge
RCT_EXPORT_MODULE();

- (MLMultiArray *)createMultiArrayFromNumbers:(NSArray<NSNumber *> *)numbers {
    NSError *error;
    MLMultiArray *multiArray = [[MLMultiArray alloc] initWithShape:@[@1, @(numbers.count)] dataType:MLMultiArrayDataTypeFloat32 error:&error];
    if (error) {
        return nil;
    }
    for (NSInteger i = 0; i < numbers.count; i++) {
        multiArray[i] = numbers[i];
    }
    return multiArray;
}

NSArray *arrayFromMultiArray(MLMultiArray *multiArray) {
    NSMutableArray *array = [NSMutableArray array];
    for (NSUInteger i = 0; i < multiArray.count; i++) {
        [array addObject:multiArray[i]];
    }
    return [array copy];
}

RCT_REMAP_METHOD(predict, variable1:(double)variable1 variable2:(double)variable2 variable3:(double)variable3 variable4:(double)variable4 variable5:(double)variable5 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray<NSNumber *> *numbers = @[@(variable1), @(variable2), @(variable3), @(variable4), @(variable5)];
    MLMultiArray *inputArray = [self createMultiArrayFromNumbers:numbers];
    
    if (!inputArray) {
        NSLog(@"Debug: Failed to create inputArray");
        reject(@"ERROR", @"Failed to create input array", nil);
        return;
    }

  networkTest *model = [[networkTest alloc] init];
  
      if (!model) {
          NSLog(@"Debug: Failed to instantiate model");
          reject(@"ERROR", @"Failed to instantiate model", nil);
          return;
      }
  
     NSError *predictionError;
     networkTestOutput *output = [model predictionFromDense_input:inputArray error:&predictionError];
      
  if (predictionError) {
      NSLog(@"Debug: Model prediction error: %@", [predictionError localizedDescription]);
      reject(@"ERROR", @"Failed to run the model", predictionError);
      return;
  } else if (!output || !output.Identity) {
    NSLog(@"Debug: Prediction output or output.Identity is null");
    reject(@"ERROR", @"Prediction resulted in a null output", nil);
    return;
  }
  
    NSArray *resultArray = arrayFromMultiArray(output.Identity);
    resolve(resultArray);
}

- (void)predict:(double)variable1 variable2:(double)variable2 variable3:(double)variable3 variable4:(double)variable4 variable5:(double)variable5 resolver:(__strong RCTPromiseResolveBlock)resolver rejecter:(__strong RCTPromiseRejectBlock)rejecter {
}

@end
