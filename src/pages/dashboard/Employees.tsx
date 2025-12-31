import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User, Mail, Phone, Shield, Edit, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee';
  position: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'Mike Johnson', email: 'mike@towpro.com', phone: '(555) 123-4567', role: 'admin', position: 'Operations Manager', status: 'active', joinedDate: '2022-03-15' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@towpro.com', phone: '(555) 234-5678', role: 'employee', position: 'Tow Operator', status: 'active', joinedDate: '2023-01-10' },
  { id: '3', name: 'Tom Davis', email: 'tom@towpro.com', phone: '(555) 345-6789', role: 'employee', position: 'Tow Operator', status: 'active', joinedDate: '2023-05-20' },
  { id: '4', name: 'Lisa Chen', email: 'lisa@towpro.com', phone: '(555) 456-7890', role: 'employee', position: 'Dispatcher', status: 'active', joinedDate: '2022-11-08' },
  { id: '5', name: 'James Brown', email: 'james@towpro.com', phone: '(555) 567-8901', role: 'employee', position: 'Tow Operator', status: 'inactive', joinedDate: '2021-07-12' },
];

const Employees = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Admin-only page
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredEmployees = mockEmployees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{mockEmployees.length}</p>
          <p className="text-sm text-muted-foreground">Total Employees</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">{mockEmployees.filter(e => e.status === 'active').length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{mockEmployees.filter(e => e.role === 'admin').length}</p>
          <p className="text-sm text-muted-foreground">Admins</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{mockEmployees.filter(e => e.status === 'inactive').length}</p>
          <p className="text-sm text-muted-foreground">Inactive</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Position</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="font-semibold text-foreground">{employee.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">Joined {employee.joinedDate}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">{employee.position}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    employee.role === 'admin' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {employee.role === 'admin' && <Shield className="w-3 h-3" />}
                    {employee.role === 'admin' ? 'Admin' : 'Employee'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    employee.status === 'active'
                      ? 'bg-success/20 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {employee.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
