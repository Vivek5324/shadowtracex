import React from 'react';

/**
 * Animated Risk Meter visualizing the current system compromise percentage.
 * @param {number} riskPercentage The percentage of risk (0-100).
 */
function RiskMeter({ riskPercentage }) {
  // Determine color and status label based on risk level
  const getStatus = (percentage) => {
    if (percentage < 30) return { bg: 'bg-green-500', text: 'text-green-500 text-shadow-green', shadow: 'shadow-green-500/50', label: 'SYSTEM SAFE', icon: '🟢' };
    if (percentage < 70) return { bg: 'bg-yellow-500 animate-pulse', text: 'text-yellow-500', shadow: 'shadow-yellow-500/50', label: 'ELEVATED THREAT', icon: '🟠' };
    return { bg: 'bg-red-600 animate-pulse', text: 'text-red-500 text-shadow-red', shadow: 'shadow-[0_0_30px_rgba(255,0,0,0.8)] border-red-500', label: 'CRITICAL BREACH', icon: '🔴' };
  };

  const status = getStatus(riskPercentage);

  return (
    <div className={`glass-panel p-4 rounded-lg flex flex-col h-full justify-between transition-all duration-700 ${riskPercentage > 70 ? 'border-red-500 animate-alarm bg-red-950/20' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className={`text-sm font-bold uppercase tracking-widest ${riskPercentage > 70 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
          System Risk Level
        </h2>
        <span className={`text-xs font-mono font-bold px-2 py-1 rounded bg-black/50 border ${status.text.split(' ')[0].replace('text', 'border')}`}>
          {status.icon} {status.label}
        </span>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-grow py-2">
        <div className="relative flex items-center justify-center mb-4">
          {/* Animated glow ring behind the percentage */}
          <div className={`absolute w-32 h-32 rounded-full blur-xl opacity-30 ${status.bg} transition-all duration-1000`}></div>
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-dashed relative z-10 transition-all duration-1000 ${status.text.split(' ')[0].replace('text', 'border')} ${riskPercentage > 70 ? 'animate-[spin_10s_linear_infinite]' : 'border-opacity-30'}`}></div>
          
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <span className={`text-5xl font-mono font-bold tracking-tighter transition-colors duration-500 ${status.text} ${riskPercentage > 70 ? 'animate-glitch' : ''}`}>
               {Math.round(riskPercentage)}%
             </span>
          </div>
        </div>
        
        {/* Animated rising graph bar */}
        <div className="w-full relative">
          <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden border border-gray-800">
            <div 
              className={`h-full transition-all duration-1000 ease-in-out relative ${status.bg}`}
              style={{ width: `${riskPercentage}%` }}
            >
               {/* Shine effect passing over the bar */}
               <div className="absolute top-0 right-0 bottom-0 left-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[translate_2s_infinite]"></div>
            </div>
          </div>
          {/* Tic markers */}
          <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1 px-1">
             <span>0</span>
             <span>25</span>
             <span>50</span>
             <span>75</span>
             <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskMeter;
