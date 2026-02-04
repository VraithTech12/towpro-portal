import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Header = () => {
  const { profile, role } = useAuth();

  return (
    <header className="h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reports, units, staff..."
            className="pl-11 h-11 bg-secondary/50 border-border rounded-xl"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button className="w-11 h-11 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{profile?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{role || 'Staff'}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">{profile?.name?.charAt(0) || 'U'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
