
import React, { useState, useEffect, useCallback } from 'react';
import { UserState, Rarity, ElementType, Card, Expedition, XPItem, CardTag, Equipment } from './types';
import { 
  PRESET_CARDS, PRESET_EQUIPMENT, BANNERS, THEMES, 
  INITIAL_GEMS, INITIAL_COINS, GACHA_COST_SINGLE, GACHA_COST_TEN, XP_PER_LEVEL, COIN_COST_PER_XP, XP_ITEMS_MAP, XP_SHOP_PRICES
} from './constants';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import HomeView from './views/HomeView';
import GachaView from './views/GachaView';
import CollectionView from './views/CollectionView';
import StudyView from './views/StudyView';
import ChatView from './views/ChatView';
import DevView from './views/DevView';

const ThemeEffectOverlay: React.FC<{ effect?: string }> = ({ effect }) => {
  if (!effect || effect === 'none') return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {effect === 'rain' && Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="rain-drop" style={{ left: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random() * 0.5}s`, animationDelay: `${Math.random() * 2}s` }} />
      ))}
      {effect === 'fog' && Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="fog-cloud" style={{ left: `${Math.random() * 100 - 20}%`, top: `${Math.random() * 100 - 20}%`, width: `${300 + Math.random() * 500}px`, height: `${200 + Math.random() * 400}px`, animationDelay: `${Math.random() * 10}s` }} />
      ))}
      {effect === 'sparkle' && Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${2 + Math.random() * 3}s`, animationDelay: `${Math.random() * 5}s` }} />
      ))}
    </div>
  );
};

// ONE SINGLE KEY FOR EVERYTHING
const GLOBAL_SAVE_KEY = 'bst_unified_save_v1';
const ADMIN_EMAIL = 'annahlillyc@gmail.com';

const App: React.FC = () => {
  const createInitialState = (email: string | null = null): UserState => {
    const initialInstanceId = `inst_${Date.now()}_init`;
    const initialCard = { ...PRESET_CARDS.find(c => c.id === 'c_ur_dazai') || PRESET_CARDS[0] };
    return {
      coins: INITIAL_COINS,
      gems: INITIAL_GEMS,
      pageFragments: 0,
      notebookPages: 0,
      battleItems: {},
      inventory: [initialInstanceId],
      cardInstances: { [initialInstanceId]: initialCard },
      equipmentInstances: {},
      masterCards: [...PRESET_CARDS],
      masterEquipment: [...PRESET_EQUIPMENT],
      masterBanners: [...BANNERS],
      xpItems: { 'xp_n': 10, 'xp_r': 2 },
      teams: [[initialInstanceId]],
      currentTeamIndex: 0,
      pityCount: {},
      studySets: [],
      folders: [],
      studyHistory: {},
      unlockedBuffs: [],
      srsData: {},
      userEmail: email,
      isDev: email?.toLowerCase() === ADMIN_EMAIL,
      activeExpeditions: [],
      furniture: [],
      achievements: [],
      bookRules: [],
      leaderboards: {}
    };
  };

  const syncStateWithPresets = (state: UserState): UserState => {
    // 1. Ensure master lists exist and merge updates
    if (!state.masterCards) state.masterCards = [...PRESET_CARDS];
    if (!state.masterEquipment) state.masterEquipment = [...PRESET_EQUIPMENT];
    if (!state.masterBanners) state.masterBanners = [...BANNERS];

    const customCards = state.masterCards.filter(c => !PRESET_CARDS.some(p => p.id === c.id));
    state.masterCards = [...PRESET_CARDS, ...customCards];

    // 2. Propagation: Sync Art from Master to Instances
    const newInstances = { ...state.cardInstances };
    Object.keys(newInstances).forEach(instId => {
      const inst = newInstances[instId];
      const master = state.masterCards.find(m => m.id === inst.id);
      if (master) {
        newInstances[instId] = { ...inst, image: master.image, name: master.name, title: master.title };
      }
    });
    state.cardInstances = newInstances;

    // 3. Re-verify Dev status
    state.isDev = state.userEmail?.toLowerCase() === ADMIN_EMAIL;

    return state;
  };

  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem(GLOBAL_SAVE_KEY);
    if (saved) {
      try {
        return syncStateWithPresets(JSON.parse(saved));
      } catch (e) {
        return createInitialState(null);
      }
    }
    return createInitialState(null);
  });

  const [activeView, setActiveView] = useState<'home' | 'gacha' | 'collection' | 'study' | 'chat' | 'dev'>('home');
  const [activeTheme, setActiveTheme] = useState(THEMES.ADA);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_SAVE_KEY, JSON.stringify(user));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("Save Warning: Too many custom photos! Try deleting some custom card art in the Dev terminal.");
      }
    }
  }, [user]);

  const onUpdateCoins = (amount: number) => setUser(p => ({ ...p, coins: p.coins + amount }));
  const onUpdateGems = (amount: number) => setUser(p => ({ ...p, gems: p.gems + amount }));

  const handleLogin = (email: string) => {
    setUser(prev => ({
      ...prev,
      userEmail: email,
      isDev: email.toLowerCase() === ADMIN_EMAIL
    }));
    alert(`Agency identification confirmed: ${email}`);
  };

  const handleLogout = () => {
    setUser(prev => ({
      ...prev,
      userEmail: null,
      isDev: false
    }));
    alert("Logged out. Progress remains archived in local storage.");
  };

  const updateStudyPoints = (points: number) => {
    const date = new Date().toISOString().split('T')[0];
    setUser(prev => {
      const history = { ...prev.studyHistory };
      const val = history[date] || 0;
      history[date] = val + points;
      return { ...prev, studyHistory: history };
    });
  };

  const handleLevelUp = (instanceId: string, itemId: string) => {
    setUser(prev => {
      const card = prev.cardInstances[instanceId];
      const itemCount = prev.xpItems[itemId] || 0;
      if (!card || itemCount <= 0) return prev;
      const xpItem = XP_ITEMS_MAP[itemId]; 
      const xpToAdd = xpItem.xpValue;
      const coinCost = xpToAdd * COIN_COST_PER_XP;
      if (prev.coins < coinCost) return prev;
      const updatedCard = { ...card };
      updatedCard.xp += xpToAdd;
      while (updatedCard.xp >= XP_PER_LEVEL && updatedCard.level < updatedCard.maxLevel) {
        updatedCard.xp -= XP_PER_LEVEL;
        updatedCard.level += 1;
        updatedCard.hp += 100;
        updatedCard.atk += 40;
      }
      return { 
        ...prev, 
        coins: prev.coins - coinCost, 
        xpItems: { ...prev.xpItems, [itemId]: itemCount - 1 }, 
        cardInstances: { ...prev.cardInstances, [instanceId]: updatedCard } 
      };
    });
  };

  const handleLimitBreak = (targetInstId: string, fodderInstId: string) => {
    setUser(prev => {
      const target = prev.cardInstances[targetInstId];
      const fodder = prev.cardInstances[fodderInstId];
      if (!target || !fodder || target.id !== fodder.id || targetInstId === fodderInstId) return prev;
      const updatedTarget = { ...target };
      updatedTarget.limitBreak = Math.min(5, updatedTarget.limitBreak + 1);
      updatedTarget.maxLevel += 10;
      const newInventory = prev.inventory.filter(id => id !== fodderInstId);
      const newInstances = { ...prev.cardInstances };
      delete newInstances[fodderInstId];
      newInstances[targetInstId] = updatedTarget;
      return { ...prev, inventory: newInventory, cardInstances: newInstances };
    });
  };

  const handlePull = (bannerId: string, isTen: boolean) => {
    const banner = user.masterBanners.find(b => b.id === bannerId);
    if (!banner) return;
    const cost = isTen ? banner.cost * 10 : banner.cost;
    if (user.gems < cost) return;

    const count = isTen ? 10 : 1;
    const pulledItems: (Card | Equipment)[] = [];
    const newInventoryIds: string[] = [];
    const newCardInstances: Record<string, Card> = {};
    const newEquipmentInstances: Record<string, Equipment> = {};
    const timestamp = Date.now();

    for (let i = 0; i < count; i++) {
      let rarity = Rarity.R;
      const rand = Math.random() * 100;
      if (rand < 2) rarity = Rarity.UR;
      else if (rand < 7) rarity = Rarity.SSR;
      else if (rand < 25) rarity = Rarity.SR;

      if (banner.type === 'equipment' || (banner.type === 'standard' && Math.random() < 0.2)) {
        const pool = user.masterEquipment.filter(e => e.rarity === rarity || (rarity === Rarity.UR && e.rarity === Rarity.SSR));
        const item = pool[Math.floor(Math.random() * pool.length)] || user.masterEquipment[0];
        const instId = `eq_inst_${timestamp}_${i}`;
        newEquipmentInstances[instId] = { ...item };
        pulledItems.push({ ...item, id: instId } as any);
      } else {
        const pool = user.masterCards.filter(c => c.rarity === rarity);
        const card = pool[Math.floor(Math.random() * pool.length)] || user.masterCards[0];
        const instanceId = `inst_${timestamp}_${i}`;
        const instance = { ...card, level: 1, xp: 0 };
        newCardInstances[instanceId] = instance;
        newInventoryIds.push(instanceId);
        pulledItems.push({ ...instance, id: instanceId } as any);
      }
    }

    setUser(prev => ({ 
      ...prev, 
      gems: prev.gems - cost, 
      inventory: [...prev.inventory, ...newInventoryIds], 
      cardInstances: { ...prev.cardInstances, ...newCardInstances }, 
      equipmentInstances: { ...prev.equipmentInstances, ...newEquipmentInstances }
    }));
    return pulledItems;
  };

  const handleEquip = (cardInstId: string, eqInstId: string | null) => {
    setUser(prev => {
      const card = prev.cardInstances[cardInstId];
      if (!card) return prev;
      return { ...prev, cardInstances: { ...prev.cardInstances, [cardInstId]: { ...card, equippedEquipmentId: eqInstId || undefined } } };
    });
  };

  return (
    <div className={`flex flex-col md:flex-row h-[100dvh] w-full ${activeTheme.bg} transition-all duration-700 overflow-hidden relative`}>
      <ThemeEffectOverlay effect={activeTheme.effect} />
      <Sidebar activeView={activeView} setActiveView={setActiveView} isDev={user.isDev} />
      <main className="flex-1 flex flex-col relative overflow-hidden pb-safe z-10">
        <Header coins={user.coins} gems={user.gems} email={user.userEmail} onLogin={handleLogin} onLogout={handleLogout} onThemeChange={setActiveTheme} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
          {activeView === 'home' && <HomeView user={user} setUser={setUser} onUpdateCoins={onUpdateCoins} onUpdateGems={onUpdateGems} updateStudyPoints={updateStudyPoints} onBuyXpItem={(id) => onUpdateCoins(-XP_SHOP_PRICES[id])} />}
          {activeView === 'gacha' && <GachaView user={user} onPull={handlePull} />}
          {activeView === 'collection' && <CollectionView user={user} setUser={setUser} onLevelUp={handleLevelUp} onLimitBreak={handleLimitBreak} onEquip={handleEquip} />}
          {activeView === 'study' && <StudyView user={user} setUser={setUser} onUpdateCoins={onUpdateCoins} onUpdateGems={onUpdateGems} updateStudyPoints={updateStudyPoints} />}
          {activeView === 'chat' && <ChatView user={user} />}
          {activeView === 'dev' && <DevView user={user} setUser={setUser} />}
        </div>
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;
