import {Text, View, StyleSheet, TouchableOpacity, processColor, Platform} from 'react-native';
import {LineChart} from 'react-native-charts-wrapper';
import React, { useState, useEffect } from 'react';
import { useAccelerometerData} from '../hooks/useAccelerometerData'; 
import { useTensometerData } from '../hooks/useTensometerData'; 
import { useUserData } from '../hooks/useUserData';
import { usePrediction } from '../components/NeuralNetworkModel';

import RNFS from 'react-native-fs';


const RANGE = 300;
const CHART_WINDOW = 150;
const MOVING_AVERAGE_WINDOW = 5;
const TIME_INTERVAL = 50;
const PRED_MARGIN = 0.8;



function ChartsScreen() {
  const { dataPointsTens, setTensometerData } = useTensometerData();
  const { dataPointsAcc,  setAccelerometerData} = useAccelerometerData();
  const { seconds, setSeconds } = useUserData();
  const { breathAmount, setBreathAmount } = useUserData();
  const [tensColors, setTensColors] = useState([
                                              processColor('red'), 
                                              processColor('red'), 
                                              processColor('red'), 
                                              processColor('red'), 
                                              processColor('red')
                                              ]);
  const [normalizedTensPoints, setNormalizedTensPoints] = useState([]);
  const [normalizedAccPoints, setNormalizedAccPoints] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const [isActive, setIsActive] = useState(false);


  const [wasBreathIn, setBreathInState] = useState(false);
  const [wasBreathOut, setBreathOutState] = useState(false);

  function startChart() {
    setIsRunning(!isRunning);
    setIsActive(!isActive);
  }

  function resetChart() {
    resetTimer();
    setIsRunning(false);
    setTensometerData([]);
    setAccelerometerData([]);
    setNormalizedAccPoints([]);
    setNormalizedTensPoints([]);
  }

  const resetTimer = () => {
    setSeconds(0);
    setIsActive(false);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isActive]);
  

  useEffect(() => {
    if (isRunning) {
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
      if (prediction[0] > PRED_MARGIN) {
        newColor = processColor('red');
        setBreathInState(true);
      } else if (prediction[0] < -PRED_MARGIN) {
        newColor = processColor('blue');
        if(wasBreathIn){
          setBreathOutState(true);
        }
      }
    }
    setTensColors(prevColors => [...prevColors, newColor]);

    if(wasBreathIn && wasBreathOut){
      setBreathAmount(prevBreathsAmount => prevBreathsAmount + 1);
      setBreathInState(false);
      setBreathOutState(false);
    }
  }

  async function startDemoVersion() {
    readFileAndUpdate();
    setIsRunning(true);
    setIsActive(true);
  }

  async function readFileAndUpdate() {
    try {
      let content;
      
      if (Platform.OS === 'ios') {
          const filePath = `${RNFS.MainBundlePath}/debug3.txt`;
          content = await RNFS.readFile(filePath, 'utf8');
      } else if (Platform.OS === 'android') {
          const assetPath = 'debug3.txt';
          content = await RNFS.readFileAssets(assetPath, 'utf8');
      }
      
      const lines = content.split('\n');
      for (let line of lines) {
        const match = line.match(/Punkt y:(\d+\.\d+)/);
        if (match && match[1]) {
          let yValue = parseFloat(match[1]);
          setTensometerData(prevData => [...prevData, { y: yValue }]);
          await new Promise<void>(resolve => setTimeout(resolve, TIME_INTERVAL));
        }
      }
    } catch (error) {
      console.error('Failed to read from file', error);
    }
  }
  

  return (
    <View style={styles.container}>
      <View style={styles.informationBox}>
        <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => startDemoVersion()} style={styles.demoChartStyle}>
            <Text style={styles.startChartButtonText}>TEST</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => resetChart()} style={styles.resetChartStyle}>
            <Text style={styles.resetChartButtonText}>RESET</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.breathsBox}>
            <Text style={styles.breathsText}>{breathAmount}</Text>
          </View>
      </View>

      <View style={styles.chart}>
      <LineChart
        legend={{enabled: false}}
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
                drawValues: false,
              }
            }
          ]
        }}
      />
      </View>
      <View style={styles.startStopBox}>
        <TouchableOpacity onPress={() => startChart()} style={isRunning ? styles.stopChartStyle :styles.startChartStyle}>
          <Text style={styles.startChartButtonText}>{isRunning ? 'STOP' : 'START'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: '#FFF',
  },
  chart: {
    height: "85%",
    backgroundColor: '#FFF',
    width: "95%",
    alignSelf: 'center',
  },
  informationBox: {
    marginTop: 5,
    flexDirection: 'row',
    height: "7.5%",
    backgroundColor: '#FFF',
    justifyContent: 'space-evenly',
  },
  breathsBox: {
    flex: 2,
  },
  breathsText: {
    fontSize: 40,
    color: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  timerBox: {
    flex: 2,
  },
  timerText: {
    fontSize: 40,
    color: 'black',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  buttons: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startStopBox: {
    height: "7.5%",
    width: "90%",
    alignSelf: 'center',
    paddingBottom: 10,
  },
  resetChartStyle: {
    flex: 2,
    height: "100%",
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  demoChartStyle: {
    flex: 2,
    height: "100%",
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startChartStyle: {
    height: "100%",
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#1fd655',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stopChartStyle: {
    height: "100%",
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#FF474C',
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
