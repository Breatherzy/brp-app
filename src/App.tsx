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
import { activateKeepAwake } from "@sayem314/react-native-keep-awake";
import AccelerometerDataContext from "./contexts/AccelerometerDataContext";
import TensometerDataContext from "./contexts/TensometerDataContext";
import UserDataContext from "./contexts/UserDataContext";
import SettingsScreen from "./screens/SettingsScreen";

const Tab = createMaterialTopTabNavigator();

const StatusBarComponent = ({ statusBar }) => {
  return (
    <View style={styles.statusBarContainer}>
      <Text style={styles.statusBarText}>Model: {statusBar.selectedModel}</Text>
    </View>
  );
};

const App = () => {
  const [accPoints, setAccPoints] = useState([]);
  const [tensPoints, setTensPoints] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);
  const [breathAmount, setBreathAmount] = useState(0);
  const [modelName, setModelName] = useState("GRUModel");
  const [statusBar, setStatusBar] = useState({
    selectedModel: modelName,
  });

  useEffect(() => {
    activateKeepAwake();
    if (Platform.OS === "android") {
      NativeModules.TFLiteModule.loadModel(6, `${modelName}_tens`);
      NativeModules.TFLiteModule.loadAccModel(12, `${modelName}_acc`);
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
                <Tab.Screen name="Connect">
                  {() => (
                    <ConnectScreen
                      setConnected={setConnected}
                    />
                  )}
                </Tab.Screen>
                <Tab.Screen name="Charts">
                  {() => (
                    <ChartsScreen
                      modelName={statusBar.selectedModel}
                      connection={connected}
                    />
                  )}
                </Tab.Screen>
                <Tab.Screen name="Statistics" component={StatisticScreen} />
                <Tab.Screen name="Settings">
                  {() => (
                    <SettingsScreen
                      setStatusBar={setStatusBar}
                      modelName={modelName}
                      setModelName={setModelName}
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
