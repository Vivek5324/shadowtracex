import React, { useEffect, useState } from 'react';
import { FaShieldAlt, FaBolt } from 'react-icons/fa';

/**
 * Auto-Response Panel showing automated actions taken to defend the system.
 * With dramatic action-execution logging.
 */
function AutoResponsePanel({ responses }) {
  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full border-cyber-blue/50">
      <h2 className="text-sm font-bold mb-3 text-cyan-400 uppercase tracking-widest border-b border-cyan-500/30 pb-2 flex items-center">
        <FaShieldAlt className="mr-2 animate-pulse" />
        Automated Defense System
      </h2>
      
      <div className="flex-grow overflow-y-auto space-y-3 pr-1">
        {responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 font-mono text-xs opacity-50">
            <FaShieldAlt className="text-2xl mb-2" />
            <div>DEFENSE SYSTEMS IDLE</div>
            <div>Awaiting Threat Detection...</div>
          </div>
        ) : (
          responses.map((response, index) => (
            <div 
              key={index}
              className="border-l-2 border-cyan-500 bg-cyan-950/20 px-3 py-2 rounded-r animate-fade-in"
            >
              <div className="flex items-center text-[10px] text-cyan-500 font-mono font-bold tracking-widest mb-1 uppercase">
                <FaBolt className="mr-1 text-cyan-400 animate-pulse" /> Action Executed
              </div>
              <div className="font-mono text-sm text-cyan-100 whitespace-pre-line leading-relaxed">
                {response.includes('BLOCKED') || response.includes('disabled') || response.includes('reset') ? (
                  <span className="text-red-400 font-bold glow-red mr-2">{"[ NEUTRALIZED ]"}</span>
                ) : (
                  <span className="text-green-400 font-bold glow-green mr-2">{"[ DEPLOYED ]"}</span>
                )}
                {response}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AutoResponsePanel;
