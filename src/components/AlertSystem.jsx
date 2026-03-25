import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Alert System displaying severity-based warnings.
 * @param {Array} alerts Array of alert objects { id, message, level }
 */
function AlertSystem({ alerts }) {
  const getLevelStyle = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-900/50 border-red-500 text-red-500 animate-pulse';
      case 'HIGH': return 'bg-orange-900/50 border-orange-500 text-orange-500';
      case 'MEDIUM': return 'bg-yellow-900/50 border-yellow-500 text-yellow-500';
      default: return 'bg-gray-800 border-gray-600 text-gray-400';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-red-500 uppercase tracking-widest border-b border-red-500/30 pb-2 flex items-center">
        <FaExclamationTriangle className="mr-2" />
        Alert System
      </h2>
      
      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-4 font-mono">ALL SYSTEMS NOMINAL</div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-2 border rounded font-mono text-sm shadow-md transition-all animate-slide-up flex ${getLevelStyle(alert.level)}`}
            >
              <div className="font-bold mr-2 w-20">[{alert.level}]</div>
              <div className="flex-1">{alert.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertSystem;
