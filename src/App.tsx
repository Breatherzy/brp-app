import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import ConnectScreen from './screens/ConnectScreen'; // Make sure the path is correct
import ChartsScreen from './screens/ChartsScreen'; // Make sure the path is correct
import StatisticScreen from './screens/StatisticScreen'; // Make sure the path is correct
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AccelerometerDataContext from './contexts/AccelerometerDataContext';
import TensometerDataContext from './contexts/TensometerDataContext';


const Tab = createMaterialTopTabNavigator();

const App = () => {
  const [dataPointsAcc, setAccelerometerData] = useState<Array<{ y: number }>>([]);
  const [dataPointsTens, setTensometerData] = useState<Array<{ y: number }>>([]);

  return (
    <SafeAreaView style={styles.container}>
      <TensometerDataContext.Provider value={{ dataPointsTens, setTensometerData }}>
      <AccelerometerDataContext.Provider value={{ dataPointsAcc, setAccelerometerData }}>
        <NavigationContainer>
         <Tab.Navigator>
          <Tab.Screen name="Connection" component={ConnectScreen} />
          <Tab.Screen name="Charts" component={ChartsScreen} />
          <Tab.Screen name="Statistics" component={StatisticScreen} />
        </Tab.Navigator>
        </NavigationContainer>
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
