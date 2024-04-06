import {createContext} from 'react';

export interface TensometerDataContextType {
  tensPoints: Array<{ y: number; x: number }>;
  setTensPoints: React.Dispatch<React.SetStateAction<Array<{ y: number; x: number }>>>;
}

const TensometerDataContext = createContext<
  TensometerDataContextType | undefined
>(undefined);

export default TensometerDataContext;
