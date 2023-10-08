import React, {useState, useEffect, useRef} from 'react';
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
import {useAccelerometerData} from '../hooks/useAccelerometerData';
import {useTensometerData} from '../hooks/useTensometerData';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const ConnectScreen = () => {
  const {setAccPoints} = useAccelerometerData();
  const {setTensPoints} = useTensometerData();

  const [devices, setDevices] = useState<Array<{label: string; value: string}>>(
    [],
  );
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const ACC_SERVICE_UUID = '0000ffe5-0000-1000-8000-00805f9a34fb';
  const ACC_CHARACTERISTIC_UUID = '0000ffe4-0000-1000-8000-00805f9a34fb';
  const TENS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const TENS_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

  useEffect(() => {
    /**Initialize the BLE */
    BleManager.start({showAlert: false, forceLegacy: true});

    /**
     */ /* Listener to handle the operation when device is connected , disconnected Handle stop scan
, when any value will update from BLE device
*/
    const ble1 = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );
    const ble4 = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdateValueForCharacteristic,
    );

    //*Checking the Bluetooth Permission
    checkForBluetoothPermission();

    return () => {
      ble1.remove();
      ble4.remove();
    };
  }, []);

  const handleDiscoverPeripheral = (peripheral: {id: string; name: any}) => {
    setDevices(prevDevices => {
      if (!prevDevices.find(device => device.value === peripheral.id)) {
        return [...prevDevices, {label: peripheral.name, value: peripheral.id}];
      } else {
        return prevDevices;
      }
    });
  };

  const setCharacteristicNotification = (deviceID: string) => {
    BleManager.retrieveServices(deviceID)
      .then(peripheralInfo => {
        BleManager.startNotification(
          deviceID,
          ACC_SERVICE_UUID,
          ACC_CHARACTERISTIC_UUID,
        )
          .then(() => {
            console.log(
              'Started notification for accelerometer characteristic',
            );
          })
          .catch(error => {
            console.log('Notification start failed for accelerometer:', error);
          });

        BleManager.startNotification(
          deviceID,
          TENS_SERVICE_UUID,
          TENS_CHARACTERISTIC_UUID,
        )
          .then(() => {
            console.log('Started notification for tensometer characteristic');
          })
          .catch(error => {
            console.log('Notification start failed for tensometer:', error);
          });
      })
      .catch(error => {
        console.log('retrieveServices failed:', error);
      });
  };

  const enableBluetoothInDevice = () => {
    BleManager.enableBluetooth()
      .then(() => {
        //** Start the scanning */
        scanAndDiscoverDevices();
      })
      .catch(error => {
        console.log('rror-r---->', error);
      });
  };

  const checkForBluetoothPermission = () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      let finalPermission =
        Platform.Version >= 29
          ? PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          : PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
      PermissionsAndroid.check(finalPermission).then(result => {
        if (result) {
          //* Enable the Bluetooth capability
          enableBluetoothInDevice();
        } else {
          PermissionsAndroid.request(finalPermission).then(result => {
            if (result) {
              //* Enable the Bluetooth capability
              enableBluetoothInDevice();
            } else {
              console.log('User refuse');
            }
          });
        }
      });
    } else {
      console.log('IOS');
      enableBluetoothInDevice();
    }
  };

  const scanAndDiscoverDevices = () => {
    setDevices([]); // clear previous devices
    BleManager.scan([], 5, false).then(() => {
      console.log('Scanning...');
    });
  };

  const connectToDevice = (deviceID: string) => {
    BleManager.connect(deviceID)
      .then(() => {
        console.log('Connected to ' + deviceID);

        setCharacteristicNotification(deviceID);
      })
      .catch(error => {
        console.log('Connection error', error);
      });
  };

  const handleConnectPress = () => {
    // Connect to all selected devices
    selectedDevices.forEach(deviceID => {
      connectToDevice(deviceID);
    });
  };

  const computeAccelerometerValue = (data: {value: Iterable<number>}) => {
    const bytes = new Uint8Array(data.value);

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

  const computeTensometerValue = (data: {value: Iterable<number>}) => {
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

      return {n, temp, force};
    } else {
      console.warn('BLE', 'Broken frame received: ' + rawInput);
      return {};
    }
  };

  const handleUpdateValueForCharacteristic = data => {
    if (data.service == ACC_SERVICE_UUID) {
      const accelerometerValue = computeAccelerometerValue(data);
      setAccPoints(prevData => [...prevData, {y: accelerometerValue}]);
    } else if (data.service == TENS_SERVICE_UUID) {
      const tensometerData = computeTensometerValue(data);
      if (tensometerData && typeof tensometerData.force === 'number') {
        setTensPoints(prevData => [...prevData, {y: tensometerData.force}]);
      } else {
        console.error('Failed to compute tensometer value.');
      }
    }
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
          {devices
            .filter(device => device.label)
            .map(device => (
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
      <TouchableOpacity
        onPress={handleConnectPress}
        style={styles.connectButton}>
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
    maxHeight: 240,
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
