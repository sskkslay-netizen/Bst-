
import React from 'react';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'home', label: 'Hub', icon: '🏠' },
    { id: 'study', label: 'Study', icon: '📚' },
    { id: 'gacha', label: 'Scout', icon: '🎫' },
    { id: 'collection', label: 'Files', icon: '🗂️' },
    { id: 'chat', label: 'Chat', icon: '💬' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 flex justify-around items-center h-16 px-2 pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id)}
          className={`flex flex-col items-center justify-center w-full h-full transition-all ${
            activeView === item.id ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase mt-1">{item.label}</span>
          {activeView === item.id && (
            <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
