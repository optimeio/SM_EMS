import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedUser = localStorage.getItem('userInfo');
    if (!storedUser) return;
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.token && parsed.role === 'employee') {
        const { data } = await API.get('/employees/me');
        const updatedUser = { ...parsed, ...data };
        // Deep compare full user object to detect ANY Admin edits (joiningDate, bloodGroup, DOB, etc.)
        if (JSON.stringify(parsed) !== JSON.stringify(updatedUser)) {
          setUser(updatedUser);
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
