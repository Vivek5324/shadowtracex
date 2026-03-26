import React from 'react';
import { FaBrain, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaLock } from 'react-icons/fa';

const KILL_CHAIN_PHASES = [
  'Reconnaissance',
  'Initial Access',
  'Privilege Escl',
  'Lateral Movement',
  'Data Exfiltration'
];

const PREDICTIONS = {
  0: 'Likely performing port scanning or directory brute-forcing.',
  1: 'Brute force escalation or payload delivery attempt expected.',
  2: 'Credential dumping via LSASS or SAM registry hive likely next.',
  3: 'Internal reconnaissance and east-west pivot expected soon.',
  4: 'Preparing encrypted tunnel for massive data exfiltration at boundary.'
};

export default function KillChainVisualizer({ activePhase, isBlocked, isAttacking }) {
  // Determine if we are resting, attacking, or blocked.
  const isIdle = !isAttacking && activePhase === null;
  
  return (
    <div className="glass-panel p-4 rounded-lg mb-4 border-cyber-green/30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-cyber-green uppercase tracking-widest flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
          Active Attack Path (Kill Chain)
        </h2>
        {/* Prediction logic */}
        {isAttacking && !isBlocked && activePhase !== null && activePhase < 4 && (
          <div className="text-xs bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 px-3 py-1.5 rounded flex items-center shadow-[0_0_10px_rgba(0,255,255,0.2)] animate-pulse">
            <FaBrain className="mr-2 text-cyan-400" />
            <span className="font-bold mr-1">PREDICTION:</span> {PREDICTIONS[activePhase]}
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-between mt-2">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 z-0 rounded"></div>
        
        {/* Active connector line */}
        {!isIdle && (
          <div 
            className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 rounded transition-all duration-1000 ${isBlocked ? 'bg-red-500' : 'bg-orange-500 glow-orange'}`}
            style={{ width: `${Math.min(100, (activePhase / (KILL_CHAIN_PHASES.length - 1)) * 100)}%` }}
          ></div>
        )}

        {/* Nodes */}
        {KILL_CHAIN_PHASES.map((phaseName, index) => {
          // Status of this step
          let status = 'pending'; // 'completed', 'active', 'blocked', 'pending'
          
          if (isIdle) {
            status = 'pending';
          } else if (index < activePhase) {
            status = 'completed';
          } else if (index === activePhase) {
            status = isBlocked ? 'blocked' : 'active';
          } else {
            status = (isBlocked && index > activePhase) ? 'pending' : 'pending';
          }

          let icon;
          let nodeStyle = '';
          let textStyle = '';

          switch (status) {
            case 'completed':
              icon = <FaCheckCircle />;
              nodeStyle = 'bg-cyber-green border-cyber-green text-black glow-green scale-110 shadow-[0_0_15px_rgba(0,255,0,0.5)]';
              textStyle = 'text-cyber-green font-bold';
              break;
            case 'active':
              icon = <FaExclamationTriangle className="animate-pulse" />;
              nodeStyle = 'bg-black border-orange-500 text-orange-500 scale-125 shadow-[0_0_20px_rgba(255,165,0,0.6)] animate-pulse';
              textStyle = 'text-orange-500 font-bold';
              break;
            case 'blocked':
              icon = <FaTimesCircle />;
              nodeStyle = 'bg-red-900 border-red-500 text-red-100 scale-125 shadow-[0_0_20px_rgba(255,0,0,0.8)]';
              textStyle = 'text-red-500 font-bold line-through opacity-70';
              break;
            case 'pending':
            default:
              icon = <FaLock className="opacity-50 text-xs" />;
              nodeStyle = 'bg-gray-900 border-gray-700 text-gray-500';
              textStyle = 'text-gray-500';
              break;
          }

          return (
            <div key={index} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${nodeStyle}`}
              >
                {icon}
              </div>
              <div className={`mt-2 text-[10px] md:text-xs uppercase tracking-wider font-mono text-center w-20 md:w-28 leading-tight transition-all duration-500 ${textStyle}`}>
                {phaseName}
                {status === 'blocked' && <div className="text-[9px] text-red-500 mt-0.5 no-underline animate-pulse font-bold tracking-widest block">BLOCKED</div>}
                {status === 'active' && <div className="text-[9px] text-orange-400 mt-0.5 animate-pulse font-bold tracking-widest block">ACTIVE</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
