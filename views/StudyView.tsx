
import React, { useState, useEffect, useRef } from 'react';
import { UserState, StudySet, Card, Rarity, Equipment } from '../types';
import { generateStudyQuestions, generateMatchingGame, extractStudyMaterialFromImage } from '../services/geminiService';
import { XP_ITEMS, CRAFTING_RECIPES } from '../constants';

interface StudyViewProps {
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  onUpdateCoins: (amount: number) => void;
  onUpdateGems: (amount: number) => void;
  updateStudyPoints: (points: number) => void;
}

const StudyView: React.FC<StudyViewProps> = ({ user, setUser, onUpdateCoins, onUpdateGems, updateStudyPoints }) => {
  const [activeGame, setActiveGame] = useState<'none' | 'dungeon' | 'matching'>('none');
  const [questions, setQuestions] = useState<any[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<any[]>([]);
  const [shuffledTerms, setShuffledTerms] = useState<any[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [selectedSet, setSelectedSet] = useState<StudySet | null>(null);

  const [victoryData, setVictoryData] = useState<{coins: number, gems: number, points: number, title: string} | null>(null);

  const [dungeonFloor, setDungeonFloor] = useState(1);
  const [playerCurrentHp, setPlayerCurrentHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [currentDungeonQuestionIdx, setCurrentDungeonQuestionIdx] = useState(0);
  const [damagePopup, setDamagePopup] = useState<{ val: number, isCritical: boolean } | null>(null);
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [wrongAnswerIndex, setWrongAnswerIndex] = useState<number | null>(null);

  const [inputType, setInputType] = useState<'text' | 'pdf' | 'link' | 'photo'>('text');
  const [subjectName, setSubjectName] = useState('');
  const [materialInput, setMaterialInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMatchingId, setSelectedMatchingId] = useState<{index: number, type: 'term' | 'definition'} | null>(null);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [bombTimer, setBombTimer] = useState(60);
  const [showMismatch, setShowMismatch] = useState<boolean>(false);

  const teamIds = user.teams[user.currentTeamIndex] || [];
  const teamCards = teamIds.map(id => user.cardInstances[id]).filter(Boolean);
  const leader = teamCards[0];

  useEffect(() => {
    let interval: any;
    if (activeGame === 'matching' && bombTimer > 0 && matchedIndices.length < matchingPairs.length) {
      interval = setInterval(() => setBombTimer(prev => prev - 1), 1000);
    } else if (bombTimer === 0 && activeGame === 'matching' && matchedIndices.length < matchingPairs.length) {
      alert("BOOM! The Lemon Bomb detonated! Defusal failed.");
      setActiveGame('none');
    }
    return () => clearInterval(interval);
  }, [activeGame, bombTimer, matchedIndices, matchingPairs]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArchive = async () => {
    if (!subjectName.trim()) {
      alert("Please provide a Subject Name.");
      return;
    }

    setIsInvestigating(true);

    let finalMaterial = materialInput;

    if (inputType === 'photo' && selectedImage) {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      const extractedText = await extractStudyMaterialFromImage(base64Data, mimeType);
      finalMaterial = extractedText;
    } else if (inputType === 'link') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      finalMaterial = `SOURCE: ${mediaUrl}\n\nNOTES: ${materialInput || 'Automated Scrape Complete'}`;
    }

    if (!finalMaterial.trim()) {
      alert("No material could be extracted or provided.");
      setIsInvestigating(false);
      return;
    }
    
    const newSet: StudySet = {
      id: `set_${Date.now()}`,
      name: subjectName,
      material: finalMaterial,
      items: []
    };

    setUser(prev => ({
      ...prev,
      studySets: [newSet, ...prev.studySets]
    }));

    setSubjectName('');
    setMaterialInput('');
    setMediaUrl('');
    setSelectedImage(null);
    setIsInvestigating(false);
    
    onUpdateGems(25); 
    onUpdateCoins(1000); 
    
    alert("Investigation Folder Created! The Agency has processed your visual intel.");
  };

  const startMatching = async (set: StudySet) => {
    setLoading(true);
    setSelectedSet(set);
    setActiveGame('matching');
    const pairs = await generateMatchingGame(set.material);
    const indexedPairs = pairs.map((p: any, i: number) => ({ ...p, originalIndex: i }));
    setMatchingPairs(indexedPairs);
    setShuffledTerms([...indexedPairs].sort(() => Math.random() - 0.5));
    setShuffledDefs([...indexedPairs].sort(() => Math.random() - 0.5));
    setMatchedIndices([]);
    setSelectedMatchingId(null);
    setBombTimer(60);
    setLoading(false);
  };

  const handleMatchingClick = (originalIndex: number, type: 'term' | 'definition') => {
    if (matchedIndices.includes(originalIndex)) return;
    if (!selectedMatchingId) {
      setSelectedMatchingId({ index: originalIndex, type });
    } else {
      if (selectedMatchingId.type !== type && selectedMatchingId.index === originalIndex) {
        setMatchedIndices(prev => [...prev, originalIndex]);
        onUpdateCoins(100);
        if (Math.random() < 0.25) {
          onUpdateGems(2);
        }
        setBombTimer(prev => prev + 5); 
        if (matchedIndices.length + 1 >= matchingPairs.length) {
          const bonusCoins = bombTimer * 50;
          const bonusGems = 50 + Math.floor(bombTimer / 2); 
          onUpdateCoins(bonusCoins);
          onUpdateGems(bonusGems);
          updateStudyPoints(20);
          setVictoryData({ coins: bonusCoins, gems: bonusGems, points: 20, title: "LEMON BOMB DEFUSED" });
          setActiveGame('none');
        }
      } else {
        setShowMismatch(true);
        setTimeout(() => setShowMismatch(false), 500);
        setBombTimer(prev => Math.max(0, prev - 10));
      }
      setSelectedMatchingId(null);
    }
  };

  const startDungeon = async (set: StudySet) => {
    if (!leader) {
      alert("Deploy a Field Commander in Agency Files first!");
      return;
    }
    setLoading(true);
    setSelectedSet(set);
    setActiveGame('dungeon');
    setDungeonFloor(1);
    
    const eq = leader.equippedEquipmentId ? user.equipmentInstances[leader.equippedEquipmentId] : null;
    const hpBoost = 1 + (eq?.hpBoost || 0);
    const maxHP = Math.round((leader.hp / 10) * hpBoost); 
    setPlayerMaxHp(maxHP);
    setPlayerCurrentHp(maxHP);
    
    setEnemyHp(100);
    setCurrentDungeonQuestionIdx(0);
    const qs = await generateStudyQuestions(set.material);
    setQuestions(qs);
    setLoading(false);
  };

  const handleDungeonAnswer = (idx: number) => {
    if (isQuestionLocked) return;
    const currentQuestion = questions[currentDungeonQuestionIdx];
    const correct = idx === currentQuestion.answer;
    
    if (correct) {
      const isCritical = Math.random() < 0.2;
      const eq = leader!.equippedEquipmentId ? user.equipmentInstances[leader!.equippedEquipmentId] : null;
      const atkBoost = 1 + (eq?.atkBoost || 0);
      const effectiveAtk = leader!.atk * atkBoost;
      const baseDamage = 25 + effectiveAtk / 15;
      const damage = isCritical ? Math.floor(baseDamage * 2) : Math.floor(baseDamage);
      
      setDamagePopup({ val: damage, isCritical });
      setTimeout(() => setDamagePopup(null), 1000);
      
      const nextEnemyHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextEnemyHp);
      onUpdateCoins(50);
      
      if (Math.random() < 0.3) {
        onUpdateGems(5); 
      }
      
      if (nextEnemyHp <= 0) {
        const floorGems = 10 + (dungeonFloor % 5 === 0 ? 100 : 0); 
        onUpdateGems(floorGems);
        onUpdateCoins(500 * dungeonFloor);
        updateStudyPoints(10);
        
        setDungeonFloor(prev => prev + 1);
        setEnemyHp(100 + (dungeonFloor * 20));
      }
      setCurrentDungeonQuestionIdx(prev => (prev + 1) % questions.length);
    } else {
      setIsQuestionLocked(true);
      setWrongAnswerIndex(idx);
      
      setTimeout(() => {
        let enemyDmg = 15 + (dungeonFloor * 2);
        const nextPlayerHp = Math.max(0, playerCurrentHp - enemyDmg);
        setPlayerCurrentHp(nextPlayerHp);
        
        setIsQuestionLocked(false);
        setWrongAnswerIndex(null);
        setCurrentDungeonQuestionIdx(prev => (prev + 1) % questions.length);

        if (nextPlayerHp <= 0) {
          alert(`Dungeon Expedition Failed! Commander ${leader?.name} has withdrawn.\nCorrect Answer: ${currentQuestion.options[currentQuestion.answer]}`);
          setActiveGame('none');
        }
      }, 3000);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto space-y-8 pb-24 ${showMismatch ? 'animate-shake' : ''}`}>
      {victoryData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border-4 border-amber-400">
              <div className="bg-amber-400 p-8 text-center text-amber-950">
                 <h2 className="text-4xl font-bebas tracking-widest">{victoryData.title}</h2>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Coins</p>
                       <p className="text-2xl font-bebas text-blue-600">+{victoryData.coins}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Gems</p>
                       <p className="text-2xl font-bebas text-indigo-600">+{victoryData.gems}</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Study XP</p>
                       <p className="text-2xl font-bebas text-emerald-600">+{victoryData.points}</p>
                    </div>
                 </div>
                 <button onClick={() => setVictoryData(null)} className="w-full py-5 bg-slate-900 text-white font-bebas text-2xl tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all">CLAIM REWARDS</button>
              </div>
           </div>
        </div>
      )}

      {activeGame === 'none' ? (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-blue-50">
              <h3 className="font-bebas text-3xl text-blue-900 mb-6">Investigation Logs</h3>
              <div className="space-y-3">
                <div className="px-6 py-4 rounded-2xl font-bold bg-blue-600 text-white shadow-lg flex justify-between items-center">
                  <span>📁 Case Files</span>
                  <span className="bg-white/20 px-2 rounded-lg">{user.studySets.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-blue-100 relative overflow-hidden">
               {isInvestigating && (
                 <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bebas text-2xl text-blue-900 tracking-widest animate-pulse">EXTRACTING DATA FROM PHOTOS...</p>
                 </div>
               )}

               <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                 <h2 className="text-4xl font-bebas text-blue-900">Archive Intel</h2>
                 <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar max-w-full">
                   {[
                     { id: 'text', icon: '📝', label: 'Manual' },
                     { id: 'photo', icon: '📸', label: 'Import Photo' },
                     { id: 'pdf', icon: '📄', label: 'Document' },
                     { id: 'link', icon: '🔗', label: 'Link' }
                   ].map(type => (
                     <button 
                       key={type.id} 
                       onClick={() => setInputType(type.id as any)}
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex-shrink-0 ${inputType === type.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       <span>{type.icon}</span> {type.label}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Investigation Subject</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Science Notes, Math Textbook..." 
                        className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                        value={subjectName}
                        onChange={e => setSubjectName(e.target.value)}
                      />
                    </div>

                    {inputType === 'photo' && (
                      <div className="space-y-4 animate-fade-in">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2">Study Note Photo</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-40 bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-all overflow-hidden"
                        >
                          {selectedImage ? (
                            <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <>
                              <span className="text-4xl mb-2">📷</span>
                              <span className="text-[10px] font-bold text-blue-600">CLICK TO IMPORT PHOTO</span>
                            </>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
                        {selectedImage && (
                          <button onClick={() => setSelectedImage(null)} className="text-[10px] font-bold text-rose-500 uppercase hover:underline">Remove Photo</button>
                        )}
                      </div>
                    )}

                    {inputType === 'link' && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2">Media URL</label>
                        <input 
                          type="text" 
                          placeholder="Paste URL..." 
                          className="w-full px-8 py-4 bg-blue-50 border border-blue-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-200 transition-all" 
                          value={mediaUrl}
                          onChange={e => setMediaUrl(e.target.value)}
                        />
                      </div>
                    )}
                    
                    {inputType !== 'photo' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Material Content</label>
                        <textarea 
                          placeholder="Paste your study content here..." 
                          className="w-full h-40 px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none resize-none focus:bg-white transition-all" 
                          value={materialInput}
                          onChange={e => setMaterialInput(e.target.value)}
                        />
                      </div>
                    )}
                 </div>
                 <div className="flex flex-col justify-between py-2">
                    <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 space-y-4">
                       <h4 className="font-bebas text-xl text-blue-900">IMPORT PROTOCOL</h4>
                       <ul className="text-xs text-blue-700 space-y-3 font-medium">
                          <li className="flex items-center gap-3">📸 Photos are scanned using Gemini Vision.</li>
                          <li className="flex items-center gap-3">🧠 Key terms are identified and extracted.</li>
                          <li className="flex items-center gap-3">🎮 Games are generated based on identified intel.</li>
                       </ul>
                    </div>
                    <button 
                      onClick={handleArchive} 
                      className="w-full py-6 bg-blue-600 text-white font-bebas text-3xl rounded-[2rem] hover:bg-blue-700 shadow-xl transition-all active:scale-95 group"
                    >
                      <span className="group-hover:animate-pulse">COMMENCE IMPORT</span>
                    </button>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {user.studySets.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-blue-100 text-slate-300">
                   <p className="font-bebas text-3xl">No Case Folders Archived</p>
                </div>
              ) : user.studySets.map(set => (
                <div key={set.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-blue-50 flex flex-col justify-between group hover:border-blue-400 transition-all">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 truncate">{set.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => startDungeon(set)} className="py-3 bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">DUNGEON</button>
                    <button onClick={() => startMatching(set)} className="py-3 bg-amber-500 text-white text-[10px] font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md">BOMB DEFUSAL</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeGame === 'matching' ? (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-8 h-full flex flex-col">
           <div className={`flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] shadow-xl border-4 transition-all ${bombTimer < 10 ? 'border-red-500 animate-pulse' : 'border-amber-100'}`}>
              <div>
                 <h2 className={`text-5xl font-bebas tracking-widest ${bombTimer < 10 ? 'text-red-600' : 'text-amber-900'}`}>LEMON BOMB DEFUSAL</h2>
                 <p className="text-amber-600 font-bold uppercase text-[10px] tracking-widest">Case: {selectedSet?.name}</p>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">DETONATION IN</p>
                 <p className={`text-6xl font-bebas ${bombTimer < 10 ? 'text-red-600 scale-110' : 'text-amber-600'}`}>{bombTimer}s</p>
              </div>
           </div>
           {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-amber-900 font-bebas text-4xl gap-4">
                <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                EXTRACTING KEYWORDS...
             </div>
           ) : (
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                   {shuffledTerms.map((pair, idx) => (
                      <button key={`term-${idx}`} onClick={() => handleMatchingClick(pair.originalIndex, 'term')} disabled={matchedIndices.includes(pair.originalIndex)} className={`w-full p-6 rounded-2xl border-2 transition-all text-sm font-bold text-left shadow-md ${matchedIndices.includes(pair.originalIndex) ? 'bg-emerald-50 border-emerald-500 text-emerald-700 opacity-60' : selectedMatchingId?.index === pair.originalIndex && selectedMatchingId.type === 'term' ? 'bg-amber-100 border-amber-500 scale-105' : 'bg-white border-slate-100 hover:border-amber-300'}`}>{pair.term}</button>
                   ))}
                </div>
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                   {shuffledDefs.map((pair, idx) => (
                      <button key={`def-${idx}`} onClick={() => handleMatchingClick(pair.originalIndex, 'definition')} disabled={matchedIndices.includes(pair.originalIndex)} className={`w-full p-6 rounded-2xl border-2 transition-all text-xs text-left shadow-md leading-relaxed ${matchedIndices.includes(pair.originalIndex) ? 'bg-emerald-50 border-emerald-500 text-emerald-700 opacity-60' : selectedMatchingId?.index === pair.originalIndex && selectedMatchingId.type === 'definition' ? 'bg-amber-100 border-amber-500 scale-105' : 'bg-white border-slate-100 hover:border-amber-300'}`}>{pair.definition}</button>
                   ))}
                </div>
             </div>
           )}
           <div className="flex justify-center"><button onClick={() => setActiveGame('none')} className="px-12 py-4 bg-slate-900 text-white rounded-full font-bebas text-2xl tracking-widest hover:bg-black transition-all">ABORT MISSION</button></div>
        </div>
      ) : activeGame === 'dungeon' ? (
        <div className={`max-w-5xl mx-auto space-y-8 animate-fade-in relative`}>
          <div className="flex justify-between items-center bg-slate-900/10 p-4 rounded-full px-8">
             <button onClick={() => setActiveGame('none')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bebas text-xl">← HUB</button>
             <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Case: {selectedSet?.name}</p>
                <p className="text-3xl font-bebas text-indigo-900">FLOOR {dungeonFloor}</p>
             </div>
             <div className="w-24"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 space-y-8">
                <div className="bg-slate-950 rounded-[3rem] p-12 border-4 border-slate-800 shadow-2xl relative min-h-[400px] flex flex-col justify-center overflow-hidden">
                   {damagePopup && (
                     <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce pointer-events-none ${damagePopup.isCritical ? 'text-red-500 text-7xl font-bebas' : 'text-white text-5xl font-bebas'}`}>
                        -{damagePopup.val}{damagePopup.isCritical ? ' CRIT!' : ''}
                     </div>
                   )}
                   <div className="flex justify-around items-center gap-8 relative z-10">
                      <div className="flex flex-col items-center space-y-4">
                         <div className="relative">
                            <img src={leader?.image} className="w-40 h-40 rounded-full border-8 border-blue-500 object-cover shadow-2xl" alt="" />
                            <div className="absolute -bottom-4 left-0 w-full bg-slate-900 border border-slate-700 h-6 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(playerCurrentHp / playerMaxHp) * 100}%` }}></div>
                            </div>
                         </div>
                         <div className="text-center">
                            <p className="text-white font-bebas text-2xl tracking-widest">{leader?.name}</p>
                         </div>
                      </div>
                      <div className="text-5xl text-white/20 font-bebas">VS</div>
                      <div className="flex flex-col items-center space-y-4">
                         <div className="relative">
                            <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&h=400&auto=format&fit=crop" className="w-40 h-40 rounded-full border-8 border-red-500 object-cover shadow-2xl" alt="" />
                            <div className="absolute -bottom-4 left-0 w-full bg-slate-900 border border-slate-700 h-6 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(enemyHp / (100 + (dungeonFloor * 20))) * 100}%` }}></div>
                            </div>
                         </div>
                         <p className="text-red-500 font-bebas text-2xl tracking-widest">FLOOR {dungeonFloor} PHANTOM</p>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100">
                   {loading ? (
                      <div className="text-center font-bebas text-2xl text-slate-400 py-12">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        PREPARING INTEL CHALLENGES...
                      </div>
                   ) : (
                      <div className="space-y-8">
                         <h3 className="text-2xl font-bold text-slate-800 text-center px-4 leading-tight">{questions[currentDungeonQuestionIdx]?.question}</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {questions[currentDungeonQuestionIdx]?.options.map((opt: string, idx: number) => {
                               const isCorrectChoice = idx === questions[currentDungeonQuestionIdx].answer;
                               const isWrongChoice = idx === wrongAnswerIndex;
                               
                               let buttonClass = "p-6 border-4 rounded-[2rem] font-bold transition-all text-md shadow-sm active:scale-95 ";
                               
                               if (wrongAnswerIndex !== null) {
                                  if (isCorrectChoice) buttonClass += "bg-emerald-500 text-white border-emerald-600 animate-pulse scale-105 z-10";
                                  else if (isWrongChoice) buttonClass += "bg-rose-500 text-white border-rose-600 animate-shake";
                                  else buttonClass += "bg-slate-50 border-slate-100 opacity-30";
                               } else {
                                  buttonClass += "bg-slate-50 border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-xl hover:-translate-y-1 text-slate-700";
                               }

                               return (
                                 <button key={idx} disabled={isQuestionLocked} onClick={() => handleDungeonAnswer(idx)} className={buttonClass}>
                                    {opt}
                                 </button>
                               );
                            })}
                         </div>
                         {wrongAnswerIndex !== null && (
                            <div className="text-center animate-fade-in p-6 bg-rose-50 rounded-3xl border border-rose-100 mt-4">
                               <p className="text-rose-600 font-black uppercase tracking-widest text-xs mb-2">Incorrect Deduction!</p>
                               <p className="text-slate-700 text-sm font-bold">The Correct Intel: <span className="text-emerald-600 underline">{questions[currentDungeonQuestionIdx]?.options[questions[currentDungeonQuestionIdx].answer]}</span></p>
                            </div>
                         )}
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudyView;
