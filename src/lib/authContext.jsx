import React, { createContext, useContext, useState, useEffect } from 'react';

// Create AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth state on app load
    const storedAuth = localStorage.getItem('auth_state');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated && authData.user) {
          setUser(authData.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.removeItem('auth_state');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, sessionToken) => {
    console.log('AuthContext login called with:', userData);
    
    const userObject = {
      id: userData.id || `user_${Date.now()}`,
      email: userData.email,
      name: userData.name || userData.email?.split('@')[0] || 'User'
    };
    
    setUser(userObject);
    setIsAuthenticated(true);
    
    // Store auth state in localStorage
    const authState = {
      user: userObject,
      isAuthenticated: true,
      sessionToken: sessionToken || 'mock_session_token'
    };
    
    localStorage.setItem('auth_state', JSON.stringify(authState));
    console.log('User logged in successfully:', userObject);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_state');
    console.log('User logged out');
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext register called with:', userData);
      
      const userObject = {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0]
      };
      
      // In a real app, you would make an API call here
      // For now, we'll just store the user data
      const authState = {
        user: userObject,
        isAuthenticated: false, // User needs to login after registration
        sessionToken: null
      };
      
      localStorage.setItem('registered_user', JSON.stringify(userObject));
      console.log('User registered successfully:', userObject);
      
      return { success: true, user: userObject };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;