import {createContext} from 'react';

export interface AccelerometerDataContextType {
  accPoints: Array<{y: number}>;
  setAccPoints: React.Dispatch<React.SetStateAction<Array<{y: number}>>>;
}

const AccelerometerDataContext = createContext<
  AccelerometerDataContextType | undefined
>(undefined);

export default AccelerometerDataContext;
