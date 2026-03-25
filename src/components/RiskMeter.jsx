import React from 'react';

/**
 * Risk Meter visualizing the current system compromise percentage.
 * @param {number} riskPercentage The percentage of risk (0-100).
 */
function RiskMeter({ riskPercentage }) {
  // Determine color based on risk level
  const getColorClasses = (percentage) => {
    if (percentage < 30) return { bg: 'bg-green-500', text: 'text-green-500', shadow: 'shadow-green-500/50' };
    if (percentage < 70) return { bg: 'bg-yellow-500', text: 'text-yellow-500', shadow: 'shadow-yellow-500/50' };
    return { bg: 'bg-red-500 animate-pulse', text: 'text-red-500 text-shadow-red', shadow: 'shadow-red-500/50 bg-red-900/50' };
  };

  const colors = getColorClasses(riskPercentage);

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full justify-between">
      <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">
        System Risk
      </h2>
      
      <div className="flex flex-col items-center justify-center flex-grow py-4">
        <div className="relative flex items-center justify-center mb-2">
          {/* Circular progress backdrop */}
          <div className="w-32 h-32 rounded-full border-4 border-gray-800 absolute"></div>
          {/* Circular progress fill mapping the percentage to a stroke dasharray wouldn't work easily with standard Tailwind classes without a custom SVG, so let's just use a styled text representation and an animated background layer behind it for wow factor */}
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${colors.text.replace('text', 'border')} ${riskPercentage > 70 ? 'shadow-[0_0_20px_rgba(255,0,0,0.6)]' : ''} transition-all duration-1000`}>
             <span className={`text-5xl font-mono font-bold ${colors.text}`}>
               {Math.round(riskPercentage)}%
             </span>
          </div>
        </div>
        
        <div className="w-full mt-4 bg-gray-800 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-4 transition-all duration-1000 ease-in-out ${colors.bg}`}
            style={{ width: `${riskPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-center font-mono text-sm text-gray-500 uppercase">
        {riskPercentage < 30 ? 'Low Priority' : riskPercentage < 70 ? 'Elevated Threat' : 'CRITICAL BREACH'}
      </div>
    </div>
  );
}

export default RiskMeter;
