import {Text, View, StyleSheet, TouchableOpacity, processColor} from 'react-native';
import {LineChart} from 'react-native-charts-wrapper';
import React, { useState, useEffect } from 'react';
import { useAccelerometerData} from '../hooks/useAccelerometerData'; 
import { useTensometerData } from '../hooks/useTensometerData'; 



function resetChart() {
  
}

function startChart() {
  
}


function ChartsScreen() {
  const { dataPointsTens, setTensometerData } = useTensometerData();
  const { dataPointsAcc,  setAccelerometerData} = useAccelerometerData();


  useEffect(() => {
    if (dataPointsTens.length > 300) {
      setTensometerData(dataPointsTens.slice(1));
    }
    if (dataPointsAcc.length > 300) {
      setAccelerometerData(dataPointsAcc.slice(1));
    }

  }, [dataPointsAcc, dataPointsTens]);

  const visibleTensPoints = dataPointsTens.slice(-150);
  const visibleAccPoints = dataPointsAcc.slice(-150);
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Analizator Oddechu</Text>
      </View>
      
      <View style={styles.buttons}>

        <TouchableOpacity onPress={() => startChart()} style={styles.startChartStyle}>
          <Text style={styles.startChartButtonText}>START</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => resetChart()} style={styles.resetChartStyle}>
          <Text style={styles.resetChartButtonText}>RESET</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.chart}>
      <LineChart
        style={{flex: 1}} 
        data={{
          dataSets: [
            {
              values: visibleAccPoints,
              label: "Acc",
              config: {
                color: processColor('red'), 
                drawCircles: false,
                lineWidth: 3,
              }
            }, 
            {
              values: visibleTensPoints,
              label: "Tens",
              config: {
                color: processColor('blue'),
                drawCircles: false,
                lineWidth: 3,
              }
            }
          ]
        }}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: '#FFF',
  },
  header: {
    height: "5%",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  headerText: {
    fontSize: 20,
    color: '#000',
  },
  chart: {
    height: "85%",
    backgroundColor: '#FFF',
    width: "95%",
    alignSelf: 'center',
  },
  buttons: {
    flexDirection: 'row',
    height: "10%",
    backgroundColor: '#FFF',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  resetChartStyle: {
    height: "75%",
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#9455FC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  startChartStyle: {
    height: "75%",
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetChartButtonText: {
    fontSize: 15,
    color: '#000',
  },
  startChartButtonText: {
    fontSize: 15,
    color: '#000',
  },
});

export default ChartsScreen;
