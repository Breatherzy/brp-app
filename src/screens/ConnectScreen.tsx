import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const ConnectScreen = () => {
  const devices = [
    {label: 'Device 1', value: 'device1'},
    {label: 'Device 2', value: 'device2'},
    {label: 'Device 3', value: 'device3'},
    {label: 'Device 4', value: 'device4'},
    {label: 'Device 5', value: 'device5'},
  ];

  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

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
                    ? 'blue'
                    : 'black',
                }}>
                {device.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <TouchableOpacity style={styles.connectButton}>
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
