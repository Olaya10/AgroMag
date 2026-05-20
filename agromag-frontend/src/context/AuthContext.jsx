import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('agroMagUser');
      if (!savedUser) return null;
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.role) {
        parsedUser.role = parsedUser.role.toUpperCase();
      }
      return parsedUser;
    } catch (error) {
      console.warn('Usuario guardado en localStorage inválido:', error);
      localStorage.removeItem('agroMagUser');
      return null;
    }
  });

  const login = (userData) => {
    const normalizedUser = {
      ...userData,
      role: userData?.role ? userData.role.toUpperCase() : 'OPERARIO',
    };
    setCurrentUser(normalizedUser);
    localStorage.setItem('agroMagUser', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agroMagUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
