import {useContext} from 'react';
import UserDataContext, {
  UserDataContextType,
} from '../contexts/UserDataContext';

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useChartData must be used within a ChartDataProvider');
  }
  return context;
};
