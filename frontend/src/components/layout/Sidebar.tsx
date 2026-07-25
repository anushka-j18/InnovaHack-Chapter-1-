import { useState } from 'react';
import { 
  Search, 
  History, 
  Bookmark, 
  LayoutDashboard, 
  Settings, 
  User, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: Search, label: 'New Research' },
    { icon: History, label: 'Previous Sessions' },
    { icon: Bookmark, label: 'Saved Reports' },
    { icon: LayoutDashboard, label: 'Dashboard' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings' },
    { icon: User, label: 'User Profile' },
  ];

  return (
    <div className={`relative flex flex-col h-full bg-surface border-r border-border transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 bg-surface border border-border rounded-full p-1 hover:bg-surfaceHover text-gray-400 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 p-6 h-20">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary shrink-0">
          <ShieldCheck size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            TruthSeeker
          </span>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item, index) => (
          <button 
            key={index}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              index === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-surfaceHover'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className={index === 0 ? 'text-primary' : 'group-hover:text-white'} />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="px-4 py-6 space-y-2 border-t border-border/50">
        {bottomItems.map((item, index) => (
          <button 
            key={index}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-surfaceHover transition-all duration-200"
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
