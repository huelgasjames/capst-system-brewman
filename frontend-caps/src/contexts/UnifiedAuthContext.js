import React, { createContext, useContext, useState, useEffect } from 'react';

const UnifiedAuthContext = createContext();

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export const UnifiedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin', 'user', 'branch_manager'
  const [authChecked, setAuthChecked] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Check authentication status on app load
  useEffect(() => {
    if (!authChecked && !justLoggedIn) {
      checkAuthStatus();
    }
  }, [authChecked, justLoggedIn]);

  const checkAuthStatus = async () => {
    try {
      // Check for admin token first
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');

      if (adminToken && adminData) {
        try {
          const parsedAdminData = JSON.parse(adminData);
          // Set user data from localStorage first (immediate UI update)
          setUser(parsedAdminData);
          setUserType('admin');
          setIsAuthenticated(true);
          setLoading(false);
          setAuthChecked(true);

          // Then verify token in background (optional verification)
          try {
            const response = await fetch(`${API_BASE_URL}/check-auth`, {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
              },
            });

            if (!response.ok) {
              // Token verification failed, but don't logout immediately
              // Just log the issue - user can still use the app with cached data
              console.warn('Token verification failed, but keeping user logged in with cached data');
            }
          } catch (verifyError) {
            // Network error during verification - don't logout
            console.warn('Token verification network error, but keeping user logged in with cached data:', verifyError.message);
          }
          return;
        } catch (parseError) {
          console.error('Error parsing admin data:', parseError);
          logout();
          return;
        }
      }

      // Check for user token (branch manager/staff)
      const userToken = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');

      if (userToken && userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          // Set user data from localStorage first (immediate UI update)
          setUser(parsedUserData);
          setUserType('user');
          setIsAuthenticated(true);
          setLoading(false);
          setAuthChecked(true);

          // Then verify token in background (optional verification)
          try {
            const response = await fetch(`${API_BASE_URL}/user/check-auth`, {
              headers: {
                'Authorization': `Bearer ${userToken}`,
                'Accept': 'application/json',
              },
            });

            if (!response.ok) {
              // Token verification failed, but don't logout immediately
              // Just log the issue - user can still use the app with cached data
              console.warn('Token verification failed, but keeping user logged in with cached data');
            }
          } catch (verifyError) {
            // Network error during verification - don't logout
            console.warn('Token verification network error, but keeping user logged in with cached data:', verifyError.message);
          }
          return;
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          logout();
          return;
        }
      }

      // If no valid tokens found, clear everything
      logout();
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = async (email, password) => {
    try {
      // Try admin login first
      const adminResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (adminResponse.ok) {
        const data = await adminResponse.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        setUser(data.admin);
        setUserType('admin');
        setIsAuthenticated(true);
        setJustLoggedIn(true);
        setAuthChecked(true);
        
        // Reset justLoggedIn flag after 5 seconds to allow normal auth checks
        setTimeout(() => {
          setJustLoggedIn(false);
        }, 5000);
        
        return { success: true, data, userType: 'admin' };
      }

      // Try user login (branch manager/staff)
      const userResponse = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (userResponse.ok) {
        const data = await userResponse.json();
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        setUserType('user');
        setIsAuthenticated(true);
        setJustLoggedIn(true);
        setAuthChecked(true);
        
        // Reset justLoggedIn flag after 5 seconds to allow normal auth checks
        setTimeout(() => {
          setJustLoggedIn(false);
        }, 5000);
        
        return { success: true, data, userType: 'user' };
      }

      // If both fail, return error
      const errorData = await userResponse.json();
      return { success: false, error: errorData.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    // Clear all tokens and data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    
    // Clear state
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
    setAuthChecked(false);
    setJustLoggedIn(false);
    
    // Call backend logout if possible
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    
    if (adminToken) {
      fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
        },
      }).catch(console.error);
    }
    
    if (userToken) {
      fetch(`${API_BASE_URL}/user/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
        },
      }).catch(console.error);
    }
  };

  const getAuthHeaders = () => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    const token = adminToken || userToken;
    
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  };

  // Helper functions for role checking
  const isAdmin = () => userType === 'admin';
  const isUser = () => userType === 'user';
  const isBranchManager = () => userType === 'user' && user?.role === 'Branch Manager';
  const isStaff = () => userType === 'user' && user?.role !== 'Branch Manager';
  const isSuperAdmin = () => userType === 'admin' && user?.role === 'Super Admin';
  const isOwner = () => userType === 'admin' && user?.role === 'Owner';

  // Get user's branch ID (for branch-specific operations)
  const getUserBranchId = () => {
    if (userType === 'user') {
      return user?.branch_id;
    }
    return null; // Admins don't have branch restrictions
  };

  // Manual auth check function (for when user wants to refresh auth status)
  const manualAuthCheck = async () => {
    setAuthChecked(false);
    await checkAuthStatus();
  };

  // Function to handle authentication errors gracefully
  const handleAuthError = (error) => {
    console.warn('Authentication error detected:', error.message);
    
    // If the error is specifically about authentication, try to refresh the auth status
    if (error.message === 'Unauthorized' || error.message.includes('token')) {
      console.log('Attempting to refresh authentication status...');
      manualAuthCheck();
    }
  };

  const value = {
    user,
    userType,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeaders,
    checkAuthStatus: manualAuthCheck,
    handleAuthError,
    // Role checking functions
    isAdmin,
    isUser,
    isBranchManager,
    isStaff,
    isSuperAdmin,
    isOwner,
    getUserBranchId,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};
