import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Report {
  id: string;
  title: string;
  type: 'tow' | 'roadside' | 'accident' | 'impound';
  status: 'open' | 'closed' | 'in-progress' | 'pending';
  dateCreated: string;
  location: string;
  vehicle: string;
  customerName: string;
  customerPhone: string;
  assignedTo?: string;
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
  addReport: (report: Omit<Report, 'id' | 'dateCreated'>) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  addTowUnit: (unit: Omit<TowUnit, 'id'>) => void;
  updateTowUnit: (id: string, updates: Partial<TowUnit>) => void;
  deleteTowUnit: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [towUnits, setTowUnits] = useState<TowUnit[]>([]);

  const addReport = (report: Omit<Report, 'id' | 'dateCreated'>) => {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      dateCreated: new Date().toLocaleDateString('en-US'),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, ...updates } : report))
    );
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((report) => report.id !== id));
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
        addReport,
        updateReport,
        deleteReport,
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
