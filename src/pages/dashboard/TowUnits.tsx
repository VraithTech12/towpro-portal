 import { useState } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { useData, TowUnit } from '@/contexts/DataContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Plus, Search, Truck, Trash2, X, DollarSign, CreditCard } from 'lucide-react';
 import { toast } from 'sonner';
 import { useIsMobile } from '@/hooks/use-mobile';
 
 const TowUnits = () => {
   const { user, role } = useAuth();
   const { towUnits, addTowUnit, updateTowUnit, deleteTowUnit } = useData();
   const [searchTerm, setSearchTerm] = useState('');
   const [showAddForm, setShowAddForm] = useState(false);
   const isMobile = useIsMobile();
   const [newUnit, setNewUnit] = useState({
     name: '',
     operator: '',
     phone: '',
     location: '',
     vehicleType: 'flatbed',
     licensePlate: '',
     isOnLoan: false,
     vehicleCost: '',
     weeklyPayment: '',
     downPayment: '',
   });
 
   const filteredUnits = towUnits.filter((unit) =>
     unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     unit.operator.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const handleAddUnit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!newUnit.name || !newUnit.operator || !newUnit.licensePlate) {
       toast.error('Please fill in required fields');
       return;
     }
 
     addTowUnit({
       ...newUnit,
       status: 'available',
     });
 
     setNewUnit({ 
       name: '', 
       operator: '', 
       phone: '', 
       location: '', 
       vehicleType: 'flatbed', 
       licensePlate: '',
       isOnLoan: false,
       vehicleCost: '',
       weeklyPayment: '',
       downPayment: '',
     });
     setShowAddForm(false);
     toast.success('Unit added successfully');
   };
 
   const handleStatusChange = (id: string, status: TowUnit['status']) => {
     updateTowUnit(id, { status });
     toast.success('Status updated');
   };
 
   const handleDelete = (id: string) => {
     if (role !== 'admin' && role !== 'owner') {
       toast.error('Only admins and owners can delete units');
       return;
     }
     deleteTowUnit(id);
     toast.success('Unit deleted');
   };
 
   const statusConfig: Record<string, { label: string; className: string }> = {
     available: { label: 'Available', className: 'bg-success/20 text-success' },
     dispatched: { label: 'Dispatched', className: 'bg-primary/20 text-primary' },
     offline: { label: 'Offline', className: 'bg-muted text-muted-foreground' },
     maintenance: { label: 'Maintenance', className: 'bg-destructive/20 text-destructive' },
   };
 
   return (
     <div className="space-y-5 animate-fade-in">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-xl font-semibold text-foreground">Tow Units</h1>
           <p className="text-sm text-muted-foreground">Manage your fleet</p>
         </div>
         {(role === 'admin' || role === 'owner') && (
           <Button onClick={() => setShowAddForm(true)}>
             <Plus className="w-4 h-4" />
             Add Unit
           </Button>
         )}
       </div>
 
       {/* Information Notice */}
       <div className="bg-secondary/50 border border-border rounded-xl p-4">
         <p className="text-sm text-muted-foreground">
           <strong className="text-foreground">Note for Employees:</strong> If you have purchased a tow vehicle from a dealership, you must notify an admin or owner. Once given permission, you can add the necessary information to this section, including the license plate, owner name, and payment status (loan or fully paid).
         </p>
       </div>
 
       {/* Add Form Modal */}
       {showAddForm && (
         <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold text-foreground">Add New Unit</h2>
               <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <form onSubmit={handleAddUnit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 sm:col-span-1">
                   <label className="block text-sm font-medium text-foreground mb-1.5">Unit Name *</label>
                   <Input
                     placeholder="e.g., Unit 101"
                     value={newUnit.name}
                     onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                   />
                 </div>
                 <div className="col-span-2 sm:col-span-1">
                   <label className="block text-sm font-medium text-foreground mb-1.5">Operator *</label>
                   <Input
                     placeholder="Operator name"
                     value={newUnit.operator}
                     onChange={(e) => setNewUnit({ ...newUnit, operator: e.target.value })}
                   />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                   <Input
                     placeholder="(555) 123-4567"
                     value={newUnit.phone}
                     onChange={(e) => setNewUnit({ ...newUnit, phone: e.target.value })}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-foreground mb-1.5">License Plate *</label>
                   <Input
                     placeholder="TOW-101"
                     value={newUnit.licensePlate}
                     onChange={(e) => setNewUnit({ ...newUnit, licensePlate: e.target.value })}
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Type</label>
                 <select
                   value={newUnit.vehicleType}
                   onChange={(e) => setNewUnit({ ...newUnit, vehicleType: e.target.value })}
                   className="w-full h-11 px-4 rounded-lg border border-border bg-input text-foreground text-sm"
                 >
                   <option value="flatbed">Flatbed</option>
                   <option value="wheel-lift">Wheel-Lift</option>
                   <option value="heavy-duty">Heavy-Duty</option>
                   <option value="integrated">Integrated</option>
                 </select>
               </div>
 
               {/* Payment Section */}
               <div className="border-t border-border pt-4 mt-4">
                 <div className="flex items-center gap-3 mb-4">
                   <CreditCard className="w-5 h-5 text-primary" />
                   <h3 className="font-medium text-foreground">Payment Details</h3>
                 </div>
 
                 <div className="flex items-center gap-3 mb-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input
                       type="checkbox"
                       checked={newUnit.isOnLoan}
                       onChange={(e) => setNewUnit({ ...newUnit, isOnLoan: e.target.checked })}
                       className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                     />
                     <span className="text-sm text-foreground">Vehicle is on loan</span>
                   </label>
                 </div>
 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-foreground mb-1.5">
                       <DollarSign className="w-3 h-3 inline" /> Vehicle Cost
                     </label>
                     <Input
                       type="number"
                       placeholder="50000"
                       value={newUnit.vehicleCost}
                       onChange={(e) => setNewUnit({ ...newUnit, vehicleCost: e.target.value })}
                     />
                   </div>
                   {newUnit.isOnLoan && (
                     <>
                       <div>
                         <label className="block text-sm font-medium text-foreground mb-1.5">
                           Down Payment
                         </label>
                         <Input
                           type="number"
                           placeholder="10000"
                           value={newUnit.downPayment}
                           onChange={(e) => setNewUnit({ ...newUnit, downPayment: e.target.value })}
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-foreground mb-1.5">
                           Weekly Payment
                         </label>
                         <Input
                           type="number"
                           placeholder="500"
                           value={newUnit.weeklyPayment}
                           onChange={(e) => setNewUnit({ ...newUnit, weeklyPayment: e.target.value })}
                         />
                       </div>
                     </>
                   )}
                 </div>
               </div>
 
               <div className="flex gap-3 pt-2">
                 <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                   Cancel
                 </Button>
                 <Button type="submit" className="flex-1">Add Unit</Button>
               </div>
             </form>
           </div>
         </div>
       )}
 
       {/* Search */}
       <div className="bg-card border border-border rounded-xl p-4">
         <div className="relative max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search units..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-9 h-9"
           />
         </div>
       </div>
 
       {/* Units List */}
       {filteredUnits.length === 0 ? (
         <div className="bg-card border border-border rounded-xl p-12 text-center">
           <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
           <p className="text-muted-foreground mb-3">
             {towUnits.length === 0 ? 'No units added yet' : 'No units match your search'}
           </p>
           {towUnits.length === 0 && user?.role === 'admin' && (
             <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
               <Plus className="w-4 h-4" />
               Add First Unit
             </Button>
           )}
         </div>
       ) : (
         <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
           {filteredUnits.map((unit) => (
             <div key={unit.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
               <div className="flex items-start justify-between mb-3">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                     <Truck className="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div>
                     <h3 className="font-medium text-foreground">{unit.name}</h3>
                     <p className="text-xs text-muted-foreground">{unit.licensePlate} • {unit.vehicleType}</p>
                   </div>
                 </div>
                 {(role === 'admin' || role === 'owner') && (
                   <button
                     onClick={() => handleDelete(unit.id)}
                     className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
               </div>
 
               <div className="space-y-1 text-sm text-muted-foreground mb-3">
                 <p>Operator: {unit.operator}</p>
                 {unit.phone && <p>Phone: {unit.phone}</p>}
               </div>
 
               <select
                 value={unit.status}
                 onChange={(e) => handleStatusChange(unit.id, e.target.value as TowUnit['status'])}
                 className={`w-full h-8 px-3 rounded border border-border text-xs font-medium ${statusConfig[unit.status].className}`}
                 disabled={role !== 'admin' && role !== 'owner'}
               >
                 <option value="available">Available</option>
                 <option value="dispatched">Dispatched</option>
                 <option value="maintenance">Maintenance</option>
                 <option value="offline">Offline</option>
               </select>
             </div>
           ))}
         </div>
       )}
     </div>
   );
 };
 
 export default TowUnits;