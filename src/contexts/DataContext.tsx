import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Report {
  id: string;
  title: string;
  type: 'tow' | 'roadside' | 'impound';
  status: 'open' | 'closed' | 'in-progress' | 'pending';
  dateCreated: string;
  location: string;
  pdTow: boolean;
  customerName?: string;
  customerPhone?: string;
  assignedTo?: string;
  createdBy: string;
  notes?: string;
}

export interface TowUnit {
  id: string;
  name: string;
  operator: string;
  phone: string;
  status: 'available' | 'dispatched' | 'offline' | 'maintenance';
  location: string;
  vehicleType: string;
  licensePlate: string;
}

interface DataContextType {
  reports: Report[];
  towUnits: TowUnit[];
  isLoadingReports: boolean;
  addReport: (report: Omit<Report, 'id' | 'dateCreated' | 'createdBy'>) => Promise<boolean>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  fetchReports: () => Promise<void>;
  addTowUnit: (unit: Omit<TowUnit, 'id'>) => void;
  updateTowUnit: (id: string, updates: Partial<TowUnit>) => void;
  deleteTowUnit: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, role, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [towUnits, setTowUnits] = useState<TowUnit[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      const mappedReports: Report[] = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type as 'tow' | 'roadside' | 'impound',
        status: r.status as 'open' | 'closed' | 'in-progress' | 'pending',
        dateCreated: new Date(r.created_at).toLocaleDateString('en-US'),
        location: r.location,
        pdTow: r.pd_tow || false,
        customerName: r.customer_name || undefined,
        customerPhone: r.customer_phone || undefined,
        assignedTo: r.assigned_to || undefined,
        createdBy: r.created_by,
        notes: r.notes || undefined,
      }));

      setReports(mappedReports);
    } finally {
      setIsLoadingReports(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReports();
    }
  }, [isAuthenticated, user, fetchReports]);

  const addReport = async (report: Omit<Report, 'id' | 'dateCreated' | 'createdBy'>): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase
      .from('reports')
      .insert({
        created_by: user.id,
        assigned_to: role === 'employee' ? user.id : null,
        title: report.title,
        type: report.type,
        location: report.location,
        pd_tow: report.pdTow,
        customer_name: report.customerName || null,
        customer_phone: report.customerPhone || null,
        notes: report.notes || null,
        status: report.status || 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return false;
    }

    // Refresh reports list
    await fetchReports();
    return true;
  };

  const updateReport = async (id: string, updates: Partial<Report>): Promise<boolean> => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.pdTow !== undefined) dbUpdates.pd_tow = updates.pdTow;
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
    if (updates.customerPhone !== undefined) dbUpdates.customer_phone = updates.customerPhone;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;

    const { error } = await supabase
      .from('reports')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating report:', error);
      return false;
    }

    await fetchReports();
    return true;
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting report:', error);
      return false;
    }

    await fetchReports();
    return true;
  };

  const addTowUnit = (unit: Omit<TowUnit, 'id'>) => {
    const newUnit: TowUnit = {
      ...unit,
      id: Date.now().toString(),
    };
    setTowUnits((prev) => [newUnit, ...prev]);
  };

  const updateTowUnit = (id: string, updates: Partial<TowUnit>) => {
    setTowUnits((prev) =>
      prev.map((unit) => (unit.id === id ? { ...unit, ...updates } : unit))
    );
  };

  const deleteTowUnit = (id: string) => {
    setTowUnits((prev) => prev.filter((unit) => unit.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        reports,
        towUnits,
        isLoadingReports,
        addReport,
        updateReport,
        deleteReport,
        fetchReports,
        addTowUnit,
        updateTowUnit,
        deleteTowUnit,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
