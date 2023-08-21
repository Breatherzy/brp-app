import { createContext } from 'react';

export interface DataPoint {
  y: number;
}

export interface AccelerometerDataContextType {
  dataPointsAcc: DataPoint[];
  setAccelerometerData: React.Dispatch<React.SetStateAction<DataPoint[]>>;
}

const AccelerometerDataContext = createContext<AccelerometerDataContextType | undefined>(undefined);

export default AccelerometerDataContext;
