import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Apply from "./pages/Apply";
import CheckStatus from "./pages/CheckStatus";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Reports from "./pages/dashboard/Reports";
import NewReport from "./pages/dashboard/NewReport";
import TowUnits from "./pages/dashboard/TowUnits";
import Mechanics from "./pages/dashboard/Mechanics";
import Employees from "./pages/dashboard/Employees";
import Settings from "./pages/dashboard/Settings";
import Analytics from "./pages/dashboard/Analytics";
import Applications from "./pages/dashboard/Applications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/check-status" element={<CheckStatus />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="reports" element={<Reports />} />
                <Route path="new-report" element={<NewReport />} />
                <Route path="tow-units" element={<TowUnits />} />
                <Route path="mechanics" element={<Mechanics />} />
                <Route path="employees" element={<Employees />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="applications" element={<Applications />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
