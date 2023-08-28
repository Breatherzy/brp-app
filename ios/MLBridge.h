//
//  MLBridge.h
//  breath_research_project
//
//  Created by Maciej Szefler on 28/08/2023.
//

#ifndef MLBridge_h
#define MLBridge_h
#import <React/RCTBridgeModule.h>

@interface MLBridge : NSObject <RCTBridgeModule>
- (void)predict:(double)variable1 variable2:(double)variable2 variable3:(double)variable3 variable4:(double)variable4 variable5:(double)variable5 resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter;
@end

#endif /* MLBridge_h */
