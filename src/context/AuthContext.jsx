import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api';
import { isTokenExpired } from '../utils/utils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        logout();
      }
    };

    checkTokenExpiration();

    const interval = setInterval(checkTokenExpiration, 60000); 
    return () => clearInterval(interval);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;

      setToken(token);
      localStorage.setItem('token', token);
      setAuthToken(token);
    } catch (error) {
      console.error("Erro ao fazer login: ", error);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
