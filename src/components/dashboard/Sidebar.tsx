import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  FileText, 
  Truck, 
  Users, 
  Settings, 
  LogOut,
  ClipboardList,
  Wrench
} from 'lucide-react';
import towLogo from '@/assets/tow-logo.png';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { path: '/dashboard/tow-units', icon: Truck, label: 'Tow Units' },
    { path: '/dashboard/mechanics', icon: Wrench, label: 'Mechanics' },
  ];

  const adminItems = [
    { path: '/dashboard/employees', icon: Users, label: 'Employees' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-sidebar-accent flex items-center justify-center border border-sidebar-border">
          <img src={towLogo} alt="TowPro" className="w-8 h-8 object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
              isActive(item.path)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-card text-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-border">
              {item.label}
            </span>
          </Link>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="w-8 h-px bg-sidebar-border my-2" />
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
                  isActive(item.path)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-card text-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-border">
                  {item.label}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold text-sm border border-sidebar-border">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <button
          onClick={logout}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-200 group relative"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-card text-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-border">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
