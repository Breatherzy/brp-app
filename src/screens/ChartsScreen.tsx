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
import {usePrediction} from '../components/NeuralNetworkModel';
import RNFS from 'react-native-fs';

const RANGE = 300;
const CHART_WINDOW = 150;
const MOVING_AVERAGE_WINDOW = 5;
const TIME_INTERVAL = 50;
const PRED_MARGIN = 0.8;

function ChartsScreen() {
  const {accPoints, setAccPoints} = useAccelerometerData();
  const {tensPoints, setTensPoints} = useTensometerData();
  const [colors, setColors] = useState([
    processColor('red'),
    processColor('red'),
    processColor('red'),
    processColor('red'),
    processColor('red'),
  ]);
  const [normalizedAccPoints, setNormalizedAccPoints] = useState<any[]>([]);
  const [normalizedTensPoints, setNormalizedTensPoints] = useState<any[]>([]);
  const isRunning = useRef(false);
  const reset = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  function startChart() {
    isRunning.current = !isRunning.current;
  }

  function resetChart() {
    reset.current = true;
    isRunning.current = false;
    setAccPoints([]);
    setTensPoints([]);
    setNormalizedAccPoints([]);
    setNormalizedTensPoints([]);
    setColors([
      processColor('red'),
      processColor('red'),
      processColor('red'),
      processColor('red'),
      processColor('red'),
    ]);
  }

  async function readDemoData() {
    try {
      let content;
      setIsLoading(true);
      if (Platform.OS === 'ios') {
        const filePath = `${RNFS.MainBundlePath}/debug3.txt`;
        content = await RNFS.readFile(filePath, 'utf8');
      } else if (Platform.OS === 'android') {
        const assetPath = 'debug3.txt';
        content = await RNFS.readFileAssets(assetPath, 'utf8');
      }
      isRunning.current = true;
      const lines = content.split('\n');
      for (let line of lines) {
        while (!isRunning.current) {
          await new Promise<void>(resolve => setTimeout(resolve, 100));
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
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to read from file', error);
    }
  }

  useEffect(() => {
    if (tensPoints.length >= RANGE) {
      setTensPoints(prev => prev.slice(-RANGE + 1));
    }

    if (accPoints.length >= RANGE) {
      setAccPoints(prev => prev.slice(-RANGE + 1));
    }

    const smoothedTensPoints = movingAverage(tensPoints.slice(-CHART_WINDOW));
    setNormalizedTensPoints(handleNaN(normalize(smoothedTensPoints)));

    if (normalizedTensPoints.length > MOVING_AVERAGE_WINDOW) {
      predictData();
    }

    const smoothedAccPoints = movingAverage(accPoints.slice(-CHART_WINDOW));
    setNormalizedAccPoints(handleNaN(normalize(smoothedAccPoints)));

    if (colors.length >= RANGE) {
      setColors(colors.slice(-RANGE + 1));
    }
  }, [accPoints, tensPoints]);

  async function predictData() {
    const lastFivePoints = normalizedTensPoints.slice(-5);
    const prediction = await usePrediction(lastFivePoints);
    const amplitude =
      Math.max(...lastFivePoints.map((p: {y: any}) => p.y)) -
      Math.min(...lastFivePoints.map((p: {y: any}) => p.y));
    let newColor = processColor('green');
    if (prediction && prediction[0] && amplitude > 0.03) {
      if (prediction[0] > PRED_MARGIN) {
        newColor = processColor('red');
      } else if (prediction[0] < -PRED_MARGIN) {
        newColor = processColor('blue');
      }
    }
    setColors(prevColors => [...prevColors, newColor]);
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
      <View style={styles.header}>
        <Text style={styles.headerText}>Analizator Oddechu</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => startChart()}
          style={styles.startChartStyle}>
          <Text style={styles.startChartButtonText}>
            {isRunning.current ? 'STOP' : 'START'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => readDemoData()}
          style={styles.startChartStyle}
          disabled={isLoading}>
          <Text style={styles.startChartButtonText}>
            {isLoading ? 'PLAYING...' : 'DEMO'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => resetChart()}
          style={styles.resetChartStyle}>
          <Text style={styles.resetChartButtonText}>RESET</Text>
        </TouchableOpacity>
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
                },
              },
              {
                values: normalizedTensPoints,
                label: 'Tens',
                config: {
                  colors: colors.slice(-CHART_WINDOW + 1),
                  drawCircles: false,
                  lineWidth: 3,
                  drawValues: false,
                },
              },
            ],
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  header: {
    height: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  headerText: {
    fontSize: 20,
    color: '#000',
  },
  chart: {
    height: '85%',
    backgroundColor: '#FFF',
    width: '95%',
    alignSelf: 'center',
  },
  buttons: {
    flexDirection: 'row',
    height: '10%',
    backgroundColor: '#FFF',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  resetChartStyle: {
    height: '75%',
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
    height: '75%',
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
