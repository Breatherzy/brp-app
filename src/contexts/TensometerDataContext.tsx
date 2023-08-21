import { createContext } from 'react';

export interface DataPoint {
  y: number;
}

export interface TensometerDataContextType {
  dataPointsTens: DataPoint[];
  setTensometerData: React.Dispatch<React.SetStateAction<DataPoint[]>>;
}

const TensometerDataContext = createContext<TensometerDataContextType | undefined>(undefined);

export default TensometerDataContext;
