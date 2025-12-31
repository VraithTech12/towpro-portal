import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'owner' | 'admin' | 'employee';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  username: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ClockRecord {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out?: string;
  duration?: number;
  date: string;
}

interface StaffMember {
  user_id: string;
  name: string;
  username: string;
  phone?: string;
  role: UserRole;
  clockedIn?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  staff: StaffMember[];
  clockRecords: ClockRecord[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  fetchClockRecords: () => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  isClockedIn: boolean;
  todayHours: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [todayHours, setTodayHours] = useState(0);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching role:', error);
      return;
    }

    setRole(data?.role as UserRole || null);
    
    // Fetch staff and clock records after role is known
    if (data?.role === 'owner' || data?.role === 'admin') {
      fetchStaff();
      fetchClockRecords();
      fetchUserClockRecords(userId); // Also fetch own clock records for clock in/out
    } else if (data?.role === 'employee') {
      fetchUserClockRecords(userId);
    }
  };

  const fetchStaff = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching staff profiles:', profilesError);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      console.error('Error fetching staff roles:', rolesError);
      return;
    }

    // Check who's clocked in
    const today = new Date().toISOString().split('T')[0];
    const { data: todayRecords } = await supabase
      .from('clock_records')
      .select('user_id')
      .eq('date', today)
      .is('clock_out', null);

    const clockedInUsers = new Set(todayRecords?.map(r => r.user_id) || []);

    const staffMembers: StaffMember[] = profiles?.map(p => {
      const userRole = roles?.find(r => r.user_id === p.user_id);
      return {
        user_id: p.user_id,
        name: p.name,
        username: p.username,
        phone: p.phone || undefined,
        role: (userRole?.role as UserRole) || 'employee',
        clockedIn: clockedInUsers.has(p.user_id),
      };
    }) || [];

    setStaff(staffMembers);
  };

  const fetchClockRecords = async () => {
    const { data, error } = await supabase
      .from('clock_records')
      .select('*')
      .order('clock_in', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching clock records:', error);
      return;
    }

    setClockRecords(data || []);
  };

  const fetchUserClockRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from('clock_records')
      .select('*')
      .eq('user_id', userId)
      .order('clock_in', { ascending: false });

    if (error) {
      console.error('Error fetching user clock records:', error);
      return;
    }

    setClockRecords(data || []);

    // Check if clocked in
    const today = new Date().toISOString().split('T')[0];
    const openRecord = data?.find(r => r.date === today && !r.clock_out);
    setIsClockedIn(!!openRecord);

    // Calculate today's hours
    const todayRecords = data?.filter(r => r.date === today) || [];
    const totalMinutes = todayRecords.reduce((acc, r) => acc + (r.duration || 0), 0);
    setTodayHours(totalMinutes / 60);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  };

  const logout = async () => {
    // Clock out if clocked in
    if (isClockedIn && user) {
      await clockOut();
    }
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    setStaff([]);
    setClockRecords([]);
  };

  const clockIn = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('clock_records')
      .insert({
        user_id: user.id,
        clock_in: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      console.error('Clock in error:', error);
      return;
    }

    setIsClockedIn(true);
    fetchUserClockRecords(user.id);
  };

  const clockOut = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Find the open record
    const { data: openRecord } = await supabase
      .from('clock_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .is('clock_out', null)
      .maybeSingle();

    if (!openRecord) return;

    const now = new Date();
    const clockInTime = new Date(openRecord.clock_in);
    const duration = Math.round((now.getTime() - clockInTime.getTime()) / 60000);

    const { error } = await supabase
      .from('clock_records')
      .update({
        clock_out: now.toISOString(),
        duration,
      })
      .eq('id', openRecord.id);

    if (error) {
      console.error('Clock out error:', error);
      return;
    }

    setIsClockedIn(false);
    fetchUserClockRecords(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      isAuthenticated: !!user,
      isLoading,
      staff,
      clockRecords,
      login,
      logout,
      fetchStaff,
      fetchClockRecords,
      clockIn,
      clockOut,
      isClockedIn,
      todayHours,
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
