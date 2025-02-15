// AppContext.js
import React, { createContext, useReducer, useContext } from 'react';

const AppContext = createContext();

const initialState = {
  userID: null,
  storageTime: null,
  storageLocation: null,
  currentLocation: null
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER_ID':
      return { ...state, userID: action.payload };
    case 'SET_STORAGE_TIME':
      return { ...state, storageTime: action.payload };
    case 'SET_STORAGE_LOCATION':
      return { ...state, storageLocation: action.payload };
    case 'SET_CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
