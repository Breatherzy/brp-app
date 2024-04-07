import {createContext} from 'react';

export interface UserDataContextType {
  seconds: number;
  tenMiliseconds: number;
  breathAmount: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  setTenMiliseconds: React.Dispatch<React.SetStateAction<number>>;
  setBreathAmount: React.Dispatch<React.SetStateAction<number>>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

export default UserDataContext;
