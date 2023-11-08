import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import { useState } from 'react';
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
        <View style={styles.boxCounter}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.breathCounterText}>Ilość oddechów:</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.breathCounter}>{breathAmount}</Text>
        </View>
        <View style={styles.numbersBox}>
          <Text numberOfLines={2} adjustsFontSizeToFit style={styles.averageBreaths}>Średnia ilość oddechów:</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.averageBreathAmount}>
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
    flexDirection: 'column',
  },
  boxCounter: {
    width:'80%',
    flexDirection:'row',
    justifyContent: 'center',
    height: '20%',
  },
  breathCounterText: {
    fontSize: 30,
    width:'75%',
    alignSelf: 'center',
    color: 'black',
    justifyContent: 'center',
  },
  averageBreaths: {
    width: '75%',
    alignSelf: 'center',
    fontSize: 30,
    color: 'black',
    justifyContent: 'center',
  },
  numbersBox: {
    width: '80%',
    height: '20%',
    flexDirection:'row',
    justifyContent: 'center',
  },
  breathCounter: {
    width: '25%',
    justifyContent: 'center',
    fontSize: 40,
    color: 'black',
    alignSelf: 'center',
  },
  averageBreathAmount: {
    width: '25%',
    fontSize: 40,
    color: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
export default StatisticScreen;
