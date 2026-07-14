import React, { createContext, useContext, useState } from 'react';
import { getStoredUser } from '../api/config';
import { clearAuthSession, logout as apiLogout, persistAuthSession } from '../api/auth';

const AuthContext = createContext(null);

function readStoredToken() {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
}

export const AuthProvider = ({ children }) => {
  // Hydrate synchronously so first paint after refresh is already authenticated
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => readStoredToken());

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
