import { createContext } from 'react';

export interface AccelerometerDataContextType {
  dataPointsAcc: Array<{ y: number }>;
  setAccelerometerData: React.Dispatch<React.SetStateAction<Array<{ y: number }>>>;
}

const AccelerometerDataContext = createContext<AccelerometerDataContextType | undefined>(undefined);

export default AccelerometerDataContext;
