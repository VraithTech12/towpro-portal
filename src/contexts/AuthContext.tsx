import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'owner' | 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  username: string;
  phone?: string;
  role: UserRole;
  clockedIn?: boolean;
  clockInTime?: string;
}

export interface ClockRecord {
  id: string;
  userId: string;
  clockIn: string;
  clockOut?: string;
  duration?: number; // in minutes
  date: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  clockRecords: ClockRecord[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addUser: (userData: Omit<User, 'id'> & { password: string }) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  clockIn: () => void;
  clockOut: () => void;
  getUserClockRecords: (userId: string) => ClockRecord[];
  getTodayHours: (userId: string) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// User credentials stored separately for security
const userCredentials: Record<string, string> = {
  owner: 'owner123',
  admin: '123',
  employee1: 'emp123',
};

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Owner',
    username: 'owner',
    phone: '555-0100',
    role: 'owner',
  },
  {
    id: '2',
    name: 'Administrator',
    username: 'admin',
    phone: '555-0101',
    role: 'admin',
  },
  {
    id: '3',
    name: 'John Driver',
    username: 'employee1',
    phone: '555-0102',
    role: 'employee',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [credentials, setCredentials] = useState<Record<string, string>>(userCredentials);
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'User not found' };
    }
    
    const storedPassword = credentials[foundUser.username.toLowerCase()];
    
    if (storedPassword !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    setUser(foundUser);
    return { success: true };
  };

  const logout = () => {
    // Auto clock out if clocked in
    if (user?.clockedIn) {
      clockOut();
    }
    setUser(null);
  };

  const addUser = (userData: Omit<User, 'id'> & { password: string }) => {
    const { password, ...userInfo } = userData;
    const newUser: User = {
      ...userInfo,
      id: crypto.randomUUID(),
    };
    setUsers(prev => [...prev, newUser]);
    setCredentials(prev => ({ ...prev, [userData.username.toLowerCase()]: password }));
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    if (user?.id === id) {
      setUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setCredentials(prev => {
        const newCreds = { ...prev };
        delete newCreds[userToDelete.username.toLowerCase()];
        return newCreds;
      });
    }
  };

  const clockIn = () => {
    if (!user || user.clockedIn) return;
    
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    
    const newRecord: ClockRecord = {
      id: crypto.randomUUID(),
      userId: user.id,
      clockIn: now,
      date: today,
    };
    
    setClockRecords(prev => [...prev, newRecord]);
    updateUser(user.id, { clockedIn: true, clockInTime: now });
  };

  const clockOut = () => {
    if (!user || !user.clockedIn) return;
    
    const now = new Date();
    const clockInTime = new Date(user.clockInTime!);
    const duration = Math.round((now.getTime() - clockInTime.getTime()) / 60000); // minutes
    
    setClockRecords(prev => prev.map(r => {
      if (r.userId === user.id && !r.clockOut) {
        return { ...r, clockOut: now.toISOString(), duration };
      }
      return r;
    }));
    
    updateUser(user.id, { clockedIn: false, clockInTime: undefined });
  };

  const getUserClockRecords = (userId: string) => {
    return clockRecords.filter(r => r.userId === userId);
  };

  const getTodayHours = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = clockRecords.filter(r => r.userId === userId && r.date === today);
    return todayRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      clockRecords,
      isAuthenticated: !!user, 
      login, 
      logout,
      addUser,
      updateUser,
      deleteUser,
      clockIn,
      clockOut,
      getUserClockRecords,
      getTodayHours,
    }}>
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
