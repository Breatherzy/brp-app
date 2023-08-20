import React, {useContext} from "react";
import ChartDataContext, {ChartDataContextType} from "../contexts/ChartDataContext";

export const useChartData = (): ChartDataContextType => {
    const context = useContext(ChartDataContext);
    if (!context) {
      throw new Error("useChartData must be used within a ChartDataProvider");
    }
    return context;
  };
  