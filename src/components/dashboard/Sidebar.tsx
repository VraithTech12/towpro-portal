import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  FileText, 
  Truck, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  ClipboardList,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import apexLogo from '@/assets/apex-logo.png';

const Sidebar = () => {
  const { profile, role, logout } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { path: '/dashboard/tow-units', icon: Truck, label: 'Tow Units' },
  ];

  const adminItems = [
    { path: '/dashboard/employees', icon: Users, label: 'Staff' },
    { path: '/dashboard/applications', icon: ClipboardList, label: 'Applications' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/audit-logs', icon: History, label: 'Audit Logs' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-16'
    }`}>
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-border ${isExpanded ? 'px-4 justify-between' : 'justify-center'}`}>
        {isExpanded ? (
          <>
            <div className="flex items-center gap-3">
              <img src={apexLogo} alt="Apex" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-lg text-foreground">APEX TOW</span>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 ${isExpanded ? 'px-3' : 'px-2'} space-y-1 overflow-y-auto`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            } ${!isExpanded ? 'justify-center' : ''}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}

        {(role === 'admin' || role === 'owner') && (
          <>
            <div className={`h-px bg-border my-4 ${isExpanded ? 'mx-2' : 'mx-1'}`} />
            <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ${isExpanded ? 'px-3' : 'text-center'}`}>
              {isExpanded ? 'Management' : '•••'}
            </p>
            {adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } ${!isExpanded ? 'justify-center' : ''}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="font-medium">{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className={`border-t border-border p-3 ${!isExpanded ? 'flex flex-col items-center' : ''}`}>
        {isExpanded ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{profile?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold mb-2">
            {profile?.name?.charAt(0) || 'U'}
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full ${
            !isExpanded ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
