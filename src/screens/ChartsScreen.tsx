import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {LineChart} from 'react-native-charts-wrapper';

function resetChart() {
  
}

function startChart() {
  
}


function ChartsScreen() {
  

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
          <Text style={styles.resetChartButtonText}>RESET CHART</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.chart}>
        <LineChart
          style={{flex: 1}} 
          data={{dataSets:[{label: "Tensometr", values: [{y: 1}, {y: 2}, {y: 1}]}]}}
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
  },
  buttons: {
    flexDirection: 'row',
    height: "10%",
    backgroundColor: '#FFF',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  resetChartStyle: {
    width: "25%",
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
    width: "25%",
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
