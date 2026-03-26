import React, { useState } from 'react';
import { FaShieldAlt, FaTerminal, FaDatabase, FaEnvelope, FaFingerprint, FaFileAlt, FaFileExport, FaKey, FaGlobe, FaLock } from 'react-icons/fa';

// Import all tools
import CVEFeed from './tools/CVEFeed';
import EmailHeaderAnalyzer from './tools/EmailHeaderAnalyzer';
import SecurityHeadersScanner from './tools/SecurityHeadersScanner';
import HashChecker from './tools/HashChecker';
import LogParser from './tools/LogParser';
import IncidentReportGenerator from './tools/IncidentReportGenerator';
import PasswordAnalyzer from './tools/PasswordAnalyzer';
import WhoisDnsRecon from './tools/WhoisDnsRecon';
import MitreAttackDB from './tools/MitreAttackDB';
import { FaBook } from 'react-icons/fa';

function ToolkitPage({ appState }) {
  const [activeTab, setActiveTab] = useState('cve');

  const tools = [
    { id: 'cve', name: 'CVE Feed', icon: <FaDatabase />, component: <CVEFeed /> },
    { id: 'email', name: 'Email Headers', icon: <FaEnvelope />, component: <EmailHeaderAnalyzer /> },
    { id: 'headers', name: 'Security Headers', icon: <FaLock />, component: <SecurityHeadersScanner /> },
    { id: 'hash', name: 'Hash Checker', icon: <FaFingerprint />, component: <HashChecker /> },
    { id: 'log', name: 'Log Parser', icon: <FaFileAlt />, component: <LogParser /> },
    { id: 'report', name: 'Incident Report', icon: <FaFileExport />, component: <IncidentReportGenerator 
        logs={appState.logs} 
        alerts={appState.alerts} 
        responses={appState.responses} 
        riskPercentage={appState.riskPercentage} 
      /> 
    },
    { id: 'password', name: 'Password Analyzer', icon: <FaKey />, component: <PasswordAnalyzer /> },
    { id: 'whois', name: 'Whois/DNS', icon: <FaGlobe />, component: <WhoisDnsRecon /> },
    { id: 'mitre', name: 'MITRE ATT&CK', icon: <FaBook />, component: <MitreAttackDB /> },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Toolkit Header */}
      <div className="flex items-center gap-3 p-3 bg-black/60 border border-cyber-gray rounded shadow-lg">
        <div className="p-2 bg-cyber-green/20 rounded text-cyber-green text-xl"><FaTerminal /></div>
        <div>
          <h2 className="text-xl font-bold font-mono text-white tracking-widest">CYBERSECURITY TOOLKIT</h2>
          <p className="text-xs text-gray-500 font-mono">Advanced analysis and reconnaissance utilities</p>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-12 gap-3 h-[calc(100vh-200px)]">
        {/* Sidebar Nav */}
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-2 bg-black/40 border border-cyber-gray p-2 rounded overflow-y-auto">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`flex items-center gap-3 px-3 py-3 w-full text-left rounded font-mono text-sm transition-all duration-200 ${
                activeTab === tool.id 
                  ? 'bg-cyber-green/20 border border-cyber-green/50 text-cyber-green shadow-[0_0_10px_rgba(0,255,65,0.2)]' 
                  : 'bg-black/60 border border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-gray-300'
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="truncate">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Main Tool Area */}
        <div className="col-span-9 lg:col-span-10 bg-black/40 border border-cyber-gray rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] p-4 relative overflow-hidden flex flex-col">
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0" 
               style={{ backgroundImage: 'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="z-10 flex-grow w-full h-full relative">
             {tools.find(t => t.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolkitPage;
