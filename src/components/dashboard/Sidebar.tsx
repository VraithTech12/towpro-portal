import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  FileText, 
  Truck, 
  Users, 
  Settings, 
  LogOut,
  Wrench,
  PlusCircle
} from 'lucide-react';
import towLogo from '@/assets/tow-logo.png';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { path: '/dashboard/new-report', icon: PlusCircle, label: 'New Report' },
    { path: '/dashboard/tow-units', icon: Truck, label: 'Tow Units' },
    { path: '/dashboard/mechanics', icon: Wrench, label: 'Mechanics' },
  ];

  const adminItems = [
    { path: '/dashboard/employees', icon: Users, label: 'Employees' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-card border-r border-border flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <img src={towLogo} alt="TowPro" className="w-6 h-6 object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors group relative ${
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 rounded bg-card text-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border shadow-lg">
              {item.label}
            </span>
          </Link>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="w-6 h-px bg-border my-2 mx-auto" />
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors group relative ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-card text-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border shadow-lg">
                  {item.label}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium text-xs">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <button
          onClick={logout}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group relative"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-full ml-2 px-2 py-1 rounded bg-card text-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border shadow-lg">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
