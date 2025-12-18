
import React, { useState, useEffect } from 'react';
import { UserState, Rarity, Card, Synergy, XPItem, Equipment } from '../types';
import CardDisplay from '../components/CardDisplay';
import { SYNERGIES, XP_ITEMS, XP_PER_LEVEL, COIN_COST_PER_XP } from '../constants';

interface CollectionViewProps {
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  onLevelUp?: (instId: string, itemId: string) => void;
  onLimitBreak?: (targetId: string, fodderId: string) => void;
  onEquip?: (cardId: string, eqId: string | null) => void;
}

const CollectionView: React.FC<CollectionViewProps> = ({ user, setUser, onLevelUp, onLimitBreak, onEquip }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'team' | 'equipment'>('collection');
  const [filterRarity, setFilterRarity] = useState<string>('ALL');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [activeSynergies, setActiveSynergies] = useState<Synergy[]>([]);
  const [isLiningUpFodder, setIsLiningUpFodder] = useState(false);
  const [isEquippingMode, setIsEquippingMode] = useState(false);

  const inventoryCards = user.inventory
    .map(id => ({ instId: id, data: user.cardInstances[id] }))
    .filter(item => !!item.data);

  const filteredCards = inventoryCards.filter(c => filterRarity === 'ALL' || c.data.rarity === filterRarity);
  const currentTeamIds = user.teams[user.currentTeamIndex] || [];

  const equipmentInstances = Object.entries(user.equipmentInstances).map(([id, data]) => ({ 
    instId: id, 
    data: data as Equipment 
  }));

  useEffect(() => {
    const teamNames = currentTeamIds.map(id => user.cardInstances[id]?.name).filter(Boolean);
    const active = SYNERGIES.filter(syn => 
      syn.requiredNames.every(name => teamNames.includes(name))
    );
    setActiveSynergies(active);
  }, [currentTeamIds, user.cardInstances]);

  const handleToggleTeam = (instId: string) => {
    const isSelected = currentTeamIds.includes(instId);
    let newTeam = [...currentTeamIds];
    
    if (isSelected) {
      newTeam = newTeam.filter(id => id !== instId);
    } else {
      if (newTeam.length >= 3) return alert("Team is full (3/3)!");
      newTeam.push(instId);
    }

    setUser(prev => {
      const newTeams = [...prev.teams];
      newTeams[prev.currentTeamIndex] = newTeam;
      return { ...prev, teams: newTeams };
    });
  };

  const handleCardClick = (instId: string) => {
    if (isLiningUpFodder) {
      if (onLimitBreak && selectedInstanceId) {
        onLimitBreak(selectedInstanceId, instId);
        setIsLiningUpFodder(false);
      }
    } else {
      setSelectedInstanceId(instId);
    }
  };

  const selectedCard = selectedInstanceId ? user.cardInstances[selectedInstanceId] : null;
  const equippedItem = selectedCard?.equippedEquipmentId ? user.equipmentInstances[selectedCard.equippedEquipmentId] : null;

  const getElementAdvantage = (attacker: ElementType, defender: ElementType) => {
    return ELEMENT_TRIANGLE[attacker] === defender;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8">
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bebas text-blue-900">Agency Files</h2>
            <div className="flex gap-2">
              <button onClick={() => {setActiveTab('collection'); setIsEquippingMode(false);}} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 'collection' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>GALLERY</button>
              <button onClick={() => {setActiveTab('team'); setIsEquippingMode(false);}} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 'team' ? 'bg-blue-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>DEPLOYMENT</button>
              <button onClick={() => {setActiveTab('equipment'); setIsEquippingMode(false);}} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 'equipment' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>EQUIPMENT</button>
            </div>
          </div>
          {activeTab !== 'equipment' && (
            <div className="flex gap-1">
              {['ALL', 'UR', 'SSR', 'SR', 'R'].map(r => (
                <button key={r} onClick={() => setFilterRarity(r)} className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${filterRarity === r ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'}`}>{r}</button>
              ))}
            </div>
          )}
        </div>

        {/* Element Triangle Display */}
        {activeTab === 'team' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 border border-blue-100 shadow-lg">
            <h3 className="font-bebas text-xl text-blue-900 mb-4">Elemental Advantage System</h3>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2 element-advantage">LOGIC</div>
                <span className="text-xs text-blue-600">→ Emotion</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold mb-2 element-advantage">EMOTION</div>
                <span className="text-xs text-rose-600">→ Strength</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mb-2 element-advantage">STRENGTH</div>
                <span className="text-xs text-emerald-600">→ Logic</span>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4 italic">Strategic deployment based on elemental weaknesses grants combat advantages</p>
          </div>
        )}

        {/* Team Synergy Display */}
        {activeTab === 'team' && activeSynergies.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] p-6 border border-amber-200 shadow-lg">
            <h3 className="font-bebas text-xl text-amber-900 mb-4">Active Synergies</h3>
            <div className="space-y-3">
              {activeSynergies.map(syn => (
                <div key={syn.id} className="flex items-center justify-between bg-white/60 p-4 rounded-xl border border-amber-100">
                  <div>
                    <p className="font-bold text-amber-900">{syn.name}</p>
                    <p className="text-xs text-amber-700">{syn.effectDescription}</p>
                  </div>
                  <div className="text-2xl animate-pulse">⚡</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'equipment' ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pr-2 custom-scrollbar">
            {equipmentInstances.length > 0 ? equipmentInstances.map(({ instId, data }) => (
              <div 
                key={instId} 
                onClick={() => isEquippingMode && onEquip && selectedCard && (onEquip(selectedInstanceId!, instId), setIsEquippingMode(false))}
                className={`bg-white rounded-[2rem] p-6 border-4 shadow-xl transition-all cursor-pointer relative group flex flex-col ${isEquippingMode ? 'border-indigo-400 animate-pulse hover:scale-105' : 'border-white hover:border-indigo-100'}`}
              >
                 <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-4 border border-slate-50 shadow-inner">
                    <img src={data.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 </div>
                 <div className="text-center flex-1">
                    <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">{data.rarity}</p>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">{data.name}</h4>
                    <p className="text-[10px] text-slate-400 italic leading-snug mb-4">{data.description}</p>
                 </div>
                 <div className="flex gap-1 justify-center mt-auto">
                    {data.hpBoost && <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black rounded uppercase">HP +{Math.round(data.hpBoost * 100)}%</span>}
                    {data.atkBoost && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded uppercase">ATK +{Math.round(data.atkBoost * 100)}%</span>}
                 </div>
                 {isEquippingMode && <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg animate-bounce">CHOOSE</div>}
              </div>
            )) : (
              <div className="col-span-full py-20 text-center space-y-6">
                 <span className="text-8xl opacity-10">🎒</span>
                 <p className="font-bebas text-3xl text-slate-300">No Intellectual Assets Found</p>
                 <p className="text-xs text-slate-400 max-w-xs mx-auto">Head to Recruitment and manifest tactical gear to boost your agents' performance.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 pr-2 custom-scrollbar">
            {filteredCards.map(({ instId, data }) => (
              <div key={instId} className="relative">
                 <CardDisplay 
                   card={data} 
                   selected={activeTab === 'collection' ? selectedInstanceId === instId : currentTeamIds.includes(instId)} 
                   onClick={() => activeTab === 'collection' ? handleCardClick(instId) : handleToggleTeam(instId)} 
                 />
                 {data.equippedEquipmentId && (
                   <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg z-20 animate-pulse">GEARED</div>
                 )}
                 {data.isFavorite && (
                   <div className="absolute top-4 right-4 text-yellow-400 text-xl drop-shadow-lg z-20 animate-pulse">★</div>
                 )}
                 {activeTab === 'team' && currentTeamIds.includes(instId) && (
                   <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg z-20">
                     TEAM {currentTeamIds.indexOf(instId) + 1}
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-96 bg-white/90 backdrop-blur-md rounded-[3rem] p-8 border border-blue-100 shadow-2xl flex flex-col overflow-hidden">
         {selectedCard ? (
           <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">{selectedCard.name}</h3>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{selectedCard.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setUser(prev => ({
                      ...prev,
                      cardInstances: {
                        ...prev.cardInstances,
                        [selectedInstanceId!]: { ...selectedCard, isFavorite: !selectedCard.isFavorite }
                      }
                    }))}
                    className={`text-xl transition-all ${selectedCard.isFavorite ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}
                  >
                    ★
                  </button>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black">LV. {selectedCard.level}</span>
                </div>
              </div>

              {/* Skill Display */}
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Ability</p>
                <h4 className="font-bold text-slate-800 mb-2">{selectedCard.skill.name}</h4>
                <p className="text-xs text-slate-600 mb-3">{selectedCard.skill.description}</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[8px] font-black rounded uppercase">{selectedCard.skill.type}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[8px] font-black rounded">
                    {selectedCard.skill.type === 'buff' ? `${selectedCard.skill.value}x` : `${selectedCard.skill.value} DMG`}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-600/5 -mr-8 -mt-8 rounded-full"></div>
                 <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-4">Tactical Asset</p>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all ${equippedItem ? 'bg-white border-indigo-200' : 'bg-slate-100 border-indigo-100'}`}>
                       {equippedItem ? <img src={equippedItem.image} className="w-full h-full object-cover rounded-xl" /> : <span className="text-2xl opacity-20">🎒</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs font-black text-indigo-900 truncate">{equippedItem?.name || 'Empty Slot'}</p>
                       <p className="text-[10px] text-indigo-400 italic truncate">{equippedItem ? equippedItem.description : 'Awaiting gear manifestation'}</p>
                    </div>
                 </div>
                 <div className="flex gap-2 mt-6">
                    {equippedItem ? (
                      <button onClick={() => onEquip && onEquip(selectedInstanceId!, null)} className="flex-1 py-2 bg-white text-rose-500 text-[10px] font-black rounded-xl border border-rose-100 shadow-sm hover:bg-rose-50 transition-all">REMOVE</button>
                    ) : (
                      <button onClick={() => {setActiveTab('equipment'); setIsEquippingMode(true);}} className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl shadow-lg hover:bg-indigo-700 transition-all">EQUIP ACCESSORY</button>
                    )}
                 </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                 <div className="flex justify-between items-end">
                    <div className="text-center flex-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Durability</p>
                      <p className="text-xl font-bebas text-emerald-600">{Math.round(selectedCard.hp * (1 + (equippedItem?.hpBoost || 0)))}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="text-center flex-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Attack</p>
                      <p className="text-xl font-bebas text-rose-600">{Math.round(selectedCard.atk * (1 + (equippedItem?.atkBoost || 0)))}</p>
                    </div>
                 </div>
                 <div className="pt-2">
                    <div className="flex justify-between text-[8px] font-black text-blue-400 uppercase mb-2">
                      <span>Ability Mastery</span>
                      <span>{selectedCard.xp} / {XP_PER_LEVEL}</span>
                    </div>
                    <div className="h-2 bg-white rounded-full border border-slate-100 overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${(selectedCard.xp / XP_PER_LEVEL) * 100}%` }}></div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Training Assets</p>
                 <div className="grid grid-cols-2 gap-2">
                    {XP_ITEMS.map(item => (
                      <button 
                        key={item.id}
                        disabled={(user.xpItems[item.id] || 0) <= 0}
                        onClick={() => onLevelUp && onLevelUp(selectedInstanceId!, item.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                          (user.xpItems[item.id] || 0) > 0 ? 'bg-white border-blue-50 hover:border-blue-500 hover:shadow-md' : 'bg-slate-50 border-transparent opacity-30'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="text-left min-w-0">
                          <p className="text-[8px] font-black truncate">{item.name}</p>
                          <p className="text-[10px] font-bebas text-blue-600">x{user.xpItems[item.id] || 0}</p>
                        </div>
                      </button>
                    ))}
                 </div>
              </div>

              <button 
                onClick={() => setIsLiningUpFodder(!isLiningUpFodder)}
                className={`w-full py-4 rounded-2xl font-black text-[10px] shadow-lg transition-all ${
                  isLiningUpFodder ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                {isLiningUpFodder ? 'CANCEL PROTOCOL' : 'LIMIT BREAK (USE DUPLICATE)'}
              </button>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <span className="text-7xl opacity-10 animate-pulse">🗂️</span>
              <h3 className="text-xl font-bebas text-blue-900 opacity-50 tracking-widest">Accessing Records...</h3>
              <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">Select an agent from the gallery to view their intellectual and tactical profile.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default CollectionView;
