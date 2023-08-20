import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { bytesToString } from "convert-string";


const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const ConnectScreen = () => {
  const [notifyValueFromBLE, setNotifyValue] = useState(0);
  const [devices, setDevices] = useState<Array<{ label: string, value: string }>>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const SERVICE_UUID = "0000FFE5-0000-1000-8000-00805F9A34FB";
  const CHARACTERISTIC_UUID = "0000ffe4-0000-1000-8000-00805f9a34fb";


  useEffect(() => {
    /**Initialize the BLE */
    BleManager.start({ showAlert: false, forceLegacy: true });

    /**
     *//* Listener to handle the opeation when device is connected , disconnected Handle stop scan
, when any value will update from BLE device
*/
    const ble1 = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    const ble4 = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);


    //*Checking the Bluetooth Permission
    checkForBluetoothPermission()

    return (() => {
        ble1.remove()
        ble4.remove()
    })
}, []);


  const handleDiscoverPeripheral = (peripheral) => {
    setDevices(prevDevices => {
      if (!prevDevices.find(device => device.value === peripheral.id)) {
        return [...prevDevices, { label: peripheral.name, value: peripheral.id }];
      } else {
        return prevDevices;
      }
    }
    );
  }

  const setCharacteristicNotification = (deviceID) => {
    BleManager.retrieveServices(deviceID)
    .then((peripheralInfo) => {
        console.log('Available services:');
        peripheralInfo.characteristics?.forEach(char => {
          console.log("Chars:", char);
        })
        const characteristic = peripheralInfo.characteristics.find((char) => char.characteristic === CHARACTERISTIC_UUID && char.service === SERVICE_UUID);
        //if (characteristic) {
        BleManager.startNotification(deviceID, SERVICE_UUID, CHARACTERISTIC_UUID)
        .then(() => {
            console.log('Started notification for accelerometer characteristic');
        })
        .catch((error) => {
            console.log('Notification start failed:', error);
        });
    })
    .catch((error) => {
        console.log('retrieveServices failed:', error);
    });
};


  const enableBluetoothInDevice = () => {
    BleManager.enableBluetooth()
        .then(() => {
            // Success code
            //** Start the scanning */
            scanAndDiscoverDevices()
        })
        .catch((error) => {
            console.log("rror-r---->", error);
        });
    }

  const checkForBluetoothPermission = () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
        let finalPermission = Platform.Version >= 29
            ? PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            : PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
        PermissionsAndroid.check(finalPermission).then((result) => {
            if (result) {
                //* Enable the Bluetooth capability
                enableBluetoothInDevice()
            } else {
                PermissionsAndroid.request(finalPermission).then((result) => {
                    if (result) {
                        //* Enable the Bluetooth capability
                        enableBluetoothInDevice()
                    } else {
                        console.log("User refuse");
                    }
                });
            }
        });
    }
    else {
        console.log("IOS");
        enableBluetoothInDevice()
    }
}

  const scanAndDiscoverDevices = () => {
    setDevices([]);  // clear previous devices
    BleManager.scan([], 5, false).then(() => {
      console.log('Scanning...');
    });
  };

  const connectToDevice = (deviceID) => {
    BleManager.connect(deviceID).then(() => {
      console.log('Connected to ' + deviceID);

      setCharacteristicNotification(deviceID);
    }).catch((error) => {
      console.log('Connection error', error);
    });
  };

  const handleConnectPress = () => {
    // Connect to all selected devices
    selectedDevices.forEach(deviceID => {
      connectToDevice(deviceID);
    });
  };

  const handleUpdateValueForCharacteristic = (data) => {
    setNotifyValue(0)
    const bytes = new Uint8Array(data.value);

    // Extract high and low bytes for each axis
    const axH = bytes[3];
    const axL = bytes[2];
    const ayH = bytes[5];
    const ayL = bytes[4];
    const azH = bytes[7];
    const azL = bytes[6];

    // Convert bytes to float values for each axis
    const ax = (((axH * 256) + axL) / 32768.0) * 16;
    const ay = (((ayH * 256) + ayL) / 32768.0) * 16;
    const az = (((azH * 256) + azL) / 32768.0) * 16;

    const sumAcc = Math.abs(ax + ay + az);
    console.log(`Acc Values - ax: ${ax}, ay: ${ay}, az: ${az}, sumAcc: ${sumAcc}`);
    setNotifyValue(sumAcc);
  };

  const toggleItem = (value: string) => {
    setSelectedDevices(prevSelected => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter(device => device !== value);
      } else {
        return [...prevSelected, value];
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={scanAndDiscoverDevices}
        style={styles.scanButton}>
        <Text>Scan for Devices</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Select Bluetooth Devices</Text>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.dropdown}>
        <Text>{selectedDevices.length} devices selected</Text>
      </TouchableOpacity>
      {open && (
        <ScrollView style={styles.list}>
          {devices.map(device => (
            <TouchableOpacity
              key={device.value}
              onPress={() => toggleItem(device.value)}
              style={styles.listItem}>
              <Text
                style={{
                  color: selectedDevices.includes(device.value)
                    ? 'green'
                    : 'black',
                }}>
                {device.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <TouchableOpacity onPress={handleConnectPress} style={styles.connectButton}>
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#64A6BD',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: 'white',
    padding: 10,
    width: 200,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  list: {
    maxHeight: 120, // Adjust as needed
    width: 200,
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
  },
  listItem: {
    padding: 10,
  },
  connectButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 4,
    color: 'white',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'white',
    borderRadius: 8,
    color: 'white',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default ConnectScreen;
