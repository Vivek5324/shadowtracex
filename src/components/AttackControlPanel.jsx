import React, { useState } from 'react';
import { FaSkull, FaSearch, FaGhost, FaNetworkWired, FaChevronDown, FaChevronUp, FaPlay, FaInfoCircle } from 'react-icons/fa';

const ATTACK_DEFS = [
  {
    id: 'brute_force',
    name: 'Credential Brute Force',
    icon: <FaSkull />,
    color: 'red',
    severity: 'HIGH',
    mitre: 'T1110.001',
    mitreName: 'Password Guessing',
    description: 'Automated login attempts using common username/password combinations against authentication endpoints. Attackers use wordlists and credential dumps to systematically try passwords.',
    targetServices: ['HTTP Auth (80/443)', 'SSH (22)', 'RDP (3389)', 'FTP (21)'],
    toolsUsed: ['Hydra', 'Medusa', 'Burp Intruder', 'Custom Python scripts'],
    indicators: [
      'Multiple 401/403 responses from same source IP',
      'Login attempts > 10/min from single IP',
      'Sequential username enumeration patterns',
      'Known credential dump user-agents (python-requests, curl)'
    ],
    realWorldExample: '2023 Okta breach — attackers used credential stuffing from residential proxies targeting customer admin panels.',
    phases: ['Recon', 'Credential Spray', 'Auth Bypass', 'Access Gained']
  },
  {
    id: 'port_scan',
    name: 'Network Reconnaissance',
    icon: <FaSearch />,
    color: 'cyan',
    severity: 'MEDIUM',
    mitre: 'T1046',
    mitreName: 'Network Service Scanning',
    description: 'Systematic probing of ports to discover running services, open ports, and potential attack vectors. Attackers map the target network before launching exploits.',
    targetServices: ['All TCP ports (1-65535)', 'Common UDP services', 'Service banners'],
    toolsUsed: ['Nmap', 'Masscan', 'Zmap', 'Shodan CLI'],
    indicators: [
      'SYN packets across sequential port ranges',
      'Connections to multiple non-standard ports from one IP',
      'Nmap user-agent in HTTP probes',
      'Half-open (SYN) scan pattern — no ACK completion'
    ],
    realWorldExample: 'Standard first step in most penetration tests and attacks — Nmap SYN scan identified exposed MongoDB on port 27017 leading to data exfil.',
    phases: ['Host Discovery', 'Port Probing', 'Service Detection', 'OS Fingerprint']
  },
  {
    id: 'apt_attack',
    name: 'Advanced Persistent Threat',
    icon: <FaGhost />,
    color: 'purple',
    severity: 'CRITICAL',
    mitre: 'T1071 / T1048',
    mitreName: 'Application Layer Protocol / Exfiltration Over C2',
    description: 'Multi-stage attack involving initial compromise, lateral movement across network segments, privilege escalation, and data exfiltration. Uses living-off-the-land techniques to avoid detection.',
    targetServices: ['Internal VLANs', 'Database servers', 'Active Directory', 'DNS (exfil channel)'],
    toolsUsed: ['Cobalt Strike', 'Mimikatz', 'PsExec', 'DNS tunneling tools'],
    indicators: [
      'Lateral movement between network segments (east-west traffic)',
      'Unusual DNS query volume or long subdomain labels (DNS tunneling)',
      'Process injection or DLL sideloading patterns',
      'LSASS memory access attempts'
    ],
    realWorldExample: 'SolarWinds SUNBURST (2020) — APT29 injected backdoor into software updates, used DNS for C2, laterally moved to access email systems.',
    phases: ['Initial Access', 'Lateral Movement', 'Privilege Escalation', 'Data Exfil']
  },
  {
    id: 'botnet',
    name: 'DDoS Botnet Strike',
    icon: <FaNetworkWired />,
    color: 'orange',
    severity: 'CRITICAL',
    mitre: 'T1498 / T1499',
    mitreName: 'Network/Application DoS',
    description: 'Distributed attack using a network of compromised hosts (botnet) to overwhelm target infrastructure with traffic. Can target network bandwidth (volumetric) or application layer (HTTP flood).',
    targetServices: ['Load balancers', 'Web servers (80/443)', 'DNS servers (53)', 'API endpoints'],
    toolsUsed: ['Mirai variants', 'LOIC/HOIC', 'Slowloris', 'Custom botnets'],
    indicators: [
      'Traffic volume spike from geographically distributed IPs',
      'HTTP flood — thousands of requests to same endpoint',
      'SYN flood — half-open connections exhausting state tables',
      'Unusual traffic from IoT device user-agents'
    ],
    realWorldExample: 'Dyn DNS attack (2016) — Mirai botnet of 100K+ IoT devices generated 1.2 Tbps, took down Twitter, Reddit, GitHub.',
    phases: ['Traffic Ramp', 'Flood Peak', 'Resource Saturation', 'Service Degradation']
  }
];

const COLOR_MAP = {
  red: { border: 'border-red-500/40', bg: 'bg-red-950/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/50', hover: 'hover:border-red-500/70', btn: 'bg-red-600/30 hover:bg-red-600/50 border-red-500 text-red-400' },
  cyan: { border: 'border-cyan-500/40', bg: 'bg-cyan-950/30', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50', hover: 'hover:border-cyan-500/70', btn: 'bg-cyan-600/30 hover:bg-cyan-600/50 border-cyan-500 text-cyan-400' },
  purple: { border: 'border-purple-500/40', bg: 'bg-purple-950/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/50', hover: 'hover:border-purple-500/70', btn: 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-500 text-purple-400' },
  orange: { border: 'border-orange-500/40', bg: 'bg-orange-950/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/50', hover: 'hover:border-orange-500/70', btn: 'bg-orange-600/30 hover:bg-orange-600/50 border-orange-500 text-orange-400' },
};

const SEVERITY_BADGE = {
  CRITICAL: 'bg-red-600/40 text-red-300 border-red-500',
  HIGH: 'bg-orange-600/40 text-orange-300 border-orange-500',
  MEDIUM: 'bg-yellow-600/40 text-yellow-300 border-yellow-500',
};

function AttackControlPanel({ onTriggerAttack, isAttacking, activeAttackId, activePhase }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full">
      <h2 className="text-lg font-bold mb-3 text-cyber-green uppercase tracking-widest border-b border-cyber-green/30 pb-2">
        Attack Scenarios
      </h2>
      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {ATTACK_DEFS.map((attack) => {
          const c = COLOR_MAP[attack.color];
          const isExpanded = expandedId === attack.id;
          const isActive = activeAttackId === attack.id && isAttacking;

          return (
            <div key={attack.id} className={`border rounded-lg transition-all duration-300 ${c.border} ${c.bg} ${c.hover}`}>
              {/* Header — always visible */}
              <button
                onClick={() => toggleExpand(attack.id)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${c.text}`}>{attack.icon}</span>
                  <div>
                    <div className={`font-bold text-sm ${c.text}`}>{attack.name}</div>
                    <div className="text-xs text-gray-500 font-mono">MITRE {attack.mitre}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${SEVERITY_BADGE[attack.severity]}`}>
                    {attack.severity}
                  </span>
                  {isExpanded ? <FaChevronUp className="text-gray-500 text-xs" /> : <FaChevronDown className="text-gray-500 text-xs" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-gray-800/50 pt-3 animate-fade-in">
                  {/* Description */}
                  <p className="text-xs text-gray-400 leading-relaxed">{attack.description}</p>

                  {/* Target Services */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1 font-bold">Target Services</div>
                    <div className="flex flex-wrap gap-1">
                      {attack.targetServices.map((t, i) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Tools */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1 font-bold">Attacker Tools</div>
                    <div className="flex flex-wrap gap-1">
                      {attack.toolsUsed.map((t, i) => (
                        <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-mono border ${c.badge}`}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* What to Look For */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1 font-bold flex items-center gap-1">
                      <FaInfoCircle /> Detection Indicators
                    </div>
                    <ul className="text-xs text-gray-400 space-y-1 pl-3">
                      {attack.indicators.map((ind, i) => (
                        <li key={i} className="list-disc">{ind}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Real-World Example */}
                  <div className="text-xs p-2 bg-black/40 rounded border border-gray-800">
                    <span className="text-gray-500 font-bold uppercase">Real-World: </span>
                    <span className="text-gray-400">{attack.realWorldExample}</span>
                  </div>

                  {/* Phase Progress */}
                  {isActive && activePhase !== null && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1 font-bold">Attack Progress</div>
                      <div className="flex gap-1">
                        {attack.phases.map((phase, i) => (
                          <div
                            key={i}
                            className={`flex-1 text-center py-1 rounded text-xs font-mono transition-all duration-500 ${
                              i < activePhase ? `${c.badge} border opacity-60` :
                              i === activePhase ? `${c.badge} border animate-pulse font-bold` :
                              'bg-gray-900 text-gray-600 border border-gray-800'
                            }`}
                          >
                            {phase}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Launch Button */}
                  <button
                    onClick={() => onTriggerAttack(attack.id)}
                    disabled={isAttacking}
                    className={`w-full py-2 rounded border font-mono text-sm font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 ${c.btn} disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]`}
                  >
                    <FaPlay className="text-xs" />
                    {isActive ? 'Simulation Running...' : 'Launch Simulation'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttackControlPanel;
