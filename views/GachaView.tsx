
import React, { useState, useEffect } from 'react';
import { UserState, Card, Rarity, Equipment } from '../types';
import CardDisplay from '../components/CardDisplay';

interface GachaViewProps {
  user: UserState;
  onPull: (bannerId: string, isTen: boolean) => (Card | Equipment)[] | undefined;
}

const GachaView: React.FC<GachaViewProps> = ({ user, onPull }) => {
  const [selectedBanner, setSelectedBanner] = useState(user.masterBanners[0]);
  const [results, setResults] = useState<(Card | Equipment)[] | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullPhase, setPullPhase] = useState<'idle' | 'gate' | 'reveal'>('idle');
  const [hasUR, setHasUR] = useState(false);

  const handlePullClick = (isTen: boolean) => {
    const cost = isTen ? selectedBanner.cost * 10 : selectedBanner.cost;
    if (user.gems < cost) return alert("Insufficient Gems for this protocol.");

    setIsPulling(true);
    setPullPhase('gate');
    
    setTimeout(() => {
      const pulledItems = onPull(selectedBanner.id, isTen);
      if (pulledItems) {
        setResults(pulledItems);
        setHasUR(pulledItems.some(item => item.rarity === Rarity.UR));
      }
      setPullPhase('reveal');
    }, 2500);
  };

  const isEquipment = (item: any): item is Equipment => {
    return 'hpBoost' in item || 'atkBoost' in item;
  };

  if (isPulling) {
    return (
      <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 ${hasUR ? 'bg-indigo-950' : 'bg-blue-900'}`}>
        {pullPhase === 'gate' && (
          <div className="text-center space-y-12 animate-fade-in">
             <div className="relative w-72 h-72 mx-auto">
                <div className={`absolute inset-0 rounded-full border-8 border-t-white animate-spin ${hasUR ? 'border-indigo-400' : 'border-blue-400'}`}></div>
                <div className="absolute inset-0 flex items-center justify-center font-bebas text-5xl text-white tracking-[0.3em] animate-pulse">MANIFESTING</div>
             </div>
             <p className="text-white/40 font-mono text-xs uppercase tracking-[0.5em] animate-bounce">Accessing The Book's Reality...</p>
          </div>
        )}

        {pullPhase === 'reveal' && results && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
             <div className="text-center mb-12 animate-fade-in">
                <h2 className={`text-6xl font-bebas tracking-tighter ${hasUR ? 'text-indigo-300 animate-pulse' : 'text-white'}`}>
                   {hasUR ? 'ULTRA RARE MANIFESTED' : 'MANIFESTATION COMPLETE'}
                </h2>
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mt-2">Intellectual and Tactical Assets Secured</p>
             </div>

             <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
                {results.map((item, i) => (
                  <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    {isEquipment(item) ? (
                      <div className="w-40 h-56 bg-white rounded-3xl p-6 border-4 border-indigo-200 shadow-2xl flex flex-col items-center text-center animate-float group">
                         <div className="w-20 h-20 bg-indigo-50 rounded-2xl mb-4 overflow-hidden border border-indigo-100">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                         </div>
                         <p className="text-[8px] font-black uppercase text-indigo-500 mb-1">{item.rarity}</p>
                         <p className="text-xs font-bold text-slate-800 leading-tight mb-2 truncate w-full">{item.name}</p>
                         <div className="mt-auto flex gap-1">
                            {item.hpBoost && <span className="bg-green-50 text-green-600 text-[6px] font-black px-1.5 py-0.5 rounded">HP+</span>}
                            {item.atkBoost && <span className="bg-red-50 text-red-600 text-[6px] font-black px-1.5 py-0.5 rounded">ATK+</span>}
                         </div>
                         <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] pointer-events-none"></div>
                      </div>
                    ) : (
                      <CardDisplay card={item as Card} compact />
                    )}
                  </div>
                ))}
             </div>

             <button 
               onClick={() => { setIsPulling(false); setResults(null); }}
               className="mt-16 px-20 py-5 bg-white text-blue-900 font-bebas text-3xl rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
             >
               ARCHIVE ASSETS
             </button>
          </div>
        )}
        
        {/* Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
           {Array.from({length: 40}).map((_, i) => (
             <div key={i} className="absolute bg-white rounded-full animate-ping" 
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 width: `${Math.random() * 8}px`,
                 height: `${Math.random() * 8}px`,
                 animationDuration: `${1 + Math.random() * 3}s`
               }} />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <div className="flex space-x-6 overflow-x-auto pb-8 no-scrollbar snap-x">
        {user.masterBanners.map(banner => (
          <button 
            key={banner.id}
            onClick={() => setSelectedBanner(banner)}
            className={`flex-shrink-0 w-80 h-44 rounded-[2.5rem] overflow-hidden border-4 transition-all snap-center relative group
              ${selectedBanner.id === banner.id ? 'border-blue-500 scale-105 shadow-2xl' : 'border-white opacity-40 hover:opacity-100 shadow-lg'}`}
          >
            <img src={banner.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={banner.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-white font-bebas text-2xl tracking-wider truncate">{banner.name}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${banner.type === 'equipment' ? 'text-indigo-400' : 'text-blue-400'}`}>{banner.type} manifest</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[4rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-blue-50 flex flex-col lg:flex-row min-h-[600px] relative">
        <div className="lg:w-2/3 h-80 lg:h-auto relative">
           <img src={selectedBanner.image} className="w-full h-full object-cover" alt="Banner" />
           <div className="absolute inset-0 bg-blue-900/5 backdrop-blur-[2px]"></div>
           <div className="absolute bottom-12 left-12 space-y-4">
              <h2 className="text-7xl font-bebas text-white drop-shadow-2xl tracking-tighter leading-none">{selectedBanner.name}</h2>
              <div className="flex gap-3">
                 <span className={`px-6 py-2 text-white rounded-full text-[10px] font-black shadow-xl border border-white/20 uppercase tracking-widest ${selectedBanner.type === 'equipment' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                   {selectedBanner.type === 'equipment' ? 'SSR GEAR FREQUENCY HIGH' : 'SSR AGENT FREQUENCY HIGH'}
                 </span>
                 <span className="px-6 py-2 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black shadow-xl uppercase tracking-widest">REALITY REWRITE</span>
              </div>
           </div>
        </div>

        <div className="lg:w-1/3 p-12 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-white to-blue-50/20">
          <div>
            <div className="flex justify-between items-end mb-10 border-b border-blue-100 pb-6">
               <span className="font-bebas text-4xl text-slate-900 tracking-wider">Scout Terminal</span>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pity Threshold</p>
                  <p className="text-3xl font-bebas text-blue-600">{user.pityCount[selectedBanner.id] || 0} / 100</p>
               </div>
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed mb-12 italic font-medium">
              {selectedBanner.type === 'equipment' 
                ? '"Strategic accessories are the difference between life and death. Manifest your gear from the Book\'s infinite archives."' 
                : '"Every scout is a tactical gamble. Secure your high-rarity agents through consistent field missions and study."'}
            </p>

            <div className="space-y-4">
              <button 
                onClick={() => handlePullClick(false)}
                className={`w-full p-6 border-2 rounded-[2rem] flex justify-between items-center transition-all group ${selectedBanner.type === 'equipment' ? 'border-indigo-100 bg-indigo-50/20 hover:border-indigo-500' : 'border-blue-100 bg-blue-50/20 hover:border-blue-500'}`}
              >
                <div className="text-left">
                   <p className={`font-bebas text-3xl ${selectedBanner.type === 'equipment' ? 'text-indigo-900' : 'text-blue-900'}`}>SINGLE SCAN</p>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">1 Manifestation</p>
                </div>
                <div className={`flex items-center gap-2 text-white px-6 py-4 rounded-2xl font-black shadow-lg group-hover:scale-110 transition-transform ${selectedBanner.type === 'equipment' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                   <span>💎</span> {selectedBanner.cost}
                </div>
              </button>

              <button 
                onClick={() => handlePullClick(true)}
                className={`w-full p-8 rounded-[2rem] flex justify-between items-center shadow-2xl transition-all group relative overflow-hidden ${selectedBanner.type === 'equipment' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <div className="absolute top-0 left-0 w-3 h-full bg-amber-400"></div>
                <div className="text-left">
                   <p className="font-bebas text-4xl text-white tracking-widest">DECA SCAN</p>
                   <p className="text-[10px] text-blue-100 font-black uppercase tracking-[0.2em]">SR+ Protocol Active</p>
                </div>
                <div className="flex items-center gap-3 bg-white text-blue-600 px-6 py-4 rounded-2xl font-black shadow-md group-hover:scale-110 transition-transform">
                   <span>💎</span> {selectedBanner.cost * 10}
                </div>
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-300 text-center mt-12 uppercase tracking-[0.4em] font-black">
            Bungou Study Interface v5.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default GachaView;
