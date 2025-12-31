import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'employee';

interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined users
const users: Record<string, { password: string; user: User }> = {
  admin: {
    password: '123',
    user: {
      id: '1',
      name: 'Administrator',
      username: 'admin',
      role: 'admin',
    },
  },
  employee1: {
    password: 'emp123',
    user: {
      id: '2',
      name: 'John Driver',
      username: 'employee1',
      role: 'employee',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const userRecord = users[username.toLowerCase()];
    
    if (!userRecord) {
      return { success: false, error: 'User not found' };
    }
    
    if (userRecord.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    setUser(userRecord.user);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
