
import React, { useState } from 'react';
import { Card, ElementType, Rarity } from '../types';

interface CardDisplayProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onClick, selected, compact }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (compact) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const getElementColor = (el: ElementType) => {
    switch (el) {
      case ElementType.LOGIC: return 'bg-blue-500';
      case ElementType.EMOTION: return 'bg-rose-500';
      case ElementType.STRENGTH: return 'bg-emerald-500';
      case ElementType.LIGHT: return 'bg-amber-400';
      case ElementType.DARK: return 'bg-indigo-900';
      default: return 'bg-slate-500';
    }
  };

  const getBorderColor = () => {
    switch (card.element) {
      case ElementType.LOGIC: return 'border-blue-400';
      case ElementType.EMOTION: return 'border-rose-400';
      case ElementType.STRENGTH: return 'border-emerald-400';
      case ElementType.LIGHT: return 'border-amber-300';
      case ElementType.DARK: return 'border-indigo-600';
      default: return 'border-gray-200';
    }
  };

  const rarityClass = card.rarity === Rarity.SSR ? 'rarity-ssr' : card.rarity === Rarity.UR ? 'rarity-ur' : '';
  const isMaxLB = card.limitBreak >= 5;

  const getRarityBadgeStyle = () => {
    switch (card.rarity) {
      case Rarity.UR: return 'bg-indigo-900 text-white badge-ur-glow overflow-hidden';
      case Rarity.SSR: return 'bg-amber-400 text-amber-950 badge-ssr-glow overflow-hidden';
      case Rarity.SR: return 'bg-blue-600 text-white';
      case Rarity.R: return 'bg-slate-600 text-white';
      default: return 'bg-white text-slate-900';
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border-4 transition-all duration-300 cursor-pointer shadow-xl group
        ${getBorderColor()} ${selected ? 'ring-8 ring-blue-600/30 scale-105 z-10' : 'hover:scale-[1.03] hover:shadow-2xl'} 
        ${rarityClass} ${isMaxLB ? 'max-lb-glow' : ''}`}
      style={{
        transform: !compact ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` : 'none',
        aspectRatio: '2 / 3',
        maxWidth: '100%'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
      
      {isMaxLB && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/5 to-white/20 opacity-40 pointer-events-none mix-blend-overlay animate-pulse"></div>
      )}

      <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex justify-between items-start">
          <div className={`relative px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold font-bebas tracking-[0.2em] shadow-lg animate-rarity-pop ${getRarityBadgeStyle()}`}>
            {card.rarity}
            {(card.rarity === Rarity.UR || card.rarity === Rarity.SSR) && (
              <div className="absolute inset-0 shimmer-overlay opacity-30"></div>
            )}
          </div>
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg ring-2 ring-white/20 ${getElementColor(card.element)}`}>
            {card.element[0]}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-3 sm:p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white pointer-events-none">
        <p className="text-[8px] sm:text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1 truncate">{card.title}</p>
        <h3 className="text-sm sm:text-lg font-bold truncate tracking-tight">{card.name}</h3>
        {!compact && (
          <div className="flex justify-between items-center text-[8px] sm:text-[10px] mt-3 font-mono opacity-80">
            <span className="bg-white/10 px-2 py-0.5 rounded">LV. {card.level}</span>
            <span className={`px-2 py-0.5 rounded ${isMaxLB ? 'bg-amber-500 text-black font-black animate-pulse' : 'bg-white/10'}`}>LB: {card.limitBreak}/5</span>
          </div>
        )}
      </div>

      {selected && (
        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <div className="bg-blue-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>
      )}

      {card.isFavorite && (
        <div className="absolute top-4 right-4 text-yellow-400 text-xl sm:text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] animate-pulse pointer-events-none">
           ★
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
