import React from 'react';

export type ChartDataContextType = {
  dataPoints: Array<{ y: number }>;
  setDataPoints: React.Dispatch<React.SetStateAction<Array<{ y: number }>>>;
};

const ChartDataContext = React.createContext<ChartDataContextType | undefined>(undefined);

export default ChartDataContext;
