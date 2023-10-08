import React, {useEffect, useState} from 'react';
import {NativeModules, SafeAreaView, StyleSheet, Platform} from 'react-native';
import ConnectScreen from './screens/ConnectScreen'; // Make sure the path is correct
import ChartsScreen from './screens/ChartsScreen'; // Make sure the path is correct
import StatisticScreen from './screens/StatisticScreen'; // Make sure the path is correct
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AccelerometerDataContext from './contexts/AccelerometerDataContext';
import TensometerDataContext from './contexts/TensometerDataContext';
import UserDataContext from './contexts/UserDataContext';

const Tab = createMaterialTopTabNavigator();

const App = () => {
  const [accPoints, setAccPoints] = useState<Array<{y: number}>>([]);
  const [tensPoints, setTensPoints] = useState<Array<{y: number}>>([]);
  const [seconds, setSeconds] = useState(0);
  const [breathAmount, setBreathAmount] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NativeModules.TFLiteModule.loadModel();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TensometerDataContext.Provider value={{tensPoints, setTensPoints}}>
        <AccelerometerDataContext.Provider value={{accPoints, setAccPoints}}>
          <UserDataContext.Provider
            value={{seconds, setSeconds, breathAmount, setBreathAmount}}>
            <NavigationContainer>
              <Tab.Navigator>
                <Tab.Screen name="Connection" component={ConnectScreen} />
                <Tab.Screen name="Charts" component={ChartsScreen} />
                <Tab.Screen name="Statistics" component={StatisticScreen} />
              </Tab.Navigator>
            </NavigationContainer>
          </UserDataContext.Provider>
        </AccelerometerDataContext.Provider>
      </TensometerDataContext.Provider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
