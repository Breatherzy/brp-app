import React, { useEffect, useState } from 'react';
import { NativeModules, SafeAreaView, StyleSheet, Platform } from 'react-native';
import ConnectScreen from './screens/ConnectScreen';
import ChartsScreen from './screens/ChartsScreen';
import StatisticScreen from './screens/StatisticScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AccelerometerDataContext from './contexts/AccelerometerDataContext';
import TensometerDataContext from './contexts/TensometerDataContext';
import UserDataContext from './contexts/UserDataContext';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createMaterialTopTabNavigator();

const App = () => {
  const [accPoints, setAccPoints] = useState([]);
  const [tensPoints, setTensPoints] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [breathAmount, setBreathAmount] = useState(0);
  const [predMargin, setPredMargin] = useState(0.8);
  const [movingAverage, setMovingAverage] = useState(5);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NativeModules.TFLiteModule.loadModel(5, "networkTest");
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TensometerDataContext.Provider value={{ tensPoints, setTensPoints }}>
        <AccelerometerDataContext.Provider value={{ accPoints, setAccPoints }}>
          <UserDataContext.Provider value={{ seconds, setSeconds, breathAmount, setBreathAmount }}>
            <NavigationContainer>
              <Tab.Navigator>
                <Tab.Screen name="Connection" component={ConnectScreen} />
                <Tab.Screen name="Charts">
                  {() => <ChartsScreen predMargin={predMargin} movingAverageWindow={movingAverage} />}
                </Tab.Screen>
                <Tab.Screen name="Statistics" component={StatisticScreen} />
                <Tab.Screen name="Settings">
                  {() => <SettingsScreen setPredMargin={setPredMargin} setMovingAverage={setMovingAverage}/>}
                </Tab.Screen>
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
