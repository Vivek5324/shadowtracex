import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

/**
 * Auto-Response Panel showing automated actions taken to defend the system.
 * @param {Array} responses Array of strings describing the actions taken.
 */
function AutoResponsePanel({ responses }) {
  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full border-cyber-blue/50">
      <h2 className="text-xl font-bold mb-4 text-cyber-blue uppercase tracking-widest border-b border-cyber-blue/30 pb-2 flex items-center">
        <FaShieldAlt className="mr-2" />
        Auto-Response
      </h2>
      
      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {responses.length === 0 ? (
          <div className="text-center text-gray-500 py-4 font-mono">Defense Systems Idle</div>
        ) : (
          responses.map((response, index) => (
            <div 
              key={index}
              className="p-2 border border-cyber-blue/30 bg-cyber-blue/10 rounded font-mono text-sm text-cyber-blue animate-fade-in flex items-start"
            >
              <span className="text-green-400 mr-2 font-bold">✓</span>
              <span>{response}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AutoResponsePanel;
