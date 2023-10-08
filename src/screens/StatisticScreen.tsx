import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {useUserData} from '../hooks/useUserData';

function StatisticScreen() {
  const {seconds, setSeconds} = useUserData();
  const {breathAmount, setBreathAmount} = useUserData();

  const averageBreathAmount = (breathAmount * 60) / seconds;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Statistic Screen</Text>
      </View>
      <View style={styles.informations}>
        <View style={styles.textsBox}>
          <Text style={styles.breathCounterText}>Ilość oddechów:</Text>
          <Text style={styles.averageBreaths}>Średnia ilość oddechów:</Text>
        </View>
        <View style={styles.numbersBox}>
          <Text style={styles.breathCounter}>{breathAmount}</Text>
          <Text style={styles.averageBreathAmount}>
            {parseFloat(averageBreathAmount.toFixed(2))}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#64A6BD',
    padding: 6,
  },
  header: {
    justifyContent: 'center',
    width: '100%',
    height: '10%',
  },
  headerText: {
    fontSize: 36,
    color: 'white',
    alignSelf: 'center',
  },
  informations: {
    height: '90%',
    flexDirection: 'row',
  },
  textsBox: {
    width: '50%',
    height: 200,
  },
  breathCounterText: {
    fontSize: 30,
    marginLeft: 30,
    textAlign: 'left',
    color: 'black',
    justifyContent: 'center',
  },
  averageBreaths: {
    marginTop: 20,
    marginLeft: 30,
    textAlign: 'left',
    fontSize: 30,
    color: 'black',
    justifyContent: 'center',
  },
  numbersBox: {
    width: '50%',
    height: 200,
  },
  breathCounter: {
    marginTop: 15,
    fontSize: 40,
    color: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  averageBreathAmount: {
    marginTop: 55,
    fontSize: 40,
    color: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
export default StatisticScreen;
