import { Search, Bell, Moon, User } from 'lucide-react';

export const TopNav = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-border rounded-xl text-sm placeholder-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
            placeholder="Search projects, claims, or sources... (⌘K)"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-surface transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-surface transition-colors">
          <Moon size={20} />
        </button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <button className="flex items-center gap-2 pl-2 p-1 rounded-xl hover:bg-surface transition-colors border border-transparent hover:border-border">
          <div className="w-8 h-8 rounded-lg bg-surfaceHover flex items-center justify-center">
            <User size={16} className="text-gray-300" />
          </div>
        </button>
      </div>
    </header>
  );
};
