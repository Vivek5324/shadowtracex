import React, { useEffect, useRef, useState } from 'react';
import { FaCopy, FaFilter } from 'react-icons/fa';

/**
 * Structured log viewer showing realistic SIEM-style entries.
 * Each log has: timestamp, sourceIp, sourcePort, targetIp, targetUri, method, statusCode, protocol, details, rule
 */
function LiveAttackTimeline({ logs, onIpClick }) {
  const terminalRef = useRef(null);
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-950/20';
      case 'alert': return 'border-l-orange-500 bg-orange-950/10';
      case 'warning': return 'border-l-yellow-500 bg-yellow-950/10';
      case 'response': return 'border-l-green-500 bg-green-950/10';
      case 'info': 
      default: return 'border-l-cyan-500/30 bg-transparent';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'POST': return 'text-orange-400';
      case 'GET': return 'text-cyan-400';
      case 'PUT': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      case 'SYN': return 'text-purple-400';
      case 'DNS': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (code) => {
    if (!code) return '';
    if (code >= 200 && code < 300) return 'text-green-400';
    if (code >= 300 && code < 400) return 'text-yellow-400';
    if (code >= 400 && code < 500) return 'text-orange-400';
    if (code >= 500) return 'text-red-400';
    return 'text-gray-400';
  };

  const filteredLogs = logs.filter(log => {
    const matchesText = !filter || 
      (log.message && log.message.toLowerCase().includes(filter.toLowerCase())) ||
      (log.sourceIp && log.sourceIp.includes(filter)) ||
      (log.targetUri && log.targetUri.toLowerCase().includes(filter.toLowerCase())) ||
      (log.rule && log.rule.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesText && matchesSeverity;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs.map(log => {
      if (log.isStructured) {
        const status = log.statusCode ? ` → ${log.statusCode}` : '';
        return `[${log.time}] ${log.sourceIp}:${log.sourcePort} → ${log.targetIp}:${log.targetPort} ${log.method} ${log.targetUri}${status} | ${log.details}`;
      }
      return `[${log.time}] ${log.message}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full bg-black/60">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-2 mb-2">
        <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-widest flex items-center">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-2"></span>
          Live Intrusion Feed
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-600">{logs.length} entries</span>
          <button onClick={handleCopyLogs} className="text-gray-600 hover:text-cyan-400 transition-colors p-1" title="Copy logs">
            <FaCopy className="text-xs" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <FaFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by IP, URI, keyword..."
            className="w-full bg-black/80 border border-gray-800 rounded px-6 py-1 text-xs font-mono text-gray-400 focus:border-cyan-500/50 outline-none"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-black/80 border border-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-400 focus:border-cyan-500/50 outline-none"
        >
          <option value="ALL">All</option>
          <option value="critical">Critical</option>
          <option value="alert">Alert</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="response">Response</option>
        </select>
      </div>

      {/* Log Entries */}
      <div 
        ref={terminalRef}
        className="flex-grow overflow-y-auto space-y-0.5 terminal-text pr-1"
      >
        {filteredLogs.length === 0 && logs.length === 0 ? (
          <div className="text-gray-600 italic text-sm py-8 text-center">
            No malicious activity detected. Monitoring...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-gray-600 italic text-sm py-4 text-center">
            No logs match filter
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className={`animate-fade-in border-l-2 pl-2 py-0.5 font-mono text-xs ${getSeverityColor(log.severity)}`}
            >
              {log.isStructured ? (
                // Structured log entry
                <div className="flex flex-wrap items-baseline gap-x-1">
                  <span className="text-gray-600">[{log.time}]</span>
                  <span 
                    className="text-yellow-300 cursor-pointer hover:underline hover:text-yellow-100" 
                    onClick={() => onIpClick && onIpClick(log.sourceIp)}
                    title="Click to lookup this IP"
                  >
                    {log.sourceIp}:{log.sourcePort}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className="text-gray-500">{log.targetIp}:{log.targetPort}</span>
                  <span className={`font-bold ${getMethodColor(log.method)}`}>{log.method}</span>
                  <span className="text-white/80">{log.targetUri}</span>
                  {log.protocol && <span className="text-gray-600">{log.protocol}</span>}
                  {log.statusCode && (
                    <>
                      <span className="text-gray-600">→</span>
                      <span className={`font-bold ${getStatusColor(log.statusCode)}`}>{log.statusCode}</span>
                    </>
                  )}
                  {log.details && (
                    <span className="text-gray-500">| {log.details}</span>
                  )}
                </div>
              ) : log.isRule ? (
                // IDS/Firewall rule trigger
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-600">[{log.time}]</span>
                  <span className="text-red-400 font-bold">⚠ RULE:</span>
                  <span className="text-red-300">{log.message}</span>
                </div>
              ) : log.isResponse ? (
                // Auto-response log
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-600">[{log.time}]</span>
                  <span className="text-green-400 font-bold">✓ DEFENSE:</span>
                  <span className="text-green-300">{log.message}</span>
                </div>
              ) : (
                // Plain text log
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-600">[{log.time}]</span>
                  <span className={`${log.type_class || 'text-gray-400'}`}>{log.message}</span>
                </div>
              )}
            </div>
          ))
        )}
        <div className="animate-blink inline-block text-cyan-400 mt-1">_</div>
      </div>
    </div>
  );
}

export default LiveAttackTimeline;
