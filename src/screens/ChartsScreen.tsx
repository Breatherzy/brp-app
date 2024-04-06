import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  processColor,
  Platform,
} from "react-native";
import { LineChart } from "react-native-charts-wrapper";
import React, { useState, useEffect, useRef } from "react";
import { useAccelerometerData } from "../hooks/useAccelerometerData";
import { useTensometerData } from "../hooks/useTensometerData";
import { useUserData } from "../hooks/useUserData";
import {
  useTensPrediction,
  useAccPrediction,
} from "../components/NeuralNetworkModel";

import RNFS from "react-native-fs";

const RANGE = 300;
const CHART_WINDOW_TENS = 150;
const CHART_WINDOW_ACC = 375;
const TIME_INTERVAL_TENS = 175;
const TIME_INTERVAL_ACC = 40;
const MOVING_TENS_WINDOW = 5;
const MOVING_ACC_WINDOW = 11;

function ChartsScreen({ modelName }) {
  const { accPoints, setAccPoints } = useAccelerometerData();
  const { tensPoints, setTensPoints } = useTensometerData();
  const { seconds, setSeconds } = useUserData();
  const { breathAmount, setBreathAmount } = useUserData();

  var normalizedAccPoints = [];
  var normalizedTensPoints = [];
  const [accPointsToDisplay, setAccPointsToDisplay] = useState<any>({
    values: [],
    colors: [],
  });
  const [tensPointsToDisplay, setTensPointsToDisplay] = useState<any>({
    values: [],
    colors: [],
  });

  const isRunning = useRef(false);
  const reset = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [wasBreathIn, setBreathInState] = useState(false);
  const [wasBreathOut, setBreathOutState] = useState(false);
  const [start_time, setStartTime] = useState(new Date().getTime());

  function startChart() {
    isRunning.current = !isRunning.current;
    setIsActive(isRunning.current);
    setStartTime(new Date().getTime());
  }

  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function resetChart() {
    reset.current = true;
    isRunning.current = false;
    setIsActive(isRunning.current);
    await sleep(50);
    setSeconds(0);
    setBreathAmount(0);
    setAccPoints([]);
    setTensPoints([]);
    normalizedAccPoints = [];
    normalizedTensPoints = [];
    setTensPointsToDisplay({ values: [], colors: [] });
    setAccPointsToDisplay({ values: [], colors: [] });
    clearLogs();
    setStartTime(new Date().getTime());
  }

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  async function readDemoData(filename, interval) {
    try {
      let content;
      setIsPlaying(true);
      if (Platform.OS === "ios") {
        const filePath = `${RNFS.MainBundlePath}/${filename}.txt`;
        content = await RNFS.readFile(filePath, "utf8");
      } else if (Platform.OS === "android") {
        const assetPath = `${filename}.txt`;
        content = await RNFS.readFileAssets(assetPath, "utf8");
      }
      isRunning.current = true;
      reset.current = false;
      setIsActive(isRunning.current);
      const lines = content.split("\n");
      for (let line of lines) {
        while (!isRunning.current) {
          await new Promise<void>((resolve) => setTimeout(resolve, 500));
          console.log(`[readDemoData ${filename}] waiting`);
          if (reset.current) {
            console.log(`[readDemoData ${filename}] reset while waiting`);
            break;
          }
        }
        if (reset.current) {
          console.log(`[readDemoData ${filename}] reset while reading`);
          await new Promise<void>((resolve) => setTimeout(resolve, 200));
          reset.current = false;
          break;
        }
        await new Promise<void>((resolve) => setTimeout(resolve, interval));
        const line_list = line.split(",");
        let yValue = parseFloat(line_list[1]);
        let time = parseFloat(line_list[0]);
        if (filename.includes("tens")) {
          setTensPoints((tensPoints) => [...tensPoints, { y: yValue, x: time}]);
        } else if (filename.includes("acc")) {
          setAccPoints((accPoints) => [...accPoints, { y: yValue, x: time}]);
        }
      }
      isRunning.current = false;
      setIsActive(isRunning.current);
      setIsPlaying(false);
    } catch (error) {
      console.error(
        `[readDemoData ${filename}] Failed to read from file`,
        error
      );
    }
  }

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isActive]);

  const logData = async (name) => {
    try {
      let logEntry;
      let currentTimestamp = new Date().toISOString();
      if (name === "tens" && tensPoints.length > 0) {
        logEntry = `${currentTimestamp},${
          tensPoints[tensPoints.length - 1].y
        }\n`;
      } else if (name === "acc" && accPoints.length > 0) {
        logEntry = `${currentTimestamp},${accPoints[accPoints.length - 1].y}\n`;
      }
      const logFilePath = `${RNFS.DownloadDirectoryPath}/BrpApp`;
      const logFile = logFilePath + `/${name}.txt`;

      const directoryExists = await RNFS.exists(logFilePath);

      if (!directoryExists) {
        try {
          await RNFS.mkdir(logFilePath);
        } catch (mkdirError) {
          console.error("Failed to create directory:", mkdirError);
        }
      }

      const fileExists = await RNFS.exists(logFile);

      if (!fileExists) {
        await RNFS.writeFile(logFile, "", "utf8");
      }

      await RNFS.appendFile(logFile, logEntry, "utf8");
    } catch (error) {
      console.error(`Failed to log ${name} data`, error);
    }
  };

  const clearLogs = async () => {
    try {
      const logFilePath = `${RNFS.DownloadDirectoryPath}/BrpApp`;
      const directoryExists = await RNFS.exists(logFilePath);

      if (directoryExists) {
        await RNFS.unlink(logFilePath);
      }
    } catch (error) {
      console.error("Failed to clear logs", error);
    }
  };

  useEffect(() => {
    try {
      if (isRunning.current) {
        logData("tens");
        if (tensPoints.length >= RANGE) {
          tensPoints.shift();
        }

        const smoothedTensPoints = movingAverage(
          tensPoints.slice(-CHART_WINDOW_TENS),
          MOVING_TENS_WINDOW
        );

        normalizedTensPoints = handleNaN(normalize(smoothedTensPoints));
        normalizedTensPoints[normalizedTensPoints.length - 1].x = new Date().getTime() - start_time;
        if (normalizedTensPoints.length > MOVING_TENS_WINDOW) {
          predictData(
            normalizedTensPoints,
            useTensPrediction,
            MOVING_TENS_WINDOW,
            setTensPointsToDisplay,
            CHART_WINDOW_TENS
          );
        }
      }
    } catch (error) {
      console.error("Failed to update chart", error);
    }
  }, [tensPoints]);

  useEffect(() => {
    try {
      if (isRunning.current) {
        logData("acc");
        if (accPoints.length >= RANGE) {
          accPoints.shift();
        }

        const smoothedAccPoints = movingAverage(
          accPoints.slice(-CHART_WINDOW_ACC),
          MOVING_ACC_WINDOW
        );

        normalizedAccPoints = handleNaN(normalize(smoothedAccPoints));
        normalizedAccPoints[normalizedAccPoints.length - 1].x = new Date().getTime() - start_time;
        if (normalizedAccPoints.length > MOVING_ACC_WINDOW) {
          predictData(
            normalizedAccPoints,
            useAccPrediction,
            MOVING_ACC_WINDOW,
            setAccPointsToDisplay,
            CHART_WINDOW_ACC
          );
        }
      }
    } catch (error) {
      console.error("Failed to update chart", error);
    }
  }, [accPoints]);

  async function predictData(
    normalizedPoints,
    usePrediction,
    window,
    setPointsToDisplay,
    chart_size,
  ) {
    try {
      const movingAverageWindowPoints = normalizedPoints.slice(-window);
      const yValues = movingAverageWindowPoints.map((point) => point.y);
      const amplitude = Math.max(...yValues) - Math.min(...yValues);
      movingAverageWindowPoints.push({ y: amplitude });
      const prediction = await usePrediction(movingAverageWindowPoints);
      let newColor = processColor("green");
      if (prediction && prediction[0]) {
        if (prediction[0] == 1) {
          newColor = processColor("red");
          if (window == MOVING_TENS_WINDOW) {
            setBreathInState(true);
          }
        } else if (prediction[0] == -1) {
          newColor = processColor("blue");
          if (wasBreathIn && window == MOVING_TENS_WINDOW) {
            setBreathOutState(true);
          }
        }
      }

      setPointsToDisplay((prevPointsToDisplay) => {
        return {
          values: [
            ...normalizedPoints
          ],
          colors: [
            ...prevPointsToDisplay.colors.slice(-chart_size + 1),
            newColor,
          ],
        };
      });

      if (wasBreathIn && wasBreathOut && window == MOVING_TENS_WINDOW) {
        setBreathAmount((prevBreathsAmount) => prevBreathsAmount + 1);
        setBreathInState(false);
        setBreathOutState(false);
      }
    } catch (error) {
      console.error("Failed to predict", error);
    }
  }

  function movingAverage(data: string | any[], n: number) {
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
        result.push({ y: sum / n, x: data[i].x });
      }
    }
    return result;
  }

  function normalize(data: any[]): any {
    let maxY = Math.max(...data.map((p: { y: any }) => p.y));
    let minY = Math.min(...data.map((p: { y: any }) => p.y));
    return data.map((point) => ({
      y: (2 * (point.y - minY)) / (maxY - minY) - 1, x: point.x
    }));
  }

  function handleNaN(data, defaultValue = 0) {
    return data.map((point) => ({
      y: isNaN(point.y) ? defaultValue : point.y, x: point.x
    }));
  }

  return (
    <View style={styles.container}>
      <View style={styles.informationBox}>
        <View style={styles.timerBox}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.timerText}>
            {formatTime(seconds)}
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={() => {
              readDemoData("acc_test", TIME_INTERVAL_ACC),
                readDemoData("tens_test", TIME_INTERVAL_TENS);
            }}
            style={styles.demoChartStyle}
            disabled={isPlaying}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.startChartButtonText}
            >
              {isPlaying ? "PLAYING..." : "DEMO"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => resetChart()}
            style={styles.resetChartStyle}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.resetChartButtonText}
            >
              RESET
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.breathsBox}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.breathsText}
          >
            {breathAmount}
          </Text>
        </View>
      </View>

      <View style={styles.chart}>
        <LineChart
          legend={{ enabled: false }}
          chartDescription={{ text: "Tensometer" }}
          style={{ flex: 1 }} 
          group="sensors"
          syncX={true}
          syncY={true}   
          data={{
            dataSets: [
              {
                values: tensPointsToDisplay.values,
                label: "Tens",
                config: {
                  colors: tensPointsToDisplay.colors,
                  drawCircles: false,
                  lineWidth: 3,
                  drawValues: false,
                },
              },
            ],
          }}
        />
      </View>
      <View style={styles.chart}>
        <LineChart
          legend={{ enabled: false }}
          chartDescription={{ text: "Accelerometer" }}
          style={{ flex: 1 }}
          group="sensors"
          syncX={true}
          syncY={true}
          data={{
            dataSets: [
              {
                values: accPointsToDisplay.values,
                label: "Acc",
                config: {
                  colors: accPointsToDisplay.colors,
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
          }
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              textAlign: "center",
              fontSize: 50,
              color: "black",
              justifyContent: "center",
            }}
          >
            {isRunning.current ? "STOP" : "START"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FFF",
  },
  chart: {
    height: "42%",
    backgroundColor: "#FFF",
    width: "95%",
    alignSelf: "center",
  },
  informationBox: {
    marginTop: 5,
    flexDirection: "row",
    height: "7.5%",
    backgroundColor: "#FFF",
    justifyContent: "space-evenly",
  },
  breathsBox: {
    flex: 2,
  },
  breathsText: {
    fontSize: 40,
    color: "black",
    justifyContent: "center",
    alignSelf: "center",
  },
  timerBox: {
    flex: 2,
  },
  timerText: {
    fontSize: 40,
    color: "black",
    justifyContent: "center",
    alignSelf: "center",
  },
  buttons: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  startStopBox: {
    height: "7.5%",
    width: "90%",
    alignSelf: "center",
    paddingBottom: 10,
  },
  resetChartStyle: {
    flex: 2,
    height: "100%",
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  demoChartStyle: {
    flex: 2,
    height: "100%",
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  startChartStyle: {
    height: "100%",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#1fd655",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  stopChartStyle: {
    height: "100%",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#FF474C",
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  resetChartButtonText: {
    fontSize: 50,
    color: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  startChartButtonText: {
    fontSize: 50,
    color: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChartsScreen;
