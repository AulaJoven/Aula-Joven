import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aj_token') || sessionStorage.getItem('aj_token');
    const saved = localStorage.getItem('aj_user')  || sessionStorage.getItem('aj_user');
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
        setIsAuthenticated(true);
      } catch {
        localStorage.clear();
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, remember) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      const token   = data.data.token;
      const newUser = data.data.user;

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('aj_token', token);
      storage.setItem('aj_user', JSON.stringify(newUser));

      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, rol: newUser.rol };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error al conectar con el servidor' };
    }
  };

  const logout = () => {
    ['aj_token', 'aj_user'].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;