 import { useState, useEffect, useRef } from 'react';
 import { useAuth, StaffMember } from '@/contexts/AuthContext';
 import { useData } from '@/contexts/DataContext';
 import { Bell, Search, LogOut, ChevronDown, X, FileText, Clock, BarChart3 } from 'lucide-react';
 import { Input } from '@/components/ui/input';
 import { useIsMobile } from '@/hooks/use-mobile';
 
 const Header = () => {
   const { profile, role, logout, staff, clockRecords } = useAuth();
   const { reports } = useData();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [searchResults, setSearchResults] = useState<StaffMember[]>([]);
   const [showSearchResults, setShowSearchResults] = useState(false);
   const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const searchRef = useRef<HTMLDivElement>(null);
   const isMobile = useIsMobile();
   const isOwnerOrAdmin = role === 'owner' || role === 'admin';
 
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
         setIsDropdownOpen(false);
       }
       if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
         setShowSearchResults(false);
         setSelectedStaff(null);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);
 
   useEffect(() => {
     if (searchQuery.trim() && isOwnerOrAdmin) {
       const results = staff.filter(s => 
         s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.username.toLowerCase().includes(searchQuery.toLowerCase())
       );
       setSearchResults(results);
       setShowSearchResults(true);
     } else {
       setSearchResults([]);
       setShowSearchResults(false);
     }
   }, [searchQuery, staff, isOwnerOrAdmin]);
 
   const getStaffStats = (userId: string) => {
     const userReports = reports.filter(r => r.assignedTo === userId || r.createdBy === userId);
     const userClockRecords = clockRecords.filter(r => r.user_id === userId);
     const totalHours = userClockRecords.reduce((acc, r) => acc + (r.duration || 0), 0) / 60;
     const completedReports = userReports.filter(r => r.status === 'closed' || r.status === 'completed').length;
     
     return {
       totalReports: userReports.length,
       completedReports,
       totalHours,
     };
   };
 
   const handleStaffClick = (member: StaffMember) => {
     setSelectedStaff(member);
     setSearchQuery('');
     setShowSearchResults(false);
   };
 
   return (
     <header className={`h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between sticky top-0 z-40 ${isMobile ? 'px-4 pl-16' : 'px-6'}`}>
       <div className="flex-1 max-w-lg" ref={searchRef}>
         <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder={isOwnerOrAdmin ? "Search staff, reports..." : "Search reports..."}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className={`pl-11 bg-secondary/50 border-border rounded-xl ${isMobile ? 'h-10' : 'h-11'}`}
           />
           
           {showSearchResults && searchResults.length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
               <div className="p-2 border-b border-border">
                 <p className="text-xs text-muted-foreground font-medium px-2">Staff Members</p>
               </div>
               <div className="max-h-64 overflow-y-auto">
                 {searchResults.map((member) => (
                   <button
                     key={member.user_id}
                     onClick={() => handleStaffClick(member)}
                     className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                   >
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                       <span className="text-primary font-semibold">{member.name.charAt(0)}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-foreground truncate">{member.name}</p>
                       <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                     </div>
                     {member.clockedIn && (
                       <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">Online</span>
                     )}
                   </button>
                 ))}
               </div>
             </div>
           )}
 
           {selectedStaff && (
             <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-card border border-border rounded-2xl w-full max-w-md animate-fade-in">
                 <div className="p-6 border-b border-border flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                       <span className="text-primary font-bold text-xl">{selectedStaff.name.charAt(0)}</span>
                     </div>
                     <div>
                       <h2 className="text-lg font-bold text-foreground">{selectedStaff.name}</h2>
                       <p className="text-sm text-muted-foreground capitalize">{selectedStaff.role}</p>
                     </div>
                   </div>
                   <button
                     onClick={() => setSelectedStaff(null)}
                     className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 </div>
                 
                 <div className="p-6">
                   <div className="flex items-center gap-2 mb-4">
                     {selectedStaff.clockedIn ? (
                       <span className="px-3 py-1 rounded-full text-sm bg-success/20 text-success font-medium">On Duty</span>
                     ) : (
                       <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground font-medium">Off Duty</span>
                     )}
                   </div>
 
                   {(() => {
                     const stats = getStaffStats(selectedStaff.user_id);
                     return (
                       <div className="grid grid-cols-3 gap-4">
                         <div className="bg-secondary/50 rounded-xl p-4 text-center">
                           <FileText className="w-5 h-5 text-primary mx-auto mb-2" />
                           <p className="text-2xl font-bold text-foreground">{stats.totalReports}</p>
                           <p className="text-xs text-muted-foreground">Reports</p>
                         </div>
                         <div className="bg-secondary/50 rounded-xl p-4 text-center">
                           <BarChart3 className="w-5 h-5 text-success mx-auto mb-2" />
                           <p className="text-2xl font-bold text-foreground">{stats.completedReports}</p>
                           <p className="text-xs text-muted-foreground">Completed</p>
                         </div>
                         <div className="bg-secondary/50 rounded-xl p-4 text-center">
                           <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                           <p className="text-2xl font-bold text-foreground">{stats.totalHours.toFixed(0)}h</p>
                           <p className="text-xs text-muted-foreground">Hours</p>
                         </div>
                       </div>
                     );
                   })()}
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
 
       <div className="flex items-center gap-3">
         <button className={`rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all relative ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}`}>
           <Bell className="w-5 h-5" />
           <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
         </button>
 
         {!isMobile && <div className="h-8 w-px bg-border" />}
 
         <div className="relative" ref={dropdownRef}>
           <button 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             className="flex items-center gap-2 hover:bg-secondary/50 rounded-xl p-1.5 transition-colors"
           >
             {!isMobile && (
               <div className="text-right">
                 <p className="text-sm font-semibold text-foreground">{profile?.name || 'User'}</p>
                 <p className="text-xs text-muted-foreground capitalize">{role || 'Staff'}</p>
               </div>
             )}
             <div className={`rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}`}>
               <span className="text-primary font-bold">{profile?.name?.charAt(0) || 'U'}</span>
             </div>
             {!isMobile && <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />}
           </button>
 
           {isDropdownOpen && (
             <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
               <div className="p-3 border-b border-border">
                 <p className="font-medium text-foreground">{profile?.name || 'User'}</p>
                 <p className="text-xs text-muted-foreground capitalize">{role}</p>
               </div>
               <div className="p-1">
                 <button
                   onClick={() => {
                     setIsDropdownOpen(false);
                     logout();
                   }}
                   className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                 >
                   <LogOut className="w-4 h-4" />
                   <span className="font-medium">Logout</span>
                 </button>
               </div>
             </div>
           )}
         </div>
       </div>
     </header>
   );
 };
 
 export default Header;