import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  processColor,
  Platform,
} from 'react-native';
import {LineChart} from 'react-native-charts-wrapper';
import React, {useState, useEffect, useRef} from 'react';
import {useAccelerometerData} from '../hooks/useAccelerometerData';
import {useTensometerData} from '../hooks/useTensometerData';
import {useUserData} from '../hooks/useUserData';
import {usePrediction} from '../components/NeuralNetworkModel';

import RNFS from 'react-native-fs';

const RANGE = 300;
const CHART_WINDOW = 150;
const MOVING_AVERAGE_WINDOW = 5;
const TIME_INTERVAL = 25;
const PRED_MARGIN = 0.8;

function ChartsScreen() {
  const {accPoints, setAccPoints} = useAccelerometerData();
  const {seconds, setSeconds} = useUserData();
  const {breathAmount, setBreathAmount} = useUserData();
  const {tensPoints, setTensPoints} = useTensometerData();
  const [tensColors, setTensColors] = useState([
    processColor('red'),
    processColor('red'),
    processColor('red'),
    processColor('red'),
    processColor('red'),
  ]);

  const [normalizedAccPoints, setNormalizedAccPoints] = useState<any[]>([]);
  const [normalizedTensPoints, setNormalizedTensPoints] = useState<any[]>([]);
  const [tensPointToDisplay, setTensPointToDisplay] = useState<any[]>([]);
  const isRunning = useRef(false);
  const reset = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [wasBreathIn, setBreathInState] = useState(false);
  const [wasBreathOut, setBreathOutState] = useState(false);

  function startChart() {
    isRunning.current = !isRunning.current;
    setIsActive(isRunning.current);
  }

  function resetChart() {
    reset.current = true;
    isRunning.current = false;
    setIsActive(isRunning.current);
    setSeconds(0);
    setBreathAmount(0);
    setAccPoints([]);
    setTensPoints([]);
    setNormalizedAccPoints([]);
    setNormalizedTensPoints([]);
    setTensColors([
      processColor('red'),
      processColor('red'),
      processColor('red'),
      processColor('red'),
      processColor('red'),
    ]);
    setTensPointToDisplay([]);
  }

  const formatTime = timeInSeconds => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  async function readDemoData() {
    try {
      let content;
      setIsPlaying(true);
      if (Platform.OS === 'ios') {
        const filePath = `${RNFS.MainBundlePath}/debug3.txt`;
        content = await RNFS.readFile(filePath, 'utf8');
      } else if (Platform.OS === 'android') {
        const assetPath = 'debug3.txt';
        content = await RNFS.readFileAssets(assetPath, 'utf8');
      }
      isRunning.current = true;
      reset.current = false;
      setIsActive(isRunning.current);
      const lines = content.split('\n');
      for (let line of lines) {
        while (!isRunning.current) {
          await new Promise<void>(resolve => setTimeout(resolve, 500));
          console.log('waiting');
          if (reset.current) {
            console.log('reset while waiting');
            break;
          }
        }
        if (reset.current) {
          console.log('reset while reading');
          reset.current = false;
          break;
        }
        await new Promise<void>(resolve => setTimeout(resolve, TIME_INTERVAL));
        const match = line.match(/Punkt y:(\d+\.\d+)/);
        if (match && match[1]) {
          let yValue = parseFloat(match[1]);
          setTensPoints(tensPoints => [...tensPoints, {y: yValue}]);
        }
      }
      isRunning.current = false;
      setIsActive(isRunning.current);
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to read from file', error);
    }
  }

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
    if (isRunning.current) {
      if (tensPoints.length >= RANGE) {
        tensPoints.shift();
      }

      if (accPoints.length >= RANGE) {
        accPoints.shift();
      }

      const smoothedAccPoints = movingAverage(accPoints.slice(-CHART_WINDOW));
      setNormalizedAccPoints(handleNaN(normalize(smoothedAccPoints)));

      const smoothedTensPoints = movingAverage(tensPoints.slice(-CHART_WINDOW));
      setNormalizedTensPoints(handleNaN(normalize(smoothedTensPoints)));

      if (normalizedTensPoints.length > MOVING_AVERAGE_WINDOW) {
        predictData();
      }
    }
  }, [accPoints, tensPoints]);

  async function predictData() {
    const lastFivePoints = normalizedTensPoints.slice(-5);
    const prediction = await usePrediction(lastFivePoints);
    let newColor = processColor('green');
    if (prediction && prediction[0]) {
      if (prediction[0] > PRED_MARGIN) {
        newColor = processColor('red');
        setBreathInState(true);
      } else if (prediction[0] < -PRED_MARGIN) {
        newColor = processColor('blue');
        if (wasBreathIn) {
          setBreathOutState(true);
        }
      }
    }

    if (tensColors.length >= RANGE) {
      tensColors.shift();
    }

    setTensPointToDisplay(normalizedTensPoints);
    tensColors.push(newColor);

    if (wasBreathIn && wasBreathOut) {
      setBreathAmount(prevBreathsAmount => prevBreathsAmount + 1);
      setBreathInState(false);
      setBreathOutState(false);
    }
  }

  function movingAverage(data: string | any[], n = MOVING_AVERAGE_WINDOW) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < n - 1) {
        // not enough data to compute average, so just push the current point
        result.push(data[i]);
      } else {
        // compute average of last n points
        let sum = 0;
        for (let j = 0; j < n; j++) {
          sum += data[i - j].y;
        }
        result.push({y: sum / n});
      }
    }
    return result;
  }

  function normalize(data: any[]): any {
    let maxY = Math.max(...data.map((p: {y: any}) => p.y));
    let minY = Math.min(...data.map((p: {y: any}) => p.y));
    return data.map(point => ({
      y: (2 * (point.y - minY)) / (maxY - minY) - 1,
    }));
  }

  function handleNaN(data, defaultValue = 0) {
    return data.map(point => ({
      y: isNaN(point.y) ? defaultValue : point.y,
    }));
  }

  return (
    <View style={styles.container}>
      <View style={styles.informationBox}>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={() => readDemoData()}
            style={styles.demoChartStyle}
            disabled={isPlaying}>
            <Text style={styles.startChartButtonText}>
              {isPlaying ? 'PLAYING...' : 'DEMO'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => resetChart()}
            style={styles.resetChartStyle}>
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
                label: 'Acc',
                config: {
                  color: processColor('red'),
                  drawCircles: false,
                  lineWidth: 3,
                  drawValues: false,
                },
              },
              {
                values: tensPointToDisplay,
                label: 'Tens',
                config: {
                  colors: tensColors.slice(-CHART_WINDOW + 1),
                  drawCircles: false,
                  lineWidth: 3,
                  drawValues: false,
                },
              },
            ],
          }}
        />
      </View>
      <View style={styles.startStopBox}>
        <TouchableOpacity
          onPress={() => startChart()}
          style={
            isRunning.current ? styles.stopChartStyle : styles.startChartStyle
          }>
          <Text style={styles.startChartButtonText}>
            {isRunning.current ? 'STOP' : 'START'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  chart: {
    height: '85%',
    backgroundColor: '#FFF',
    width: '95%',
    alignSelf: 'center',
  },
  informationBox: {
    marginTop: 5,
    flexDirection: 'row',
    height: '7.5%',
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
    height: '7.5%',
    width: '90%',
    alignSelf: 'center',
    paddingBottom: 10,
  },
  resetChartStyle: {
    flex: 2,
    height: '100%',
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
    height: '100%',
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startChartStyle: {
    height: '100%',
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
    height: '100%',
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
