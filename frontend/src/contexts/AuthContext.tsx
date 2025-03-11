import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiService } from '../services/api';
import { loginSuccess, logout } from '../store/authReducer';
import { RootState } from '../store';
import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

interface AuthContextType {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const login = (username: string, password: string): ThunkAction<void, RootState, unknown, AnyAction> => {
    return async (dispatch) => {
      try {
        const response = await apiService.login(username, password);
        dispatch(loginSuccess(response.user));
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    };
  };

  const logout = (): ThunkAction<void, RootState, unknown, AnyAction> => {
    return async (dispatch) => {
      try {
        await apiService.logout();
        dispatch(logout());
      } catch (error) {
        console.error('Logout failed:', error);
        throw error;
      }
    };
  };

  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 