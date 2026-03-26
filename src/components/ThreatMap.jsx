import React, { useEffect, useState } from 'react';

// Basic SVG coordination path for a minimalist dark world map
const WORLD_MAP_PATH = "M31.2 56.5c-1.3-.8-1.7-2.1-1-3.6.5-1.1 1.7-1.8 3.5-2.2 2-.4 3 .2 3 1.9 0 .5-.4 1-1 1.2-3.1.6-4 1.7-2.6 3.1.7.7.7.9.1.5-.4-.3-.7-.6-2-.9zm18-5.3c-.5-.6 0-1.2 2-2.1l1.5-.7-1.2-1.3c-1.6-1.6-1.5-1.6-3 .2-1 1.3-1.6 1.7-2.4 1.7-1.3 0-1.8-1.5-.9-2.9.5-.7 1.5-.8 3.7-.4 2.2.3 3.5.1 4.5-.6.8-.7 1.6-.9 2-.5.8.6.5 1.7-1.1 3.5-1.4 1.6-1.9 2-3 2h-.8L50.5 50h-1.3zM21 44.4c-.6-.7-.1-1.4 1.7-2.6 1.8-1 2.3-1 2.3 0 0 .5-1.6 1.8-3.1 2.5l-1 .4.1-.3zm75.4-3.1c-1.8-.8-1.5-.8 1.9.4 1.2.5 2.1 1.3 2.1 2 .1.6-.2 1.3-.6 1.7-1 .7.2.1-3.4-4.1zm1.2 1c-1.6-1.4 1.8.8 2.2 1.4.3.4-.6-.2-2.2-1.4zm-7.6-1.2c-1.6-1.1-2.9-2.3-2.9-2.6 0-.3.6.1 1.4 1 1 1.3 3 3 2.5 3.1-.3.1-1.1-1.5-1-1.5zm-59.5.4c-1.1-1.3-1.6-2.5-1.4-3 .3-.5.9-.6 1.6-.3s2 1.9 2.5 3.3c.5 1.4.3 1.6-1.1.8l-1.6-.8zm41-2.8c-1.7-1.2-2.3-2.2-1.8-3 .4-.5 1-.6 1.6-.3 1 1 2.1 2.8 1.6 3-.4.2-1-1.3-1.4-1.3zm38.8.8c.1-.4 1.4.3 2.8 1.6 2 1.9 2 2.2-.4 2-1-.1-2.2-.8-2.6-1.5-.5-1-1-1.7-.8-1.7.2 0 .6-.2 1-.4zm-48.5-.2c-.3-1 .2-1.6 1.5-1.9 1-.2 1.7 0 2 1 .2.7-.4 1.3-1.4 1.6-1.1.2-1.9-.1-2.1-.7zm-55.8 0c-.3-1 .2-1.6 1.5-1.9 1-.2 1.7 0 2 1 .2.7-.4 1.3-1.4 1.6-1.1.2-1.9-.1-2.1-.7zm62.4-.4c-.5-.7-.4-.8 1.1-2.2 1.5-1.4 2-1.4 2.5.4.3 1.2.3 1.2-1.8.4-.7-.3-1.8-.9-2.3-1.3l.5 2.7z";

const COORDINATES = {
  brute_force: { x1: 75, y1: 30, x2: 25, y2: 35 }, // e.g. Russia to US East
  port_scan: { x1: 85, y1: 45, x2: 25, y2: 35 },   // e.g. China to US East
  apt_attack: { x1: 50, y1: 25, x2: 25, y2: 35 },  // e.g. Europe to US East
  botnet: [                                        // Multiple sources to US East
    { x1: 75, y1: 30, x2: 25, y2: 35 },
    { x1: 85, y1: 45, x2: 25, y2: 35 },
    { x1: 50, y1: 25, x2: 25, y2: 35 },
    { x1: 35, y1: 60, x2: 25, y2: 35 },
    { x1: 65, y1: 75, x2: 25, y2: 35 },
  ]
};

function ThreatMap({ activeAttackId }) {
  const [arcs, setArcs] = useState([]);

  useEffect(() => {
    if (!activeAttackId) {
      setArcs([]);
      return;
    }

    const targetCoords = COORDINATES[activeAttackId];
    if (Array.isArray(targetCoords)) {
      setArcs(targetCoords);
    } else if (targetCoords) {
      setArcs([targetCoords]);
    }
  }, [activeAttackId]);

  return (
    <div className="glass-panel rounded-lg p-4 relative overflow-hidden flex flex-col h-full border border-cyber-gray">
      <div className="flex justify-between items-center mb-2 z-10">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${activeAttackId ? 'bg-red-500 animate-pulse' : 'bg-cyber-green'}`}></span>
          Global Threat Map
        </h2>
        {activeAttackId && (
          <span className="text-xs text-red-500 font-mono animate-pulse border border-red-500/50 bg-red-900/20 px-2 py-0.5 rounded">
            ACTIVE THREAT ORIGIN
          </span>
        )}
      </div>

      <div className="flex-grow relative flex items-center justify-center opacity-80 mix-blend-screen">
        <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,255,65,0.3)]">
          {/* Base Map Grid - Visual flair */}
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
             <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(0, 255, 65, 0.1)" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="transparent" />
          
          {/* World Map SVG Paths - stylized dots representing continents */}
          <g fill="rgba(0, 255, 65, 0.2)" stroke="rgba(0, 255, 65, 0.4)" strokeWidth="0.5">
             <path d="M10,20 Q15,15 25,25 T40,20 T55,25 T70,15 T85,30  T90,50 T75,60 T60,50 T45,60 T30,55 T15,45 Z" fill="url(#grid)" />
             <path d="M20,30 Q25,25 35,35 T50,30 T65,35" fill="none" strokeWidth="1" />
             <path d="M30,40 Q35,35 45,45" fill="none" strokeWidth="1" />
          </g>

          {/* Active Target Node (Servers) */}
          <circle cx="25" cy="35" r="1.5" fill={activeAttackId ? "#ff003c" : "#00ff41"} className={activeAttackId ? "animate-ping" : ""} />
          <circle cx="25" cy="35" r="0.5" fill="#fff" />

          {/* Animated Arcs for Active Attacks */}
          {arcs.map((arc, i) => {
             // Create a curved path string: M x1 y1 Q controlX controlY x2 y2
             const midX = (arc.x1 + arc.x2) / 2;
             const midY = (arc.y1 + arc.y2) / 2 - 15; // Arc height
             const pathD = `M ${arc.x1} ${arc.y1} Q ${midX} ${midY} ${arc.x2} ${arc.y2}`;

             return (
               <g key={i}>
                 {/* Source Node */}
                 <circle cx={arc.x1} cy={arc.y1} r="1" fill="#ff003c" className="animate-pulse" />
                 
                 {/* The Arc line */}
                 <path 
                   d={pathD} 
                   fill="none" 
                   stroke="url(#attackGradient)" 
                   strokeWidth="0.8"
                   strokeDasharray="4 2"
                   className="animate-[dash_1s_linear_infinite]"
                   style={{ animationDirection: 'reverse' }}
                 />
                 
                 {/* Moving packet on arc */}
                 <circle r="0.8" fill="#fff" style={{ filter: 'drop-shadow(0 0 2px #ff003c)' }}>
                   <animateMotion dur={0.8 + (Math.random() * 0.4) + "s"} repeatCount="indefinite" path={pathD} />
                 </circle>
               </g>
             );
          })}
          
          <defs>
            <linearGradient id="attackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff003c" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#ff003c" stopOpacity="0.1"/>
            </linearGradient>
            <style>
              {`
                @keyframes dash {
                  to { stroke-dashoffset: 12; }
                }
              `}
            </style>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default ThreatMap;
