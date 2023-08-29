import {Text, View, StyleSheet, TouchableOpacity, processColor} from 'react-native';
import {LineChart} from 'react-native-charts-wrapper';
import React, { useState, useEffect } from 'react';
import { useAccelerometerData} from '../hooks/useAccelerometerData'; 
import { useTensometerData } from '../hooks/useTensometerData'; 
import { usePrediction } from '../components/CoreMLModule';

const RANGE = 300;
const CHART_WINDOW = 150;
const MOVING_AVERAGE_WINDOW = 5;

function resetChart() {
  
}

function startChart() {
  
}


function ChartsScreen() {
  const { dataPointsTens, setTensometerData } = useTensometerData();
  const { dataPointsAcc,  setAccelerometerData} = useAccelerometerData();
  const [tensColors, setTensColors] = useState([
                                              processColor('red'), 
                                              processColor('red'), 
                                              processColor('red'), 
                                              processColor('red'), 
                                              processColor('red')
                                              ]);
  const [normalizedTensPoints, setNormalizedTensPoints] = useState([]);
  const [normalizedAccPoints, setNormalizedAccPoints] = useState([]);
  

  useEffect(() => {

    if (dataPointsTens.length > RANGE) {
      dataPointsTens.shift();
      setTensometerData(dataPointsTens);
    }
    if (dataPointsAcc.length > RANGE) {
      dataPointsAcc.shift();
      setAccelerometerData(dataPointsAcc);
    }

    const smoothedTensPoints = movingAverage(dataPointsTens.slice(-CHART_WINDOW));
    setNormalizedTensPoints(handleNaN(normalize(smoothedTensPoints)));

    const smoothedAccPoints = movingAverage(dataPointsAcc.slice(-CHART_WINDOW));
    setNormalizedAccPoints(handleNaN(normalize(smoothedAccPoints)));

    if (normalizedTensPoints.length > MOVING_AVERAGE_WINDOW) {
      testPred();
    }

    if (tensColors.length >= RANGE) {
      setTensColors(tensColors.slice(-RANGE+1));
    }    

  }, [dataPointsTens]);

  function movingAverage(data: string | any[], n=MOVING_AVERAGE_WINDOW) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < n-1) {
        // not enough data to compute average, so just push the current point
        result.push(data[i]);
      } else {
        // compute average of last n points
        let sum = 0;
        for (let j = 0; j < n; j++) {
          sum += data[i-j].y;
        }
        result.push({ y: sum/n });
      }
    }
    return result;
  }
  
  function normalize(data: any[]): any {
    let maxY = Math.max(...data.map((p: { y: any; }) => p.y));
    let minY = Math.min(...data.map((p: { y: any; }) => p.y));
    return data.map(point => ({
      y: 2 * (point.y - minY) / (maxY - minY) - 1
    }));
  }

  function handleNaN(data, defaultValue = 0){
  
    return data.map(point => ({
        y: isNaN(point.y) ? defaultValue : point.y
    }));
  }

  async function testPred() {
    const lastFivePoints = normalizedTensPoints.slice(-5);
    const prediction = await usePrediction(lastFivePoints);
    let newColor = processColor('green');
    
    if (prediction && prediction[0]) {
      if (prediction[0] > 0.42) {
        newColor = processColor('red');
      } else if (prediction[0] < -0.42) {
        newColor = processColor('blue');
      }
    }
    setTensColors(prevColors => [...prevColors, newColor]);
  }

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
              values: normalizedAccPoints,
              label: "Acc",
              config: {
                color: processColor('red'), 
                drawCircles: false,
                lineWidth: 3,
              }
            }, 
            {
              values: normalizedTensPoints,
              label: "Tens",
              config: {
                colors: tensColors.slice(-CHART_WINDOW+1),
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
