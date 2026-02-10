
import React from 'react';
import { APP_NAME, ICONS } from '../constants';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <ICONS.Bot />
        </div>
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          {APP_NAME}
        </span>
      </div>
      <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
        <a href="#" className="hover:text-white transition-colors">Documentation</a>
        <a href="#" className="hover:text-white transition-colors">API Keys</a>
        <a href="#" className="hover:text-white transition-colors">Community</a>
      </div>
    </nav>
  );
};
