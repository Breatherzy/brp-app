import React, {useContext} from "react";
import AccelerometerDataContext, {AccelerometerDataContextType} from "../contexts/AccelerometerDataContext";

export const useAccelerometerData = (): AccelerometerDataContextType => {
    const context = useContext(AccelerometerDataContext);
    if (!context) {
      throw new Error("useChartData must be used within a ChartDataProvider");
    }
    return context;
  };