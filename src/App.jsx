import React, { useState, useRef, useCallback } from 'react';
import { FaSkull, FaServer, FaSearch, FaHistory, FaBug, FaLock, FaGlobe, FaShieldAlt } from 'react-icons/fa';
import AttackControlPanel from './components/AttackControlPanel';
import LiveAttackTimeline from './components/LiveAttackTimeline';
import AlertSystem from './components/AlertSystem';
import AutoResponsePanel from './components/AutoResponsePanel';
import RiskMeter from './components/RiskMeter';
import KillChainVisualizer from './components/KillChainVisualizer';
import IpLookupPanel from './components/IpLookupPanel';
import ToolkitPage from './components/ToolkitPage';
import { checkIp, hasApiKey } from './services/abuseipdbService';

// ── Randomization helpers ──────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIp() {
  // Known highly-abused IP ranges confirmed to return high abuse scores on AbuseIPDB
  const pools = [
    // 45.33.0.0/16 — Linode, high-volume scanning activity
    () => `45.33.${randInt(0, 255)}.${randInt(1, 254)}`,
    // 172.232.0.0/15 — Linode global data centers, broad abuse reports
    () => `172.${randChoice([232, 233])}.${randInt(0, 255)}.${randInt(1, 254)}`,
  ];
  return randChoice(pools)();
}

function randomEphemeralPort() {
  return randInt(32768, 65535);
}

const SERVER_IP = '10.0.1.5';

const USER_AGENTS = {
  brute_force: ['python-requests/2.28.0', 'Go-http-client/1.1', 'curl/7.88.1', 'Hydra/9.4'],
  port_scan: ['Nmap Scripting Engine', 'masscan/1.3', 'Mozilla/5.0 (compatible; Nmap)', 'ZmapBot/1.0'],
  apt_attack: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Microsoft-CryptoAPI/10.0', 'PSEXEC.EXE'],
  botnet: ['Mozilla/5.0 (Linux; Android 8.0)', 'IoT-Agent/1.0', 'MiAI/2.0', 'Dalvik/2.1.0'],
};

function buildAttackScenarios(attackerIp, targetIp = '10.0.1.5') {
  const port = randomEphemeralPort;

  return {
    brute_force: {
      steps: [
        // Phase 0: Recon
        { phase: 0, delay: 300, severity: 'info', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'GET', targetUri: '/login', protocol: 'HTTP/1.1', statusCode: 200, details: `UA: ${randChoice(USER_AGENTS.brute_force)}` },
        { phase: 0, delay: 800, severity: 'info', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'GET', targetUri: '/wp-login.php', protocol: 'HTTP/1.1', statusCode: 200, details: 'WordPress login page discovered' },
        // Phase 1: Credential Spray
        { phase: 1, delay: 1500, severity: 'warning', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/wp-login.php', protocol: 'HTTP/1.1', statusCode: 401, details: 'Payload: log=admin&pwd=password123' },
        { phase: 1, delay: 1900, severity: 'warning', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/wp-login.php', protocol: 'HTTP/1.1', statusCode: 401, details: 'Payload: log=admin&pwd=admin123' },
        { phase: 1, delay: 2300, severity: 'warning', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/wp-login.php', protocol: 'HTTP/1.1', statusCode: 401, details: 'Payload: log=administrator&pwd=letmein' },
        // Phase 2: Execution / Auth Bypass
        { phase: 2, delay: 3800, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/wp-login.php', protocol: 'HTTP/1.1', statusCode: 401, details: 'Payload: log=admin&pwd=P@ssw0rd!2024' },
        { phase: 2, delay: 4300, severity: 'critical', isRule: true, message: `SID:2019284 ET BRUTE_FORCE Multiple login failures from ${attackerIp} (6 attempts in 3s)` },
        // Phase 3: Lateral Access Match
        { phase: 3, delay: 5000, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/wp-login.php', protocol: 'HTTP/1.1', statusCode: 302, details: 'Payload: log=admin&pwd=Summer2024! — CREDENTIAL MATCH' },
        { phase: 3, delay: 5500, severity: 'critical', isRule: true, message: `SID:2024531 ET POLICY Successful Login After Multiple Failures from ${attackerIp}` },
        // Phase 4: Data Exfil / Impact
        { phase: 4, delay: 6500, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/wp-admin/admin-ajax.php', protocol: 'HTTP/1.1', statusCode: 200, details: 'Plugin installation: webshell.zip uploaded' },
        { phase: 4, delay: 7200, severity: 'critical', structured: true, sourceIp: targetIp, sourcePort: port(), targetIp: attackerIp, targetPort: 4444, method: 'TCP', targetUri: 'Reverse Shell', protocol: 'TCP', statusCode: null, details: 'Reverse shell opened. Full server compromise.' },
      ],
      alert: { level: 'HIGH', message: `BRUTE FORCE DETECTED — ${attackerIp} achieved login after 8 failed attempts. Target: /wp-login.php` },
      responses: [
        `IP ${attackerIp} blocked by WAF (rule: brute-force-threshold-exceeded)`,
        `Active session from ${attackerIp} terminated and token invalidated`,
        'Account "admin" locked for 30 minutes, MFA enforcement triggered'
      ],
      riskBump: 15
    },

    port_scan: {
      steps: [
        // Phase 0: Host discovery
        { phase: 0, delay: 300, severity: 'info', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 0, method: 'SYN', targetUri: 'ICMP Echo Request', protocol: 'ICMP', statusCode: null, details: 'Host discovery ping' },
        { phase: 0, delay: 600, severity: 'info', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 80, method: 'SYN', targetUri: 'TCP/80', protocol: 'TCP', statusCode: null, details: 'SYN probe — host alive' },
        // Phase 1: Port probing
        { phase: 1, delay: 1200, severity: 'warning', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 22, method: 'SYN', targetUri: 'TCP/22', protocol: 'TCP', statusCode: null, details: 'Port 22 OPEN (SSH)' },
        { phase: 1, delay: 1500, severity: 'warning', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 3306, method: 'SYN', targetUri: 'TCP/3306', protocol: 'TCP', statusCode: null, details: 'Port 3306 OPEN (MySQL) — EXPOSED' },
        // Phase 2: Execution / Service detection
        { phase: 2, delay: 3000, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 3306, method: 'SYN', targetUri: 'MySQL/8.0.35', protocol: 'TCP', statusCode: null, details: 'MySQL version exposed — allows remote connections' },
        { phase: 2, delay: 3400, severity: 'alert', isRule: true, message: `SID:2024897 ET SCAN Nmap SYN Scan detected from ${attackerIp} — 4 ports in 1.1s` },
        // Phase 3: Privilege Escalation
        { phase: 3, delay: 4200, severity: 'info', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 0, method: 'SYN', targetUri: 'OS Detection', protocol: 'TCP', statusCode: null, details: 'OS fingerprint: Linux 5.15 (Ubuntu 22.04 LTS) — 95% confidence' },
        // Phase 4: Data Exfil
        { phase: 4, delay: 5000, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 3306, method: 'GET', targetUri: 'SELECT * FROM users', protocol: 'TCP', statusCode: null, details: 'MySQL authentication bypass exploited (CVE-2022-XXXX)' },
        { phase: 4, delay: 5800, severity: 'critical', structured: true, sourceIp: targetIp, sourcePort: port(), targetIp: attackerIp, targetPort: 21, method: 'FTP', targetUri: 'STOR db_dump.sql', protocol: 'FTP', statusCode: null, details: 'Database exfiltrated via outbound FTP (4.2 GB)' },
      ],
      alert: { level: 'MEDIUM', message: `PORT SCAN COMPLETED — ${attackerIp} mapped 4 open ports. MySQL 3306 exposed to internet.` },
      responses: [
        `Firewall rule added: DROP all from ${attackerIp}`,
        'Port 3306 access restricted to localhost only (iptables updated)',
      ],
      riskBump: 8
    },

    apt_attack: {
      steps: [
        // Phase 0: Initial access
        { phase: 0, delay: 500, severity: 'info', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/api/v1/upload', protocol: 'HTTP/1.1', statusCode: 200, details: 'File upload: report_Q4.docx (contains macro)' },
        { phase: 0, delay: 1800, severity: 'alert', isRule: true, message: 'SID:2028331 ET MALWARE CobaltStrike Beacon Detected — outbound HTTPS to non-standard port' },
        // Phase 1: Execution / C2
        { phase: 1, delay: 2800, severity: 'critical', structured: true, sourceIp: targetIp, sourcePort: port(), targetIp: attackerIp, targetPort: 8443, method: 'GET', targetUri: '/beacon', protocol: 'HTTPS', statusCode: 200, details: 'C2 callback — Cobalt Strike beacon initialized' },
        // Phase 2: Privilege escalation
        { phase: 2, delay: 4800, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 389, method: 'GET', targetUri: 'LDAP query — Domain Admins', protocol: 'LDAP', statusCode: null, details: 'Mimikatz: LSASS dump → extracted domain admin hash' },
        { phase: 2, delay: 5500, severity: 'critical', isRule: true, message: 'SID:2029113 ET EXPLOIT Mimikatz LSASS Access Detected on DB_SERVER_01' },
        // Phase 3: Lateral Movement
        { phase: 3, delay: 6500, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: port(), targetIp, targetPort: 445, method: 'SYN', targetUri: 'SMB/PSEXEC', protocol: 'TCP', statusCode: null, details: 'PsExec lateral movement → DB_SERVER_01 (VLAN 3)' },
        // Phase 4: Exfiltration
        { phase: 4, delay: 7200, severity: 'critical', structured: true, sourceIp: attackerIp, sourcePort: 53, targetIp, targetPort: 53, method: 'DNS', targetUri: 'TXT dXNlcl9kYXRh.data.evil.com', protocol: 'DNS', statusCode: null, details: 'DNS exfil ongoing — customer_records.sql.gz (estimated 2.4MB)' },
        { phase: 4, delay: 7800, severity: 'critical', isRule: true, message: 'SID:2031442 ET EXFIL DNS Tunneling Detected — anomalous TXT query volume to data.evil.com' },
      ],
      alert: { level: 'CRITICAL', message: `APT DETECTED — C2 beacon to ${attackerIp}, lateral movement in VLAN 3, Mimikatz credential dump, DNS exfiltration active. DB integrity compromised.` },
      responses: [
        'VLAN 3 network isolated — all inter-VLAN routing disabled',
        `Outbound DNS to ${attackerIp} blocked at perimeter firewall`,
        'Domain admin password reset initiated, all Kerberos tickets invalidated'
      ],
      riskBump: 40
    },

    botnet: {
      steps: [
        // Phase 0: Traffic ramp
        { phase: 0, delay: 300, severity: 'info', structured: true, sourceIp: randomIp(), sourcePort: port(), targetIp, targetPort: 443, method: 'GET', targetUri: '/api/v1/products', protocol: 'HTTP/1.1', statusCode: 200, details: `UA: ${randChoice(USER_AGENTS.botnet)} | RPS: 150→300` },
        { phase: 0, delay: 1300, severity: 'warning', structured: true, sourceIp: randomIp(), sourcePort: port(), targetIp, targetPort: 443, method: 'POST', targetUri: '/api/v1/checkout', protocol: 'HTTP/1.1', statusCode: 200, details: `RPS: 800 | Load balancer: 45% | UA: ${randChoice(USER_AGENTS.botnet)}` },
        // Phase 1: Flood peak
        { phase: 1, delay: 2000, severity: 'alert', structured: true, sourceIp: randomIp(), sourcePort: port(), targetIp, targetPort: 443, method: 'GET', targetUri: '/api/v1/products', protocol: 'HTTP/1.1', statusCode: 200, details: 'RPS: 5,200 | 312 unique source IPs | Load balancer: 72%' },
        { phase: 1, delay: 2500, severity: 'alert', isRule: true, message: 'SID:2023511 ET DOS HTTP Flood — request rate exceeds 5000/s threshold' },
        // Phase 2: Resource saturation
        { phase: 2, delay: 3800, severity: 'critical', structured: true, sourceIp: randomIp(), sourcePort: port(), targetIp, targetPort: 443, method: 'GET', targetUri: '/api/v1/products', protocol: 'HTTP/1.1', statusCode: 503, details: 'RPS: 24,100 | Load balancer: 96% | Connection pool exhausted' },
        { phase: 2, delay: 4800, severity: 'critical', structured: true, sourceIp: randomIp(), sourcePort: port(), targetIp, targetPort: 443, method: 'SYN', targetUri: 'SYN Flood', protocol: 'TCP', statusCode: null, details: 'SYN flood detected — 42,000 half-open connections, SYN backlog full' },
        // Phase 3: Service degradation
        { phase: 3, delay: 5500, severity: 'critical', structured: true, sourceIp: randomIp(), sourcePort: port(), targetIp, targetPort: 443, method: 'GET', targetUri: '/', protocol: 'HTTP/1.1', statusCode: 502, details: 'Gateway timeout — backend servers unresponsive, p99 latency: 32s' },
        { phase: 3, delay: 6000, severity: 'critical', isRule: true, message: 'CRITICAL: All backend servers marked as DOWN — health checks failing for 30s' },
        // Phase 4: Impact Data Loss
        { phase: 4, delay: 6600, severity: 'critical', isRule: true, message: `SID:2010045 ET DOS Possible SYN Flood or volumetric attack — Network degradation critical` },
        { phase: 4, delay: 7200, severity: 'critical', structured: true, sourceIp: targetIp, sourcePort: port(), targetIp, targetPort: 443, method: 'HTTP', targetUri: 'Health Check', protocol: 'HTTP', statusCode: 503, details: 'Service offline. Global load balancer routing failed. Total outage.' },
      ],
      alert: { level: 'CRITICAL', message: `DDoS BOTNET STRIKE — 24,100+ RPS from 1,847 distributed IPs. HTTP flood + SYN flood. All backend servers DOWN.` },
      responses: [
        'Traffic rerouted to DDoS scrubbing center (Cloudflare/Akamai)',
        'Rate limiting applied: 50 req/min per IP globally',
        'GeoIP blocking enabled for top attacking regions'
      ],
      riskBump: 30
    }
  };
}


// ── Main App ──────────────────────────────────────────────────────────

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isDefenseEnabled, setIsDefenseEnabled] = useState(true);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [riskPercentage, setRiskPercentage] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activeAttackId, setActiveAttackId] = useState(null);
  const [activePhase, setActivePhase] = useState(null);
  const [lookupIp, setLookupIp] = useState('');
  
  const logCounterRef = useRef(0);
  const timeoutRefs = useRef([]);

  const appState = { logs, alerts, responses, riskPercentage };

  const getLogTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const addLog = useCallback((logEntry) => {
    logCounterRef.current += 1;
    setLogs(prev => [...prev, { ...logEntry, id: logCounterRef.current, time: getLogTime() }]);
  }, []);

  const handleIpClick = useCallback((ip) => {
    setLookupIp(ip);
  }, []);

  const handleAuthorize = useCallback((id, text) => {
    setPendingActions(prev => prev.filter(action => action.id !== id));
    setResponses(prev => [text, ...prev]);
    
    addLog({
      isResponse: true,
      severity: 'response',
      message: text,
    });
    
    setRiskPercentage(prev => Math.max(0, prev - 15));
    
    setIsBlocked(prev => {
      if (!prev) {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
        
        setTimeout(() => {
          setPendingActions([]);
          addLog({
            message: `━━━ THREAT NEUTRALIZED ━━━ ATTACK CHAIN BROKEN`,
            severity: 'response',
            type_class: 'text-green-400 font-bold glow-green'
          });
          setRiskPercentage(0);
          setIsAttacking(false);
        }, 800);
      }
      return true;
    });
  }, [addLog]);

  const handleTriggerAttack = useCallback((attackId, customTargetIp = '10.0.1.5') => {
    if (isAttacking) return;
    setIsAttacking(true);
    setIsBlocked(false);
    setActiveAttackId(attackId);
    setActivePhase(0);
    setPendingActions([]);
    setRiskPercentage(10);
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    const attackerIp = randomIp();
    const scenarios = buildAttackScenarios(attackerIp, customTargetIp);
    const scenario = scenarios[attackId];
    if (!scenario) return;

    addLog({
      message: `━━━ ATTACK DETECTED: ${attackId.toUpperCase().replace('_', ' ')} ━━━ Attacker: ${attackerIp} -> Target: ${customTargetIp}`,
      severity: 'info',
      type_class: 'text-cyan-400 font-bold'
    });

    scenario.steps.forEach(step => {
      const tId = setTimeout(() => {
        setActivePhase(step.phase);

        if (step.structured) {
          addLog({
            isStructured: true,
            severity: step.severity,
            sourceIp: step.sourceIp,
            sourcePort: step.sourcePort,
            targetIp: step.targetIp,
            targetPort: step.targetPort,
            method: step.method,
            targetUri: step.targetUri,
            protocol: step.protocol,
            statusCode: step.statusCode,
            details: step.details,
          });
          if (step.severity === 'alert' || step.severity === 'critical') {
             setRiskPercentage(prev => Math.min(100, prev + 15));
          }
        } else if (step.isRule) {
          addLog({
            isRule: true,
            severity: step.severity,
            message: step.message,
          });
          if (step.severity === 'alert' || step.severity === 'critical') {
             setRiskPercentage(prev => Math.min(100, prev + 15));
          }
        }
      }, step.delay);
      timeoutRefs.current.push(tId);
    });

    const maxDelay = Math.max(...scenario.steps.map(s => s.delay));

    const tAlert = setTimeout(() => {
      setAlerts(prev => [{ id: Date.now(), ...scenario.alert }, ...prev]);
      setRiskPercentage(prev => Math.min(100, prev + scenario.riskBump));
    }, maxDelay * 0.45);
    timeoutRefs.current.push(tAlert);

    if (isDefenseEnabled) {
      const tDef = setTimeout(() => {
        const pending = scenario.responses.map((resp, i) => ({
          id: Date.now() + i,
          text: resp,
        }));
        setPendingActions(prev => [...pending, ...prev]);
      }, maxDelay * 0.55);
      timeoutRefs.current.push(tDef);
    } else {
      const tUnblocked = setTimeout(() => {
        addLog({
          message: `━━━ FATAL BREACH: SYSTEM FULLY COMPROMISED ━━━ NO DEFENSES ACTIVE`,
          severity: 'critical',
          type_class: 'text-red-500 font-bold glow-red text-lg uppercase px-2 py-1 bg-red-950/50 border border-red-500 rounded mt-2 text-center'
        });
        setRiskPercentage(100);
        setIsAttacking(false);
      }, maxDelay + 1000);
      timeoutRefs.current.push(tUnblocked);
    }

    const tLookup = setTimeout(() => {
      if (hasApiKey()) {
        setLookupIp(attackerIp);
      }
    }, maxDelay * 0.4);
    timeoutRefs.current.push(tLookup);

    if (isDefenseEnabled) {
      const tFail = setTimeout(() => {
        setIsAttacking(false);
      }, maxDelay + 2500);
      timeoutRefs.current.push(tFail);
    }

  }, [isAttacking, addLog, isDefenseEnabled]);

  return (
    <div className="min-h-screen bg-cyber-black bg-grid-cyber text-gray-300 p-4 font-sans relative">
      <div className="scanline-overlay"></div>
      
      {/* Global Alert Banner */}
      {riskPercentage > 50 && (
        <div className="absolute top-0 left-0 w-full bg-red-600 text-white font-mono font-bold text-center py-1 z-50 animate-pulse tracking-[0.2em] shadow-[0_0_20px_rgba(255,0,0,0.8)] border-b border-red-400">
          ⚠️ CRITICAL ALERT: SYSTEM UNDER ACTIVE ATTACK ⚠️
        </div>
      )}

      {/* Header */}
      <header className={`mb-4 flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-3 border-cyber-gray gap-4 relative z-10 ${riskPercentage > 50 ? 'mt-8' : ''}`}>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-widest flex items-center shadow-text">
            <span className="text-cyber-green glow-green mr-2">SHADOWTRACE</span> X
          </h1>
          <p className="font-mono text-gray-400 text-sm mt-1 uppercase tracking-wide">Real-Time Cyber Warfare Simulation Dashboard</p>
        </div>
        
        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
          {/* Defense Mode Toggle & Navigation Container */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
            {/* Defense Mode Toggle */}
            <div className="flex items-center bg-black/40 border border-gray-800 rounded px-3 py-1.5 h-full w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-xs font-bold text-gray-400 mr-3 uppercase tracking-widest leading-none">Defense Mode</span>
              <div className="flex items-center">
                <button
                  onClick={() => setIsDefenseEnabled(!isDefenseEnabled)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                    isDefenseEnabled ? 'bg-cyber-green' : 'bg-red-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                      isDefenseEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`ml-3 text-xs font-bold font-mono leading-none ${isDefenseEnabled ? 'text-cyber-green' : 'text-red-500 animate-pulse'}`}>
                  {isDefenseEnabled ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>

            {/* Top-level Navigation */}
            <div className="flex bg-black/50 border border-gray-800 rounded p-1 w-full sm:w-auto justify-center sm:justify-start">
              <button 
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-1.5 text-sm font-mono uppercase transition-colors rounded ${activeView === 'dashboard' ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' : 'text-gray-500 hover:text-gray-300'}`}
              >
                SOC Dashboard
              </button>
              <button 
                onClick={() => setActiveView('toolkit')}
                className={`px-4 py-1.5 text-sm font-mono uppercase transition-colors rounded ${activeView === 'toolkit' ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Security Toolkit
              </button>
            </div>
          </div>

          <div className="text-right mt-1">
            <div className="font-mono text-sm">
              STATUS: <span className={riskPercentage > 50 ? "text-red-500 animate-pulse font-bold" : "text-cyber-green font-bold"}>
                {riskPercentage > 50 ? 'CRITICAL — UNDER ATTACK' : 'MONITORING'}
              </span>
            </div>
            <div className="font-mono text-xs text-gray-600 mt-1">
              {new Date().toLocaleDateString()} • {logs.length} log entries
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeView === 'dashboard' ? (
        <div className="grid grid-cols-12 gap-3" style={{ minHeight: 'calc(100vh - 130px)' }}>
          {/* Left Column: Risk + Attack Panel */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-3">
            <div style={{ minHeight: '180px' }}>
              <RiskMeter riskPercentage={riskPercentage} />
            </div>
            <div className="flex-grow">
              <AttackControlPanel 
                onTriggerAttack={handleTriggerAttack} 
                isAttacking={isAttacking}
                activeAttackId={activeAttackId}
                activePhase={activePhase}
              />
            </div>
          </div>

          {/* Center: Live Feed & Kill Chain */}
          <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col gap-3" style={{ minHeight: '500px' }}>
            {/* Predictive Kill Chain Visualizer */}
            <KillChainVisualizer 
              activePhase={activePhase} 
              isBlocked={isBlocked} 
              isAttacking={isAttacking} 
            />

            <div className="flex-grow">
              <LiveAttackTimeline logs={logs} onIpClick={handleIpClick} />
            </div>
          </div>

          {/* Right Column: IP Intel + Alerts + Responses */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
            <div style={{ minHeight: '300px' }}>
              <IpLookupPanel 
                prefillIp={lookupIp} 
                onClearPrefill={() => setLookupIp('')} 
              />
            </div>
            <div style={{ minHeight: '200px' }}>
              <AlertSystem alerts={alerts} />
            </div>
            <div style={{ minHeight: '200px' }}>
              {!isDefenseEnabled ? (
                <div className="glass-panel p-4 rounded-lg flex flex-col items-center justify-center h-full border-red-500/50">
                  <FaShieldAlt className="text-4xl text-red-600/50 mb-3 animate-pulse" />
                  <div className="text-red-500 font-bold tracking-widest uppercase mb-1">Defense Systems Offline</div>
                  <div className="text-gray-500 text-xs text-center">Threat neutralization disabled. Simulation running in observational mode.</div>
                </div>
              ) : (
                <AutoResponsePanel 
                  responses={responses} 
                  pendingActions={pendingActions}
                  onAuthorize={handleAuthorize}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <ToolkitPage appState={appState} />
      )}
    </div>
  );
}

export default App;
