import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser } from '../api/config';
import { clearAuthSession, logout as apiLogout, persistAuthSession } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const storedUser = getStoredUser();
    if (storedToken) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const login = (loginResponse) => {
    const { user: authUser, accessToken } = persistAuthSession(loginResponse);
    setToken(accessToken);
    setUser(authUser);
  };

  const logout = async () => {
    await apiLogout();
    clearAuthSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
