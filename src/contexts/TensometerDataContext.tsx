import { createContext } from 'react';

export interface TensometerDataContextType {
  dataPointsTens: Array<{ y: number }>;
  setTensometerData: React.Dispatch<React.SetStateAction<Array<{ y: number }>>>;
}

const TensometerDataContext = createContext<TensometerDataContextType | undefined>(undefined);

export default TensometerDataContext;
