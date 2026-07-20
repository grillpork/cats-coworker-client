"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { authServices } from "../../../services/auth.service";
import { getSession, setSession, clearSession } from "../../../utils/session";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  fetchUser: async () => {},
  loginWithGoogle: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await authServices.me();
      // Handle both wrapped and unwrapped response
      const userData = response?.data || response;
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setUser(null);
      setIsAuthenticated(false);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getSession();
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authServices.login(email, password);
      const token = response?.token || response?.data?.token;

      if (token) {
        setSession(token);
        // Fetch profile with new token
        await fetchUser();
        return { success: true };
      } else {
        throw new Error("No token returned from server");
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [fetchUser]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();
    // Call server logout asynchronously
    authServices.logout().catch((err) => {
      console.error("Failed server logout API call:", err);
    });
  }, []);

  const loginWithGoogle = useCallback(async (googleToken) => {
    setLoading(true);
    try {
      const response = await authServices.googleLogin(googleToken);
      const token = response?.token || response?.data?.token;

      if (token) {
        setSession(token);
        // Fetch profile with new token
        await fetchUser();
        return { success: true };
      } else {
        throw new Error("No token returned from server");
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [fetchUser]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    fetchUser,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
