import React, { useState } from 'react';
import { FaShieldAlt, FaBolt, FaLock } from 'react-icons/fa';

/**
 * Interactive Incident Response Console requiring user authorization.
 */
function AutoResponsePanel({ responses, pendingActions, onAuthorize }) {
  const [authorizingId, setAuthorizingId] = useState(null);

  const handleAuthorize = (id, text) => {
    setAuthorizingId(id);
    setTimeout(() => {
      onAuthorize(id, text);
      setAuthorizingId(null);
    }, 800); // Simulate deployment time
  };

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full border-cyan-500/50 relative overflow-hidden">
      <h2 className="text-sm font-bold mb-3 text-cyan-400 uppercase tracking-widest border-b border-cyan-500/30 pb-2 flex items-center">
        <FaShieldAlt className="mr-2 animate-pulse" />
        Incident Response Console
      </h2>
      
      {/* Pending Actions Alert Background glow */}
      {pendingActions && pendingActions.length > 0 && (
        <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>
      )}

      <div className="flex-grow overflow-y-auto space-y-3 pr-1 z-10 relative">
        {responses.length === 0 && (!pendingActions || pendingActions.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 font-mono text-xs opacity-50">
            <FaShieldAlt className="text-2xl mb-2" />
            <div>DEFENSE SYSTEMS READY</div>
            <div>Awaiting manual authorization...</div>
          </div>
        ) : (
          <>
            {/* Render Pending Actions */}
            {pendingActions && pendingActions.map((action) => (
              <div 
                key={action.id}
                className="border-l-2 border-red-500 bg-red-950/30 px-3 py-2 rounded-r shadow-[0_0_10px_rgba(255,0,0,0.2)] animate-fade-in"
              >
                <div className="flex items-center text-[10px] text-red-400 font-mono font-bold tracking-widest mb-1 uppercase">
                  <FaLock className="mr-1 text-red-500" /> Action Required
                </div>
                <div className="font-mono text-sm text-red-100 whitespace-pre-line leading-snug mb-2">
                  {action.text}
                </div>
                <button 
                  onClick={() => handleAuthorize(action.id, action.text)}
                  disabled={authorizingId !== null}
                  className={`w-full py-1 text-xs font-bold font-mono uppercase transition-all rounded ${
                    authorizingId === action.id 
                    ? 'bg-cyan-600 text-white cursor-wait animate-pulse'
                    : 'bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/50 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]'
                  }`}
                >
                  {authorizingId === action.id ? 'DEPLOYING COUNTERMEASURE...' : '[ AUTHORIZE ACTION ]'}
                </button>
              </div>
            ))}

            {/* Render Executed Responses */}
            {responses.map((response, index) => (
              <div 
                key={`resp-${index}`}
                className="border-l-2 border-cyan-500 bg-cyan-950/20 px-3 py-2 rounded-r animate-fade-in opacity-80 mix-blend-screen"
              >
                <div className="flex items-center text-[10px] text-cyan-500 font-mono font-bold tracking-widest mb-1 uppercase">
                  <FaBolt className="mr-1 text-cyan-400" /> Action Executed
                </div>
                <div className="font-mono text-sm text-cyan-100 whitespace-pre-line leading-relaxed">
                  <span className="text-green-400 font-bold glow-green mr-2">{"[ DEPLOYED ]"}</span>
                  {response}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default AutoResponsePanel;
