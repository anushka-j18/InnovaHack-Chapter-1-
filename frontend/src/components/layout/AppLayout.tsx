import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto relative p-8">
          {/* Subtle background effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="relative z-10 h-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
