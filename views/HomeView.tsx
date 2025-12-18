
import React, { useState, useEffect } from 'react';
import { UserState } from '../types';
import Heatmap from '../components/Heatmap';
import { XP_ITEMS, XP_SHOP_PRICES } from '../constants';

interface HomeViewProps {
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  onUpdateCoins: (amount: number) => void;
  onUpdateGems: (amount: number) => void;
  updateStudyPoints: (points: number) => void;
  onBuyXpItem: (itemId: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ user, setUser, onUpdateCoins, onUpdateGems, updateStudyPoints, onBuyXpItem }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem('bst_notes_v2') || '');
  const [hasClaimedDaily, setHasClaimedDaily] = useState(() => {
    const lastClaim = localStorage.getItem('bst_last_claim');
    const today = new Date().toISOString().split('T')[0];
    return lastClaim === today;
  });
  
  const leaderId = user.teams[user.currentTeamIndex]?.[0];
  const leader = leaderId ? user.cardInstances[leaderId] : null;

  useEffect(() => {
    localStorage.setItem('bst_notes_v2', notes);
  }, [notes]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (timeLeft % 60 === 0) {
          onUpdateCoins(10); // Boosted from 5
          updateStudyPoints(1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onUpdateCoins(2000); // Boosted from 1000
      onUpdateGems(100); // Boosted from 50
      updateStudyPoints(30);
      alert("Break time! You earned 2000 coins, 100 Gems, and 30 Study Points.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onUpdateCoins, onUpdateGems, updateStudyPoints]);

  const handleSaveNotes = () => {
    if (notes.trim().length > 50) {
      onUpdateCoins(500);
      onUpdateGems(25);
      updateStudyPoints(10);
      alert("Notes archived in Agency Database. +500 Coins, +25 Gems");
    } else {
      alert("Your notes are too brief for the Agency records.");
    }
  };

  const handleDailyGrant = () => {
    if (hasClaimedDaily) return;
    onUpdateGems(500);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('bst_last_claim', today);
    setHasClaimedDaily(true);
    alert("Agency Grant Claimed! +500 Gems secured for your operations.");
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-8">
      {/* Timer Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-10 shadow-2xl border border-blue-100 flex flex-col items-center justify-center space-y-8 lg:col-span-1">
        <h2 className="text-3xl font-bebas text-blue-900 tracking-wide">Focus Terminal</h2>
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="#e0f2fe" strokeWidth="12" />
            <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="283" strokeDashoffset={283 * (1 - timeLeft / (25 * 60))} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bebas text-blue-900">{formatTime(timeLeft)}</span>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Active Study</span>
          </div>
        </div>
        <div className="flex space-x-4">
          <button onClick={toggleTimer} className="px-10 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all">{isActive ? 'PAUSE' : 'START'}</button>
          <button onClick={resetTimer} className="px-10 py-3 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-all">RESET</button>
        </div>
        <p className="text-[10px] text-slate-400 text-center px-4 leading-relaxed">
          Gems and Coins are awarded for focused study time. Payouts have been boosted!
        </p>
      </div>

      <div className="lg:col-span-1 space-y-8">
        {/* Analytics Section */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-blue-50">
           <h3 className="font-bebas text-2xl text-blue-900 mb-6">Mori's Study Analytics</h3>
           <Heatmap data={user.studyHistory} />
        </div>

        {/* Daily Reward Button */}
        <button 
          onClick={handleDailyGrant}
          disabled={hasClaimedDaily}
          className={`w-full p-8 rounded-[3rem] border-4 flex flex-col items-center gap-2 transition-all group overflow-hidden relative ${hasClaimedDaily ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-indigo-600 border-indigo-400 hover:scale-[1.02] shadow-2xl shadow-indigo-200'}`}
        >
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-8 -mt-8 rounded-full"></div>
           <span className="text-4xl">{hasClaimedDaily ? '✅' : '🎁'}</span>
           <span className="font-bebas text-3xl text-white tracking-widest">{hasClaimedDaily ? 'GRANT RECEIVED' : 'DAILY AGENCY GRANT'}</span>
           <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">{hasClaimedDaily ? 'Return Tomorrow' : 'Claim 500 Free Gems'}</span>
        </button>

        {/* Shop Section */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-amber-100 flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bebas text-2xl text-amber-900">Agency Supply Market</h3>
             <span className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-bold">SPEND COINS</span>
           </div>
           <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
             {XP_ITEMS.map(item => (
               <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
                 <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-slate-800 truncate leading-none mb-1">{item.name}</p>
                       <p className="text-[8px] text-blue-500 font-bold">+{item.xpValue} XP</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => onBuyXpItem(item.id)}
                   className="w-full py-1.5 bg-white border border-amber-200 text-amber-900 text-[10px] font-bold rounded-xl hover:bg-amber-100 transition-all flex items-center justify-center gap-1"
                 >
                   💰 {XP_SHOP_PRICES[item.id].toLocaleString()}
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-8">
        {/* Leader Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-10 shadow-2xl border border-blue-100 flex flex-col items-center relative">
           <h2 className="text-2xl font-bebas text-blue-900 mb-6 self-start">Field Commander</h2>
           <div className="flex-1 flex items-center justify-center py-4 relative group">
            {leader ? (
              <div className="relative">
                <img src={leader.image} className={`w-48 h-48 rounded-full object-cover border-8 border-blue-100 shadow-2xl transition-all ${isActive ? 'animate-bounce' : ''}`} alt="Lead" />
                {isActive && <div className="absolute -top-4 -right-4 bg-white p-2 rounded-2xl border border-blue-100 shadow-xl animate-bounce"><span className="text-2xl">📝</span></div>}
              </div>
            ) : <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No File Selected</p>}
           </div>
           <div className="text-center mt-4">
              <p className="text-sm font-bold text-blue-900">{leader ? leader.name : 'Awaiting Assignment'}</p>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Team {user.currentTeamIndex + 1} Leader</p>
           </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-blue-50 flex flex-col min-h-[300px]">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bebas text-2xl text-blue-900">Investigation Notes</h3>
             <button onClick={handleSaveNotes} className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Sync</button>
           </div>
           <textarea className="flex-1 w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 resize-none text-sm font-serif italic" placeholder="Log your findings here..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>
    </div>
  );
};

export default HomeView;
