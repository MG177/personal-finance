import React, { createContext, useContext, useState, useEffect } from 'react';
import strapiAPI from '../api/strapi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      // Restore the stored user state
      setUser(JSON.parse(storedUser));
      strapiAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await strapiAPI.post('auth/local', {
        identifier,
        password,
      });
      
      const { jwt, user } = response.data;
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(user));
      strapiAPI.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete strapiAPI.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const register = async (username, email, password) => {
    try {
      const response = await strapiAPI.post('auth/local/register', {
        username,
        email,
        password,
      });
      
      const { jwt, user } = response.data;
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(user));
      strapiAPI.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
