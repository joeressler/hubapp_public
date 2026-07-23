import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiService, User } from '../services/api';
import { loginSuccess, logout as logoutAction } from '../store/authReducer';
import { RootState } from '../store';

interface AuthContextType {
  user: User | null;
  ready: boolean;
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const sessionUser = await apiService.checkAuth();
        if (!cancelled && sessionUser) {
          dispatch(loginSuccess(sessionUser));
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await apiService.login(username, password);
    dispatch(loginSuccess(response.user));
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } finally {
      dispatch(logoutAction());
    }
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
