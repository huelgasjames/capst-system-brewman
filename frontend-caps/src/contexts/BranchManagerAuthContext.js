import React, { createContext, useContext, useState, useEffect } from 'react';

const BranchManagerAuthContext = createContext();

export const useBranchManagerAuth = () => {
  const context = useContext(BranchManagerAuthContext);
  if (!context) {
    throw new Error('useBranchManagerAuth must be used within a BranchManagerAuthProvider');
  }
  return context;
};

export const BranchManagerAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('branchManagerToken');
      const userData = localStorage.getItem('branchManagerData');

      if (token && userData) {
        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/branch-manager/check-auth`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage
          logout();
        }
      }
    } catch (error) {
      console.error('Branch Manager auth check error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/branch-manager/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token
        localStorage.setItem('branchManagerToken', data.token);
        localStorage.setItem('branchManagerData', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Branch Manager login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('branchManagerToken');
    localStorage.removeItem('branchManagerData');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    // Call backend logout if possible
    const token = localStorage.getItem('branchManagerToken');
    if (token) {
      fetch(`${API_BASE_URL}/branch-manager/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).catch(console.error);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('branchManagerToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeaders,
    checkAuthStatus,
  };

  return (
    <BranchManagerAuthContext.Provider value={value}>
      {children}
    </BranchManagerAuthContext.Provider>
  );
};
