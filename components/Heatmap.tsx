
import React from 'react';

interface HeatmapProps {
  data: Record<string, number>;
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const today = new Date();
  const weeks = 20; // Show last 20 weeks
  const days = 7;
  
  const getIntensity = (count: number) => {
    if (!count) return 'bg-slate-100';
    if (count < 5) return 'bg-blue-200';
    if (count < 10) return 'bg-blue-400';
    if (count < 20) return 'bg-blue-600';
    return 'bg-blue-900 shadow-glow shadow-blue-500/50';
  };

  const dayGrid = [];
  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (weeks - 1 - w) * 7 - (days - 1 - d));
      const dateKey = date.toISOString().split('T')[0];
      const count = data[dateKey] || 0;
      week.push({ date: dateKey, count });
    }
    dayGrid.push(week);
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
        {dayGrid.map((week, w) => (
          <div key={w} className="flex flex-col gap-1">
            {week.map((day, d) => (
              <div 
                key={day.date} 
                className={`w-3 h-3 rounded-[2px] transition-all cursor-help ${getIntensity(day.count)}`}
                title={`${day.date}: ${day.count} Study Points`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center px-1">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Past 20 Weeks Activity</p>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-slate-400 uppercase">Less</span>
          <div className="w-2 h-2 bg-slate-100 rounded-[1px]"></div>
          <div className="w-2 h-2 bg-blue-200 rounded-[1px]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-[1px]"></div>
          <div className="w-2 h-2 bg-blue-900 rounded-[1px]"></div>
          <span className="text-[8px] text-slate-400 uppercase">More</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
