import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  Pressable,
} from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";
import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";

const SECONDS_TO_SCAN_FOR = 3;
const INODE_SERVICE_UUID = "04710c44-c624-de89-c1bc-4396089d1886";
const INODE_CHARACTERISTIC_UUID = "04710c43-4c62-4de8-9c1b-c439689d1886";
const INODE_WORK_MODE = [0xc0, 0x84];
const INODE_BATTERY_SERVICE_UUID = "180f";
const INODE_BATTERY_CHARACTERISTIC_UUID = "2a19";
const ACC_SERVICE_UUID = "0000ffe5-0000-1000-8000-00805f9a34fb";
const ACC_CHARACTERISTIC_UUID = "0000ffe4-0000-1000-8000-00805f9a34fb";
const TENS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const TENS_CHARACTERISTIC_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = false;

import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from "react-native-ble-manager";
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import { useAccelerometerData } from "../hooks/useAccelerometerData";
import { useTensometerData } from "../hooks/useTensometerData";

declare module "react-native-ble-manager" {
  // enrich local contract with custom state properties needed by App.tsx
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

const ConnectScreen = () => {
  const { setAccPoints } = useAccelerometerData();
  const { setTensPoints } = useTensometerData();
  const [batteryLevels, setBatteryLevels] = useState(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral["id"], Peripheral>()
  );

  //console.debug("peripherals map updated", [...peripherals.entries()]);

  const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
    // new Map() enables changing the reference & refreshing UI.
    // TOFIX not efficient.
    setPeripherals((map) => new Map(map.set(id, updatedPeripheral)));
  };

  const startScan = () => {
    if (!isScanning) {
      // reset found peripherals before scan
      setPeripherals(new Map<Peripheral["id"], Peripheral>());
      retrieveConnected();

      try {
        console.debug("[startScan] starting scan...");
        setIsScanning(true);
        BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
          matchMode: BleScanMatchMode.Sticky,
          scanMode: BleScanMode.LowLatency,
          callbackType: BleScanCallbackType.AllMatches,
        })
          .then(() => {
            console.debug("[startScan] scan promise returned successfully.");
          })
          .catch((err) => {
            console.error("[startScan] ble scan returned in error", err);
          });
      } catch (error) {
        console.error("[startScan] ble scan error thrown", error);
      }
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    console.debug("[handleStopScan] scan is stopped.");
  };

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent
  ) => {
    setPeripherals((peripherals) => {
      const peripheral = peripherals.get(event.peripheral);
      if (peripheral) {
        console.debug(
          `[handleDisconnectedPeripheral][${peripheral.id}] previously connected peripheral is disconnected.`,
          event.peripheral
        );
        addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connected: false,
        });
        setBatteryLevels((prev) => {
          prev.delete(peripheral.id);
          return new Map(prev);
        });
      }
      console.debug(
        `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`
      );
      return peripherals;
    });
  };

  const handleUpdateValueForCharacteristic = (
    data: BleManagerDidUpdateValueForCharacteristicEvent
  ) => {
    // console.debug(
    //   `[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}'`
    // );
    if (data.service == ACC_SERVICE_UUID) {
      const accelerometerValue = computeAccelerometerValue(data);
      setAccPoints((prevData) => [...prevData, { y: accelerometerValue }]);
    } else if (data.service == TENS_SERVICE_UUID) {
      const tensometerData = computeTensometerValue(data);
      if (tensometerData && typeof tensometerData.force === "number") {
        setTensPoints((prevData) => [...prevData, { y: tensometerData.force }]);
      } else {
        console.error("Failed to compute tensometer value.");
      }
    } else if (data.service == INODE_SERVICE_UUID) {
      const inodeData = computeInodeValue(data);
      setAccPoints((prevData) => [...prevData, { y: inodeData }]);
    }
  };

  const computeAccelerometerValue = (data: { value: Iterable<number> }) => {
    const bytes = new Int8Array(data.value);

    // Extract high and low bytes for each axis
    const axH = bytes[3];
    const axL = bytes[2];
    const ayH = bytes[5];
    const ayL = bytes[4];
    const azH = bytes[7];
    const azL = bytes[6];

    // Convert bytes to float values for each axis
    const ax = ((axH * 256 + axL) / 32768.0) * 16;
    const ay = ((ayH * 256 + ayL) / 32768.0) * 16;
    const az = ((azH * 256 + azL) / 32768.0) * 16;

    const sumAcc = Math.abs(ax + ay + az);

    return sumAcc;
  };

  function uint8ArrayToString(data) {
    return String.fromCharCode.apply(null, data);
  }

  const computeInodeValue = (data: { value: Iterable<number> }) => {
    const bytes = new Int8Array(data.value);

    const axL = bytes[0];
    const axH = bytes[1];
    const ayL = bytes[2];
    const ayH = bytes[3];
    const azL = bytes[4];
    const azH = bytes[5];

    const ax = (axH * 256 + axL) / 16000.0;
    const ay = (ayH * 256 + ayL) / 16000.0;
    const az = (azH * 256 + azL) / 16000.0;

    const sumAcc = Math.abs(ax + ay + az);

    return sumAcc;
  };

  const computeTensometerValue = (data: { value: Iterable<number> }) => {
    const rawInput = uint8ArrayToString(new Uint8Array(data.value));

    const pattern = /(\d{4})(-?\d{1,3}\.\d{2})(-?\d{0,7})/;
    const pattern_force_only = /(\d{4})(-?\d{0,7})/;

    const matcher = rawInput.match(pattern);
    const matcher_force_only = rawInput.match(pattern_force_only);
    if (matcher || matcher_force_only) {
      let n,
        force,
        temp = 0;
      if (matcher) {
        n = parseInt(matcher[1]);
        temp = parseFloat(matcher[2]);
        force = parseInt(matcher[3]);
      } else {
        n = parseInt(matcher_force_only[1]);
        force = parseInt(matcher_force_only[2]);
      }
      return { n, temp, force };
    } else {
      console.warn("BLE", "Broken frame received: " + rawInput);
      return {};
    }
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    if (peripheral.name) {
      // console.debug(
      //   "[handleDiscoverPeripheral] new BLE peripheral=",
      //   peripheral
      // );
      addOrUpdatePeripheral(peripheral.id, peripheral);
    }
  };

  const togglePeripheralConnection = async (peripheral: Peripheral) => {
    if (peripheral && peripheral.connected) {
      try {
        await BleManager.disconnect(peripheral.id);
      } catch (error) {
        console.error(
          `[togglePeripheralConnection][${peripheral.id}] error when trying to disconnect device.`,
          error
        );
      }
    } else {
      await connectPeripheral(peripheral);
    }
  };

  const retrieveConnected = async () => {
    try {
      const connectedPeripherals = await BleManager.getConnectedPeripherals();
      if (connectedPeripherals.length === 0) {
        //console.warn("[retrieveConnected] No connected peripherals found.");
        return;
      }

      console.debug(
        "[retrieveConnected] connectedPeripherals",
        connectedPeripherals
      );

      for (var i = 0; i < connectedPeripherals.length; i++) {
        var peripheral = connectedPeripherals[i];
        addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connected: true,
        });
      }
    } catch (error) {
      console.error(
        "[retrieveConnected] unable to retrieve connected peripherals.",
        error
      );
    }
  };

  const connectPeripheral = async (peripheral: Peripheral) => {
    try {
      if (peripheral) {
        addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connecting: true,
        });

        await BleManager.connect(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

        addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connecting: false,
          connected: true,
        });

        // before retrieving services, it is often a good idea to let bonding & connection finish properly
        await sleep(900);

        /* Test read current RSSI value, retrieve services first */
        const peripheralData = await BleManager.retrieveServices(peripheral.id);
        // console.debug(
        //   `[connectPeripheral][${peripheral.id}] retrieved peripheral services`,
        //   peripheralData
        // );

        const services = peripheralData.characteristics?.map((c) => c.service);

        if (services?.includes(INODE_SERVICE_UUID)) {
          BleManager.write(
            peripheral.id,
            INODE_SERVICE_UUID,
            INODE_CHARACTERISTIC_UUID,
            INODE_WORK_MODE
          )
            .then(() => {
              console.debug(
                `[connectPeripheral][${peripheral.id}] set inode work mode`
              );
            })
            .catch((error) => {
              console.error(
                `[connectPeripheral][${peripheral.id}] write error`,
                error
              );
            });

          BleManager.read(
            peripheral.id,
            INODE_BATTERY_SERVICE_UUID,
            INODE_BATTERY_CHARACTERISTIC_UUID
          )
            .then((data) => {
              console.debug(
                `[connectPeripheral][${peripheral.id}] read battery level`,
                data
              );
              setBatteryLevels(
                (prev) => new Map(prev.set(peripheral.id, data))
              );
            })
            .catch((error) => {
              console.error(
                `[connectPeripheral][${peripheral.id}] read battery level error`,
                error
              );
            });

          await BleManager.startNotification(
            peripheral.id,
            INODE_SERVICE_UUID,
            INODE_CHARACTERISTIC_UUID
          );

          console.debug(
            `[connectPeripheral][${peripheral.id}] started notification for inode service.`
          );
        }

        if (services?.includes(ACC_SERVICE_UUID)) {
          await BleManager.startNotification(
            peripheral.id,
            ACC_SERVICE_UUID,
            ACC_CHARACTERISTIC_UUID
          );
          console.debug(
            `[connectPeripheral][${peripheral.id}] started notification for accelerometer service.`
          );
        }

        if (services?.includes(TENS_SERVICE_UUID)) {
          await BleManager.startNotification(
            peripheral.id,
            TENS_SERVICE_UUID,
            TENS_CHARACTERISTIC_UUID
          );
          console.debug(
            `[connectPeripheral][${peripheral.id}] started notification for tensometer service.`
          );
        }
      }
    } catch (error) {
      console.error(
        `[connectPeripheral][${peripheral.id}] connectPeripheral error`,
        error
      );
    }
  };

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  useEffect(() => {
    try {
      BleManager.start({ showAlert: false, forceLegacy: true })
        .then(() => console.debug("BleManager started."))
        .catch((error) =>
          console.error("BeManager could not be started.", error)
        );
    } catch (error) {
      console.error("unexpected error starting BleManager.", error);
      return;
    }

    const listeners = [
      bleManagerEmitter.addListener(
        "BleManagerDiscoverPeripheral",
        handleDiscoverPeripheral
      ),
      bleManagerEmitter.addListener("BleManagerStopScan", handleStopScan),
      bleManagerEmitter.addListener(
        "BleManagerDisconnectPeripheral",
        handleDisconnectedPeripheral
      ),
      bleManagerEmitter.addListener(
        "BleManagerDidUpdateValueForCharacteristic",
        handleUpdateValueForCharacteristic
      ),
    ];

    handleAndroidPermissions();

    return () => {
      console.debug("[app] main component unmounting. Removing listeners...");
      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, []);

  const handleAndroidPermissions = async () => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      let result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      if (result)
        console.debug(
          "[handleAndroidPermissions] User accepts runtime permission android >=12"
        );
      else
        console.error(
          "[handleAndroidPermissions] User refuses runtime permission android >=12"
        );
    } else if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((checkResult) => {
        if (checkResult) {
          console.debug(
            "[handleAndroidPermissions] runtime permission Android <12 already OK"
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((requestResult) => {
            if (requestResult) {
              console.debug(
                "[handleAndroidPermissions] User accepts runtime permission android <12"
              );
            } else {
              console.error(
                "[handleAndroidPermissions] User refuses runtime permission android <12"
              );
            }
          });
        }
      });
      promptForEnableLocationIfNeeded()
        .then((result) => {
          console.debug(
            "[handleAndroidPermissions] promptForEnableLocationIfNeeded result",
            result
          );
        })
        .catch((error) => {
          console.error(
            "[handleAndroidPermissions] promptForEnableLocationIfNeeded error",
            error
          );
        });
    }
    if (Platform.OS === "android") {
      BleManager.enableBluetooth()
        .then(() => {
          // Success code
          console.log("The bluetooth is already enabled or the user confirm");
        })
        .catch((error) => {
          // Failure code
          console.log("The user refuse to enable bluetooth");
        });
    }
  };

  const renderItem = ({ item }: { item: Peripheral }) => {
    const backgroundColor = item.connected ? "#069400" : Colors.white;
    return (
      <TouchableHighlight
        underlayColor="#0082FC"
        onPress={() => togglePeripheralConnection(item)}
      >
        <View style={[styles.row, { backgroundColor }]}>
          <Text style={styles.peripheralName}>
            {item.name}
            {item.connecting && " - Connecting..."}
            {batteryLevels.get(item.id) &&
              ` - Battery: ${batteryLevels.get(item.id)}%`}
          </Text>
          {/* <Text style={styles.rssi}>RSSI: {item.rssi}</Text> */}
          <Text style={styles.peripheralId}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <>
      <StatusBar />
      <SafeAreaView style={styles.body}>
        <Pressable style={styles.scanButton} onPress={startScan}>
          <Text style={styles.scanButtonText}>
            {isScanning ? "Scanning..." : "Scan Bluetooth"}
          </Text>
        </Pressable>

        {Array.from(peripherals.values()).length === 0 && (
          <View style={styles.row}>
            <Text style={styles.noPeripherals}>
              No Peripherals, press "Scan Bluetooth" above.
            </Text>
          </View>
        )}

        <FlatList
          data={Array.from(peripherals.values())}
          contentContainerStyle={{ rowGap: 12 }}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    </>
  );
};

const boxShadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const styles = StyleSheet.create({
  engine: {
    position: "absolute",
    right: 10,
    bottom: 0,
    color: Colors.black,
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#0a398a",
    margin: 10,
    borderRadius: 12,
    ...boxShadow,
  },
  scanButtonText: {
    fontSize: 20,
    letterSpacing: 0.25,
    color: Colors.white,
  },
  body: {
    backgroundColor: "#0082FC",
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark,
  },
  highlight: {
    fontWeight: "700",
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: "600",
    padding: 4,
    paddingRight: 12,
    textAlign: "right",
  },
  peripheralName: {
    fontSize: 16,
    textAlign: "center",
    padding: 10,
    color: Colors.black,
  },
  rssi: {
    fontSize: 12,
    textAlign: "center",
    padding: 2,
    color: Colors.black,
  },
  peripheralId: {
    fontSize: 12,
    textAlign: "center",
    padding: 2,
    paddingBottom: 20,
    color: Colors.black,
  },
  row: {
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 20,
    ...boxShadow,
  },
  noPeripherals: {
    margin: 10,
    textAlign: "center",
    color: Colors.white,
  },
});

export default ConnectScreen;
