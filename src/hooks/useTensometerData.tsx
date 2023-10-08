import {useContext} from 'react';
import TensometerDataContext, {
  TensometerDataContextType,
} from '../contexts/TensometerDataContext';

export const useTensometerData = (): TensometerDataContextType => {
  const context = useContext(TensometerDataContext);
  if (!context) {
    throw new Error('useChartData must be used within a ChartDataProvider');
  }
  return context;
};
