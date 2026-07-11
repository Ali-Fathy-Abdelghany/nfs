import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context to hold authentication state (user info and token)
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load token from localStorage on mount and decode JWT payload to get user id
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        // "sub" claim is assumed to contain the user id
        setUser({ id: payload.sub, ...payload });
      } catch (e) {
        console.error('Failed to parse JWT payload', e);
        setUser(null);
      }
    }
  }, []);

  // Helper to store a new token after login
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ id: payload.sub, ...payload });
    } catch (e) {
      console.error('Failed to parse JWT payload on login', e);
      setUser(null);
    }
  };

  // Helper to clear auth state on logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook used throughout the app to access auth data
export const useAuth = () => useContext(AuthContext);
