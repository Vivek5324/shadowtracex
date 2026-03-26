import React, { useState, useEffect } from 'react';
import { FaSearch, FaShieldAlt, FaMapMarkerAlt, FaGlobe, FaGhost, FaNetworkWired, FaServer, FaCogs } from 'react-icons/fa';

export default function IpLookupPanel({ prefillIp, onClearPrefill }) {
  const [ipInput, setIpInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanState, setScanState] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (prefillIp) {
      setIpInput(prefillIp);
      handleScan(prefillIp);
    }
  }, [prefillIp]);

  const generateFakeIntel = (ip) => {
    const isLocal = ip.startsWith('10.') || ip.startsWith('192.168.') || ip === '127.0.0.1';
    
    if (isLocal) {
      return {
        ip,
        isMalicious: false,
        score: 0,
        isp: 'Internal Corporate Network',
        country: 'Local',
        countryCode: 'LAN',
        associations: 'None — Trusted Internal Zone',
        lastSeen: 'N/A'
      };
    }

    const ispList = ['M247 Europe SRL', 'DigitalOcean, LLC', 'Linode', 'Hostinger', 'Vultr Holdings'];
    const countries = ['RU', 'CN', 'KP', 'IR', 'BR'];
    const actors = ['APT28 (Fancy Bear)', 'Lazarus Group', 'Mustang Panda', 'FIN7', 'Unknown Botnet Node'];

    const chance = Math.random();
    // 80% chance it returns a high-threat profile for the simulation
    const isMalicious = chance > 0.2;

    return {
      ip,
      isMalicious,
      score: isMalicious ? Math.floor(80 + Math.random() * 20) : Math.floor(Math.random() * 10),
      isp: ispList[Math.floor(Math.random() * ispList.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      countryCode: countries[Math.floor(Math.random() * countries.length)],
      associations: isMalicious ? actors[Math.floor(Math.random() * actors.length)] : 'None identified',
      lastSeen: isMalicious ? `${Math.floor(Math.random() * 24) + 1} hours ago targeting gov/fin sector` : '> 90 days ago'
    };
  };

  const handleScan = (ipToScan = ipInput) => {
    const targetIp = ipToScan;
    if (!targetIp) return;
    
    setIsScanning(true);
    setResult(null);
    setScanState('INITIATING SATELLITE UPLINK...');
    
    setTimeout(() => setScanState('CROSS-REFERENCING CTI DATABASES...'), 600);
    setTimeout(() => setScanState('ANALYZING BEHAVIORAL HEURISTICS...'), 1200);
    
    setTimeout(() => {
      const intel = generateFakeIntel(targetIp);
      setResult(intel);
      setIsScanning(false);
      setScanState('');
      if (onClearPrefill) onClearPrefill();
    }, 1800);
  };

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full border-cyan-500/30">
      <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center">
        <FaGlobe className="mr-2" /> Global Threat OSINT Module
      </h2>
      
      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="Enter IPv4 Address..." 
          className="bg-black/50 border border-gray-700 text-cyan-300 px-3 py-1.5 rounded w-full font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          disabled={isScanning}
        />
        <button 
          onClick={() => handleScan()}
          disabled={isScanning || !ipInput}
          className="bg-cyan-900/50 hover:bg-cyan-800 border border-cyan-700 text-cyan-300 px-4 py-1.5 rounded font-bold transition-all disabled:opacity-50 flex items-center"
        >
          {isScanning ? <FaCogs className="animate-spin" /> : <FaSearch />}
        </button>
      </div>

      {/* Loading State */}
      {isScanning && (
        <div className="flex-grow flex flex-col items-center justify-center font-mono">
          <div className="w-12 h-12 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,255,255,0.5)]"></div>
          <p className="text-cyan-400 text-xs animate-pulse tracking-widest uppercase text-center min-h-[20px]">{scanState}</p>
        </div>
      )}

      {/* Initial State */}
      {!isScanning && !result && (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500 relative">
          <FaShieldAlt className="text-4xl mb-3 opacity-20" />
          <p className="text-xs uppercase tracking-widest text-center leading-relaxed">Threat Intelligence Matrix Online<br/>Awaiting Trace Route Request</p>
        </div>
      )}

      {/* Result State */}
      {!isScanning && result && (
        <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar animate-fade-in relative z-10 w-full">
          {result.isMalicious && (
            <div className="absolute inset-0 bg-red-500/5 z-0 pointer-events-none rounded animate-pulse"></div>
          )}
          
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3 relative z-10 w-full overflow-hidden">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Target Identity</div>
              <div className={`font-mono text-lg sm:text-xl font-bold truncate ${result.isMalicious ? 'text-red-500 glow-red' : 'text-cyber-green'}`}>
                {result.ip}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Threat Score</div>
              <div className={`text-xl sm:text-2xl font-black ${result.score > 75 ? 'text-red-500' : result.score > 20 ? 'text-orange-400' : 'text-cyber-green'}`}>
                {result.score}/100
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 relative z-10 w-full">
            <div className="bg-black/40 border border-gray-800 p-2 sm:p-3 rounded flex items-center justify-between w-full overflow-hidden">
              <div className="flex items-center flex-shrink-0">
                <FaMapMarkerAlt className="text-gray-500 mr-2 sm:mr-3 text-sm sm:text-lg" />
                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Geolocation</div>
              </div>
              <div className="text-gray-300 font-mono text-xs sm:text-sm pl-2">{result.country}</div>
            </div>
            
            <div className="bg-black/40 border border-gray-800 p-2 sm:p-3 rounded flex items-center justify-between w-full overflow-hidden">
              <div className="flex items-center flex-shrink-0">
                <FaServer className="text-gray-500 mr-2 sm:mr-3 text-sm sm:text-lg" />
                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Provider</div>
              </div>
              <div className="text-gray-300 font-mono text-[10px] sm:text-xs truncate w-24 sm:w-32 text-right pl-2 leading-relaxed" title={result.isp}>{result.isp}</div>
            </div>

            <div className={`border p-2 sm:p-3 rounded flex items-center justify-between w-full overflow-hidden flex-col sm:flex-row gap-1 sm:gap-2 ${result.isMalicious ? 'bg-red-950/30 border-red-900/50' : 'bg-black/40 border-gray-800'}`}>
              <div className="flex items-center self-start sm:self-auto w-full sm:w-auto">
                <FaGhost className={`${result.isMalicious ? 'text-red-500 animate-pulse' : 'text-gray-500'} mr-2 sm:mr-3 text-sm sm:text-lg`} />
                <div className={`text-[10px] sm:text-xs uppercase tracking-wide ${result.isMalicious ? 'text-red-400/70 font-bold' : 'text-gray-500'}`}>Known Associations</div>
              </div>
              <div className={`font-mono text-[10px] sm:text-xs self-start sm:self-auto w-full sm:w-auto text-left sm:text-right ${result.isMalicious ? 'text-red-400 leading-relaxed' : 'text-gray-300'}`}>{result.associations}</div>
            </div>

            <div className="bg-black/40 border border-gray-800 p-2 sm:p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full overflow-hidden">
              <div className="flex items-center">
                <FaNetworkWired className="text-gray-500 mr-2 sm:mr-3 text-sm sm:text-lg" />
                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Last Sighting</div>
              </div>
              <div className="text-gray-400 font-mono text-[9px] sm:text-[10px] leading-relaxed break-words">{result.lastSeen}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
