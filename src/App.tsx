import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import ConnectScreen from './screens/ConnectScreen'; // Make sure the path is correct
import ChartsScreen from './screens/ChartsScreen'; // Make sure the path is correct
import StatisticScreen from './screens/StatisticScreen'; // Make sure the path is correct
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ChartDataContext from './contexts/ChartDataContext';


const Tab = createMaterialTopTabNavigator();

const App = () => {
  const [dataPoints, setDataPoints] = useState<Array<{ y: number }>>([]);

  return (
    <SafeAreaView style={styles.container}>
      <ChartDataContext.Provider value={{ dataPoints, setDataPoints }}>
        <NavigationContainer>
         <Tab.Navigator>
          <Tab.Screen name="Connection" component={ConnectScreen} />
          <Tab.Screen name="Charts" component={ChartsScreen} />
          <Tab.Screen name="Statistics" component={StatisticScreen} />
        </Tab.Navigator>
        </NavigationContainer>
      </ChartDataContext.Provider>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
