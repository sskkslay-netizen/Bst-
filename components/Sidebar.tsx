
import React from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
  isDev: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isDev }) => {
  const menuItems = [
    { id: 'home', label: 'Agency Hub', icon: '🏠' },
    { id: 'study', label: 'Deduction Training', icon: '📚' },
    { id: 'gacha', label: 'Recruitment', icon: '🎫' },
    { id: 'collection', label: 'Agency Files', icon: '🗂️' },
    { id: 'chat', label: 'Character Comm', icon: '💬' },
  ];

  if (isDev) {
    menuItems.push({ id: 'dev', label: 'Dev Command', icon: '🛠️' });
  }

  return (
    <nav className="hidden md:flex w-64 bg-white/80 backdrop-blur-md border-r border-blue-100 flex-col h-full shadow-xl z-50">
      <div className="p-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">🔍</div>
        <h1 className="font-bebas text-2xl tracking-tighter text-blue-900">Bungou Study</h1>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg translate-x-2' 
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-xs opacity-80 uppercase font-bold mb-1">Weekly Event</p>
          <p className="font-bold text-sm">Dead Apple Raid</p>
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-2/3"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
