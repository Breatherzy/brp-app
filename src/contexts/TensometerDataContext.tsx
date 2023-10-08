import {createContext} from 'react';

export interface TensometerDataContextType {
  tensPoints: Array<{y: number}>;
  setTensPoints: React.Dispatch<React.SetStateAction<Array<{y: number}>>>;
}

const TensometerDataContext = createContext<
  TensometerDataContextType | undefined
>(undefined);

export default TensometerDataContext;
