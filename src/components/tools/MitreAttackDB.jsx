import React, { useState, useMemo } from 'react';
import { FaBook, FaSearch, FaBug, FaNetworkWired, FaGhost, FaServer, FaUserSecret, FaGlobe, FaTerminal } from 'react-icons/fa';

const MITRE_DB = [
  {
    tactic: 'Initial Access',
    id: 'TA0001',
    icon: <FaGlobe />,
    techniques: [
      { id: 'T1190', name: 'Exploit Public-Facing Application', description: 'Adversaries may attempt to exploit a weakness in an Internet-facing host or system to initially access a network.', mitigation: 'Segment external-facing applications. Perform regular vulnerability scanning and patching. Deploy WAFs.' },
      { id: 'T1078', name: 'Valid Accounts', description: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.', mitigation: 'Enforce MFA. Monitor for impossible travel. Implement strict password policies and regular audits.' }
    ]
  },
  {
    tactic: 'Execution',
    id: 'TA0002',
    icon: <FaTerminal />,
    techniques: [
      { id: 'T1059', name: 'Command and Scripting Interpreter', description: 'Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.', mitigation: 'Disable or restrict Windows Script Host. Restrict PowerShell execution policies. Monitor command-line arguments.' },
      { id: 'T1610', name: 'Deploy Container', description: 'Adversaries may deploy a container into an environment to facilitate execution or evade defenses.', mitigation: 'Restrict container orchestration API access. Use RBAC to limit who can deploy pods/containers.' }
    ]
  },
  {
    tactic: 'Privilege Escalation',
    id: 'TA0004',
    icon: <FaUserSecret />,
    techniques: [
      { id: 'T1068', name: 'Exploitation for Privilege Escalation', description: 'Adversaries may exploit software vulnerabilities in an attempt to elevate privileges.', mitigation: 'Update software. Implement memory protection schemes (ASLR/DEP). Restrict execution from user directories.' },
      { id: 'T1548', name: 'Abuse Elevation Control Mechanism', description: 'Adversaries may circumvent mechanisms designed to control elevate privileges to gain higher-level permissions.', mitigation: 'Configure UAC to Always Notify. Audit sudoers file on Linux systems.' }
    ]
  },
  {
    tactic: 'Lateral Movement',
    id: 'TA0008',
    icon: <FaNetworkWired />,
    techniques: [
      { id: 'T1550', name: 'Use Alternate Authentication Material', description: 'Adversaries may use alternate authentication material, such as password hashes or Kerberos tickets, to move laterally within a network.', mitigation: 'Enable Windows Defender Credential Guard. Limit lateral connections (tiering model). Monitor for Pass-the-Hash.' },
      { id: 'T1021', name: 'Remote Services', description: 'Adversaries may use Valid Accounts to log into a service specifically designed to accept remote connections, such as telnet, SSH, and RDP.', mitigation: 'Disable unnecessary remote services. Implement jump servers. Require VPN for internal access.' }
    ]
  },
  {
    tactic: 'Exfiltration',
    id: 'TA0010',
    icon: <FaServer />,
    techniques: [
      { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', description: 'Adversaries may steal data by exfiltrating it over a different protocol than that of the existing command and control channel (e.g. DNS or ICMP tunneling).', mitigation: 'Block unauthorized DNS resolvers. Monitor anomalous network traffic volume. Implement Deep Packet Inspection (DPI).' },
      { id: 'T1567', name: 'Exfiltration Over Web Service', description: 'Adversaries may use an existing, legitimate external Web service to exfiltrate data rather than their primary command and control channel.', mitigation: 'Block access to unapproved cloud storage services (e.g. Mega, Dropbox) using Web Proxies.' }
    ]
  }
];

export default function MitreAttackDB() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDB = useMemo(() => {
    if (!searchTerm) return MITRE_DB;
    const term = searchTerm.toLowerCase();
    
    return MITRE_DB.map(tactic => {
      const matchTactic = tactic.tactic.toLowerCase().includes(term) || tactic.id.toLowerCase().includes(term);
      const matchedTechs = tactic.techniques.filter(tech => 
        tech.name.toLowerCase().includes(term) || 
        tech.id.toLowerCase().includes(term) ||
        tech.description.toLowerCase().includes(term)
      );
      
      if (matchTactic || matchedTechs.length > 0) {
        return {
          ...tactic,
          techniques: matchTactic ? tactic.techniques : matchedTechs
        };
      }
      return null;
    }).filter(Boolean);
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full bg-black/40 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-cyan-400 flex items-center tracking-widest uppercase">
            <FaBook className="mr-3 text-2xl" /> MITRE ATT&CK Knowledge Base
          </h2>
          <p className="text-sm text-gray-500 mt-1">Enterprise Tactics, Techniques, and Remediation Strategies</p>
        </div>
        <div className="flex items-center bg-black/50 border border-gray-700 rounded px-3 py-1.5 w-64 focus-within:border-cyan-500 transition-colors">
          <FaSearch className="text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search by ID (e.g. T1190) or keyword..." 
            className="bg-transparent border-none text-cyan-300 w-full focus:outline-none text-sm font-mono placeholder-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDB.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 font-mono">
            No tactics or techniques found matching "{searchTerm}"
          </div>
        ) : (
          filteredDB.map((tacticArea, index) => (
            <div key={index} className="glass-panel border-cyan-500/20 rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 bg-cyan-950/30 p-2 rounded border border-cyan-900/50">
                <h3 className="font-bold text-cyan-400 font-mono text-lg flex items-center uppercase tracking-wide">
                  <span className="mr-2 opacity-70">{tacticArea.icon}</span> {tacticArea.tactic}
                </h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-900 px-2 py-1 rounded">{tacticArea.id}</span>
              </div>
              
              <div className="flex flex-col gap-3 flex-grow">
                {tacticArea.techniques.map((tech) => (
                  <div key={tech.id} className="bg-black/60 border border-gray-800 rounded p-3 hover:border-cyan-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-200 text-sm">{tech.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-orange-400 border border-orange-500/30 px-1 rounded">{tech.id}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 leading-relaxed">{tech.description}</p>
                    <div className="bg-green-950/20 border-l-2 border-green-500 p-2 text-xs text-green-400/80 italic font-mono">
                      <span className="font-bold text-green-500 not-italic mr-1">Mitigation:</span>
                      {tech.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
