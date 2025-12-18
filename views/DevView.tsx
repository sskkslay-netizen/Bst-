
import React, { useState, useRef } from 'react';
import { UserState, Card, Rarity, ElementType, CardTag, Banner, Equipment } from '../types';
import { BANNERS, PRESET_EQUIPMENT } from '../constants';

interface DevViewProps {
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
}

const DevView: React.FC<DevViewProps> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'banners' | 'equipment' | 'system'>('cards');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  const cardFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const equipFileRef = useRef<HTMLInputElement>(null);

  const [newCard, setNewCard] = useState<Card>({
    id: `c_${Date.now()}`,
    name: '',
    title: '',
    rarity: Rarity.SSR,
    element: ElementType.LOGIC,
    image: 'https://picsum.photos/400/600',
    description: '',
    hp: 1500,
    atk: 600,
    tags: [CardTag.ADA],
    skill: { name: 'Standard Ability', description: 'Deals massive damage.', type: 'damage', value: 1000 },
    limitBreak: 0,
    level: 1,
    maxLevel: 50,
    isFavorite: false,
    xp: 0
  });

  const [newBanner, setNewBanner] = useState<Banner>({
    id: `b_${Date.now()}`,
    name: '',
    image: 'https://picsum.photos/800/400',
    type: 'standard',
    cost: 100
  });

  const [newEquipment, setNewEquipment] = useState<Equipment>({
    id: `eq_${Date.now()}`,
    name: '',
    description: '',
    rarity: Rarity.SSR,
    image: 'https://picsum.photos/200/200',
    hpBoost: 0.1,
    atkBoost: 0
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'card' | 'banner' | 'equip') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Warning: This image is very large. Large images may cause browser storage errors. Try a smaller image if saving fails.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'card') setNewCard(prev => ({ ...prev, image: base64 }));
        else if (type === 'banner') setNewBanner(prev => ({ ...prev, image: base64 }));
        else if (type === 'equip') setNewEquipment(prev => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRewriteReality = () => {
    setUser(prev => {
      let updatedMaster = [...prev.masterCards];
      const existingIdx = updatedMaster.findIndex(c => c.id === newCard.id);
      if (existingIdx >= 0) {
        updatedMaster[existingIdx] = { ...newCard };
      } else {
        const newId = `c_${Date.now()}`;
        updatedMaster.push({ ...newCard, id: newId });
      }
      return { ...prev, masterCards: updatedMaster };
    });
    alert("Reality Rewritten. Art will be synced across all card instances.");
  };

  const handleSaveBanner = () => {
    setUser(prev => {
      let updatedBanners = [...prev.masterBanners];
      const existingIdx = updatedBanners.findIndex(b => b.id === newBanner.id);
      if (existingIdx >= 0) updatedBanners[existingIdx] = { ...newBanner };
      else updatedBanners.push({ ...newBanner, id: `b_${Date.now()}` });
      return { ...prev, masterBanners: updatedBanners };
    });
    alert("Banner Manifestation Saved.");
  };

  const handleSaveEquipment = () => {
    setUser(prev => {
      let updatedMaster = [...prev.masterEquipment];
      const existingIdx = updatedMaster.findIndex(e => e.id === newEquipment.id);
      if (existingIdx >= 0) updatedMaster[existingIdx] = { ...newEquipment };
      else updatedMaster.push({ ...newEquipment, id: `eq_${Date.now()}` });
      return { ...prev, masterEquipment: updatedMaster };
    });
    alert("Gear Archive Updated.");
  };

  const grantEquipment = (eq: Equipment) => {
    const instId = `eq_inst_dev_${Date.now()}`;
    setUser(prev => ({
      ...prev,
      equipmentInstances: { ...prev.equipmentInstances, [instId]: { ...eq } }
    }));
    alert(`${eq.name} added to inventory.`);
  };

  if (!user.isDev) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-blue-50">
      <div className="text-8xl mb-6">🚫</div>
      <h2 className="text-4xl font-bebas text-blue-900 tracking-wider">Access Terminated</h2>
      <p className="text-slate-500 max-w-md mx-auto mt-4 bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        Unauthorized access detected. This terminal is reserved for Agency Command.
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-red-100 overflow-hidden min-h-[800px] flex flex-col">
        <div className="bg-red-600 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🛠️</div>
            <div>
              <h2 className="text-4xl font-bebas tracking-widest">Executive Terminal</h2>
              <p className="text-red-100 text-xs font-bold uppercase tracking-widest opacity-80">Progress & Photo Art Sync Active</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-red-100 bg-red-50/30">
          {(['cards', 'banners', 'equipment', 'system'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-5 font-bebas text-2xl tracking-widest transition-all relative ${activeTab === tab ? 'bg-white text-red-600' : 'text-slate-400 hover:text-red-500'}`}
            >
              {tab.toUpperCase()}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-red-600"></div>}
            </button>
          ))}
        </div>

        <div className="flex-1 p-8 overflow-hidden flex">
          {activeTab === 'cards' && (
            <div className="flex w-full gap-8 h-full overflow-hidden">
              <div className="w-72 flex flex-col gap-4 border-r border-slate-100 pr-6 overflow-y-auto custom-scrollbar">
                <h3 className="font-bebas text-xl text-slate-800">Card Master List</h3>
                {user.masterCards.map(c => (
                  <div key={c.id} className="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer bg-white border-slate-100 hover:border-red-100" onClick={() => {setNewCard({...c}); setEditingCardId(c.id);}}>
                    <img src={c.image} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-slate-700 truncate">{c.name}</p></div>
                  </div>
                ))}
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                <h3 className="text-3xl font-bebas text-slate-800">Card Manifestation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col items-center">
                    <img src={newCard.image} className="w-32 h-48 rounded-xl object-cover border-4 border-slate-100 shadow-md mb-4" />
                    <button onClick={() => cardFileRef.current?.click()} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase">Import Photo Art</button>
                    <input type="file" ref={cardFileRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'card')} />
                  </div>
                  <input placeholder="Name" className="p-4 bg-slate-50 rounded-xl" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} />
                  <input placeholder="Title" className="p-4 bg-slate-50 rounded-xl" value={newCard.title} onChange={e => setNewCard({...newCard, title: e.target.value})} />
                </div>
                <button onClick={handleRewriteReality} className="w-full py-4 bg-red-600 text-white font-bebas text-2xl rounded-2xl shadow-xl active:scale-95 transition-all">SAVE & SYNC REALITY</button>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
             <div className="flex w-full gap-8 h-full overflow-hidden">
                <div className="w-72 flex flex-col gap-4 border-r border-slate-100 pr-6 overflow-y-auto custom-scrollbar">
                   <h3 className="font-bebas text-xl text-slate-800">Current Banners</h3>
                   {user.masterBanners.map(b => (
                     <div key={b.id} className="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer bg-white border-slate-100 hover:border-blue-100" onClick={() => {setNewBanner({...b})}}>
                       <img src={b.image} className="w-16 h-8 rounded-lg object-cover" />
                       <p className="text-[10px] font-bold text-slate-700 truncate">{b.name}</p>
                     </div>
                   ))}
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                   <h3 className="text-3xl font-bebas text-slate-800">Banner Construction</h3>
                   <div className="flex flex-col items-center">
                     <img src={newBanner.image} className="w-full h-40 rounded-3xl object-cover border-4 border-slate-100 shadow-md mb-4" />
                     <button onClick={() => bannerFileRef.current?.click()} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase">Import Photo Art</button>
                     <input type="file" ref={bannerFileRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} />
                   </div>
                   <input placeholder="Banner Name" className="w-full p-4 bg-slate-50 rounded-xl" value={newBanner.name} onChange={e => setNewBanner({...newBanner, name: e.target.value})} />
                   <button onClick={handleSaveBanner} className="w-full py-4 bg-blue-600 text-white font-bebas text-2xl rounded-2xl">SAVE BANNER PROTOCOL</button>
                </div>
             </div>
          )}

          {activeTab === 'equipment' && (
            <div className="flex w-full gap-8 h-full overflow-hidden">
              <div className="w-72 flex flex-col gap-4 border-r border-slate-100 pr-6 overflow-y-auto custom-scrollbar">
                <h3 className="font-bebas text-xl text-slate-800">Gear Archive</h3>
                {user.masterEquipment.map(e => (
                  <div key={e.id} className="p-3 rounded-2xl border flex flex-col gap-2 bg-white border-slate-100 hover:border-indigo-100 group">
                    <div className="flex items-center gap-3">
                      <img src={e.image} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-700 truncate">{e.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => grantEquipment(e)} className="flex-1 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-bold rounded hover:bg-indigo-100">ADD TO INV</button>
                      <button onClick={() => {setNewEquipment({...e})}} className="flex-1 py-1 bg-slate-50 text-slate-600 text-[8px] font-bold rounded hover:bg-slate-100">EDIT</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar text-center">
                <h3 className="text-3xl font-bebas text-slate-800">Gear Manifestation</h3>
                <div className="flex flex-col items-center">
                  <img src={newEquipment.image} className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-md mb-4" />
                  <button onClick={() => equipFileRef.current?.click()} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase">Import Photo Art</button>
                  <input type="file" ref={equipFileRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'equip')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Item Name" value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} />
                   <select className="w-full p-4 bg-slate-50 rounded-xl" value={newEquipment.rarity} onChange={e => setNewEquipment({...newEquipment, rarity: e.target.value as any})}>
                      {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                </div>
                <button onClick={handleSaveEquipment} className="w-full py-5 bg-indigo-600 text-white font-bebas text-2xl rounded-2xl shadow-xl">SAVE EQUIPMENT PROTOCOL</button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="w-full space-y-8 overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setUser(prev => ({...prev, coins: prev.coins + 100000}))} className="py-6 bg-blue-600 text-white font-bebas text-2xl rounded-2xl shadow-lg">GRANT 100K COINS</button>
                  <button onClick={() => setUser(prev => ({...prev, gems: prev.gems + 10000}))} className="py-6 bg-indigo-600 text-white font-bebas text-2xl rounded-2xl shadow-lg">GRANT 10K GEMS</button>
               </div>
               <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <h4 className="font-bebas text-xl text-slate-400 mb-2">SYSTEM RESET</h4>
                  <button onClick={() => { if(confirm("Erase all local data?")) { localStorage.clear(); window.location.reload(); } }} className="px-8 py-3 bg-red-100 text-red-600 font-bold rounded-xl text-xs">HARD RESET (NUKE STORAGE)</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevView;
