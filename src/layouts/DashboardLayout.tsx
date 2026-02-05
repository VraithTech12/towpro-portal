 import { Outlet, Navigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import Sidebar from '@/components/dashboard/Sidebar';
 import Header from '@/components/dashboard/Header';
 import { useIsMobile } from '@/hooks/use-mobile';
 
 const DashboardLayout = () => {
   const { isAuthenticated, isLoading } = useAuth();
   const isMobile = useIsMobile();
 
   if (isLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
       </div>
     );
   }
 
   if (!isAuthenticated) {
     return <Navigate to="/login" replace />;
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Sidebar />
       <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-64'}`}>
         <Header />
         <main className={`${isMobile ? 'p-4' : 'p-6 lg:p-8'}`}>
           <Outlet />
         </main>
       </div>
     </div>
   );
 };
 
 export default DashboardLayout;