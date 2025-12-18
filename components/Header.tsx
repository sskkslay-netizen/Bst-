
import React, { useState } from 'react';
import { THEMES } from '../constants';

interface HeaderProps {
  coins: number;
  gems: number;
  email: string | null;
  onLogin: (email: string) => void;
  onLogout: () => void;
  onThemeChange: (theme: any) => void;
}

const Header: React.FC<HeaderProps> = ({ coins, gems, email, onLogin, onLogout, onThemeChange }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInput, setLoginInput] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.trim()) {
      onLogin(loginInput.trim());
      setIsLoginModalOpen(false);
      setLoginInput('');
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white/60 backdrop-blur-md border-b border-blue-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-2 md:space-x-6">
        <div className="flex items-center space-x-1 md:space-x-2 bg-blue-50 px-2 md:px-4 py-1.5 rounded-full border border-blue-100 shadow-sm transition-all hover:scale-105">
          <span className="text-sm md:text-lg">💰</span>
          <span className="font-bold text-blue-900 text-xs md:text-base">
            {coins >= 1000000 ? (coins / 1000000).toFixed(1) + 'M' : coins.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 bg-indigo-50 px-2 md:px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm transition-all hover:scale-105">
          <span className="text-sm md:text-lg">💎</span>
          <span className="font-bold text-indigo-900 text-xs md:text-base animate-pulse-once">
            {gems.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <select 
          onChange={(e) => onThemeChange((THEMES as any)[e.target.value])}
          className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-white/50 px-2 py-1 rounded-lg border border-transparent hover:border-blue-200 outline-none cursor-pointer max-w-[80px] md:max-w-none transition-all"
        >
          <option value="ADA">Agency Hub</option>
          <option value="PM">Port Mafia</option>
          <option value="GUILD">The Guild</option>
          <option value="DEAD_APPLE">Dead Apple</option>
          <option value="DARK_ERA">Dark Era</option>
          <option value="HUNTING_DOGS">Military</option>
          <option value="DOA">Decay of Angels</option>
          <option value="CASINO">Sky Casino</option>
        </select>

        {email ? (
          <div className="group relative">
            <div className="flex items-center space-x-2 bg-white px-2 md:px-4 py-1.5 rounded-full border border-blue-100 shadow-md cursor-pointer hover:shadow-lg transition-all">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex-shrink-0 border-2 border-white"></div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 truncate max-w-[80px] md:max-w-[120px]">{email}</span>
            </div>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-blue-50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={onLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all">Sign Out / Exit</button>
            </div>
          </div>
        ) : <button onClick={() => setIsLoginModalOpen(true)} className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] md:text-sm font-bold shadow-lg">LOGIN</button>}
      </div>

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-blue-100 overflow-hidden animate-fade-in">
            <div className="bg-blue-600 p-8 text-white">
              <h2 className="text-3xl font-bebas tracking-widest">Command Center</h2>
            </div>
            <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
              <input autoFocus type="email" required placeholder="name@agency.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsLoginModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">CANCEL</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20">INITIALIZE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
