
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onLogout: () => void;
}

// Logo SVG matching the user's provided "DR" hexagon logo
const DR_LOGO = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d9488;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" fill="url(#grad)" />
  <text x="50" y="58" font-family="Georgia, serif" font-size="34" fill="white" text-anchor="middle" font-weight="bold">DR</text>
</svg>
`)}`;

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: AppTab.DASHBOARD, label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: AppTab.FACTORY, label: 'Token Factory', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { id: AppTab.MANAGER, label: 'Admin Panel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: AppTab.AIRDROP, label: 'Airdrop Tool', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { id: AppTab.SECURITY, label: 'Security', icon: 'M9 12l2 2 4-4m5.618-4.016A3.323 3.323 0 0010.605 8.9c5.19 1.127 9.531 4.767 11.233 9.695a1.127 1.127 0 01-1.008 1.488H4.17a1.127 1.127 0 01-1.008-1.488c1.702-4.928 6.043-8.568 11.233-9.695a3.323 3.323 0 00-4.013-4.016 11.952 11.952 0 00-4.013 4.016z' },
  ];

  return (
    <nav className="w-80 bg-slate-950 border-r border-slate-900 flex flex-col p-6 sticky top-0 h-screen">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={DR_LOGO} className="w-full h-full object-contain" alt="Logo" />
        </div>
        <h1 className="text-lg font-bold tracking-tight leading-tight">Digital Riyal<br/><span className="text-slate-500 text-sm font-normal">Treasury Network</span></h1>
      </div>

      <div className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="mt-auto flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="font-medium text-sm">Lock Wallet</span>
      </button>
    </nav>
  );
};

export default Sidebar;
