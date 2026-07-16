import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { apiService, User } from '../services/api';
import { loginSuccess, logout as logoutAction } from '../store/authReducer';
import { RootState } from '../store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, recaptchaToken?: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await apiService.initializeCsrf();
        const sessionUser = await apiService.checkAuth();
        if (sessionUser) {
          dispatch(loginSuccess(sessionUser));
        }
      } catch (error) {
        console.error('Session restore failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [dispatch]);

  const login = async (
    username: string,
    password: string,
    recaptchaToken?: string
  ): Promise<void> => {
    const response = await apiService.login(username, password, recaptchaToken);
    dispatch(loginSuccess(response.user));
  };

  const logout = async (): Promise<void> => {
    await apiService.logout();
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
