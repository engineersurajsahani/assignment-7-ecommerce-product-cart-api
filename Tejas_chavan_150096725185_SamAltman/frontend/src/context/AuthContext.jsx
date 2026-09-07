// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res && res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      if (res && res.success && res.data) {
        setUser(res.data);
        return { success: true, user: res.data };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err) {
      const message = err.data?.message || err.message || 'Invalid email or password.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const register = async (username, email, password) => {
    setAuthError(null);
    try {
      const res = await api.register(username, email, password);
      if (res && res.success) {
        // Automatically attempt login right after registration
        const loginRes = await api.login(email, password);
        if (loginRes && loginRes.success && loginRes.data) {
          setUser(loginRes.data);
          return { success: true, user: loginRes.data };
        }
        return { success: true, user: res.data };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err) {
      const message = err.data?.message || err.message || 'Registration failed.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const invalidateSession = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        invalidateSession,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
