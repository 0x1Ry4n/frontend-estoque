import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api';
import { isTokenExpired } from '../utils/utils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      if (isTokenExpired(token)) {
        try {
          const response = await api.post('/auth/refresh-token', { token: refreshToken });
          const newToken = response.data.token;
          setToken(newToken);
          localStorage.setItem('token', newToken);
          setAuthToken(newToken);
        } catch (error) {
          console.error("Erro ao atualizar o token: ", error);
        }
      }
    };

    refreshTokenIfNeeded();

    const interval = setInterval(refreshTokenIfNeeded, 60000); 
    return () => clearInterval(interval);
  }, [refreshToken, token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, refreshToken } = response.data;

    setToken(token);
    setRefreshToken(refreshToken);
    localStorage.setItem('token', token);
    setAuthToken(token);
    localStorage.setItem('refreshToken', refreshToken);
  };

  return (
    <AuthContext.Provider value={{ token, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
