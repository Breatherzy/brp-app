import React, { useEffect, useState } from "react";
import {
  NativeModules,
  SafeAreaView,
  StyleSheet,
  Platform,
  View,
  Text,
  StatusBar,
} from "react-native";
import ConnectScreen from "./screens/ConnectScreen";
import ChartsScreen from "./screens/ChartsScreen";
import StatisticScreen from "./screens/StatisticScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { activateKeepAwake } from '@sayem314/react-native-keep-awake';
import AccelerometerDataContext from "./contexts/AccelerometerDataContext";
import TensometerDataContext from "./contexts/TensometerDataContext";
import UserDataContext from "./contexts/UserDataContext";
import SettingsScreen from "./screens/SettingsScreen";

const Tab = createMaterialTopTabNavigator();

const StatusBarComponent = ({ statusBar }) => {
  return (
    <View style={styles.statusBarContainer}>
      <Text style={styles.statusBarText}>
        Model: {statusBar.selectedModel} | Moving Average:{" "}
        {statusBar.selectedMovingAverage} | States:{" "}
        {statusBar.selectedNumberOfStates}
      </Text>
    </View>
  );
};

const App = () => {
  const [accPoints, setAccPoints] = useState([]);
  const [tensPoints, setTensPoints] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [breathAmount, setBreathAmount] = useState(0);
  const [predMargin, setPredMargin] = useState(0.5);
  const [movingAverage, setMovingAverage] = useState(5);
  const [statusBar, setStatusBar] = useState({
    selectedModel: "ForestModel",
    selectedMovingAverage: 5,
    selectedNumberOfStates: 3,
  });

  useEffect(() => {
    activateKeepAwake();
    if (Platform.OS === "android") {
      NativeModules.TFLiteModule.loadModel(6, "ForestModel");
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />
      <StatusBarComponent statusBar={statusBar} />
      <TensometerDataContext.Provider value={{ tensPoints, setTensPoints }}>
        <AccelerometerDataContext.Provider value={{ accPoints, setAccPoints }}>
          <UserDataContext.Provider
            value={{ seconds, setSeconds, breathAmount, setBreathAmount }}
          >
            <NavigationContainer>
              <Tab.Navigator>
                <Tab.Screen name="Connect" component={ConnectScreen} />
                <Tab.Screen name="Charts">
                  {() => (
                    <ChartsScreen
                      predMargin={predMargin}
                      movingAverageWindow={movingAverage}
                      modelName={statusBar.selectedModel}
                    />
                  )}
                </Tab.Screen>
                <Tab.Screen name="Statistics" component={StatisticScreen} />
                <Tab.Screen name="Settings">
                  {() => (
                    <SettingsScreen
                      setPredMargin={setPredMargin}
                      setMovingAverage={setMovingAverage}
                      setStatusBar={setStatusBar}
                    />
                  )}
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
  statusBarContainer: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  statusBarText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#000",
  },
});

export default App;
