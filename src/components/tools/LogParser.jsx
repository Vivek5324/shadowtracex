import React, { useState, useRef } from 'react';
import { FaFileAlt, FaUpload, FaFilter, FaChartBar, FaTrash } from 'react-icons/fa';

const LOG_PATTERNS = {
  apache: {
    name: 'Apache/Nginx Access Log',
    regex: /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+\S+"\s+(\d{3})\s+(\d+|-)/,
    parse: (match) => ({
      ip: match[1],
      timestamp: match[2],
      method: match[3],
      uri: match[4],
      status: parseInt(match[5]),
      size: match[6] === '-' ? 0 : parseInt(match[6]),
    }),
  },
  syslog: {
    name: 'Syslog',
    regex: /^(\w+\s+\d+\s+[\d:]+)\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?:\s+(.+)/,
    parse: (match) => ({
      timestamp: match[1],
      host: match[2],
      service: match[3],
      pid: match[4] || '',
      message: match[5],
    }),
  },
  authLog: {
    name: 'Auth Log',
    regex: /^(\w+\s+\d+\s+[\d:]+)\s+(\S+)\s+(\S+?)(?:\[(\d+)\])?:\s+(.*(?:Failed|Accepted|Invalid|error|session).+)/i,
    parse: (match) => ({
      timestamp: match[1],
      host: match[2],
      service: match[3],
      pid: match[4] || '',
      message: match[5],
      isAuth: true,
    }),
  },
  json: {
    name: 'JSON Log',
    regex: /^\s*\{/,
    parse: (match, line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { raw: line };
      }
    },
  },
};

function analyzeLogData(entries, format) {
  const stats = {
    totalLines: entries.length,
    uniqueIPs: new Set(),
    statusCodes: {},
    methods: {},
    topPaths: {},
    suspiciousEntries: [],
    errorCount: 0,
    timeRange: { start: null, end: null },
  };

  entries.forEach(entry => {
    if (entry.ip) stats.uniqueIPs.add(entry.ip);
    if (entry.status) {
      stats.statusCodes[entry.status] = (stats.statusCodes[entry.status] || 0) + 1;
      if (entry.status >= 400) stats.errorCount++;
    }
    if (entry.method) {
      stats.methods[entry.method] = (stats.methods[entry.method] || 0) + 1;
    }
    if (entry.uri) {
      stats.topPaths[entry.uri] = (stats.topPaths[entry.uri] || 0) + 1;
    }

    // Detect suspicious patterns
    const suspicious = [];
    if (entry.uri && /(\.\.|\/etc\/|\/proc\/|cmd=|exec=|select\s|union\s|<script)/i.test(entry.uri)) {
      suspicious.push('Path traversal / injection attempt');
    }
    if (entry.uri && /(wp-login|xmlrpc|\.env|\.git|admin|phpmyadmin)/i.test(entry.uri)) {
      suspicious.push('Sensitive path probe');
    }
    if (entry.status === 401 || entry.status === 403) {
      suspicious.push('Access denied');
    }
    if (entry.message && /failed|invalid|error|denied|unauthorized/i.test(entry.message)) {
      suspicious.push('Authentication failure');
    }

    if (suspicious.length > 0) {
      stats.suspiciousEntries.push({ ...entry, flags: suspicious });
    }
  });

  stats.uniqueIPs = stats.uniqueIPs.size;
  stats.topPathsList = Object.entries(stats.topPaths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return stats;
}

function LogParser() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [format, setFormat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('stats');
  const [filterText, setFilterText] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseLog(text);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const parseLog = (text) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    let detectedFormat = null;
    let parsed = [];

    // Try each format
    for (const [key, fmt] of Object.entries(LOG_PATTERNS)) {
      const sample = lines.slice(0, 5);
      const matches = sample.filter(l => fmt.regex.test(l));
      if (matches.length >= 2 || (matches.length >= 1 && sample.length <= 2)) {
        detectedFormat = key;
        break;
      }
    }

    if (detectedFormat) {
      const fmt = LOG_PATTERNS[detectedFormat];
      parsed = lines.map((line, i) => {
        const match = line.match(fmt.regex);
        if (match) {
          return { lineNum: i + 1, ...fmt.parse(match, line), raw: line };
        }
        return { lineNum: i + 1, raw: line, unparsed: true };
      });
    } else {
      detectedFormat = 'raw';
      parsed = lines.map((line, i) => ({ lineNum: i + 1, raw: line, unparsed: true }));
    }

    setFormat(detectedFormat);
    setEntries(parsed);
    setStats(analyzeLogData(parsed, detectedFormat));
  };

  const handleSample = () => {
    const sample = `192.168.1.105 - - [26/Mar/2026:05:30:01 +0000] "GET /index.html HTTP/1.1" 200 3456
45.33.32.156 - - [26/Mar/2026:05:30:02 +0000] "POST /wp-login.php HTTP/1.1" 401 1234
45.33.32.156 - - [26/Mar/2026:05:30:03 +0000] "POST /wp-login.php HTTP/1.1" 401 1234
45.33.32.156 - - [26/Mar/2026:05:30:04 +0000] "POST /wp-login.php HTTP/1.1" 401 1234
45.33.32.156 - - [26/Mar/2026:05:30:05 +0000] "POST /wp-login.php HTTP/1.1" 401 1234
45.33.32.156 - - [26/Mar/2026:05:30:06 +0000] "POST /wp-login.php HTTP/1.1" 302 0
10.0.0.50 - - [26/Mar/2026:05:30:10 +0000] "GET /api/users HTTP/1.1" 200 8901
172.16.0.1 - - [26/Mar/2026:05:30:15 +0000] "GET /../../etc/passwd HTTP/1.1" 403 0
172.16.0.1 - - [26/Mar/2026:05:30:16 +0000] "GET /.env HTTP/1.1" 403 0
172.16.0.1 - - [26/Mar/2026:05:30:17 +0000] "GET /admin HTTP/1.1" 403 0
10.0.0.55 - - [26/Mar/2026:05:30:20 +0000] "GET /api/products HTTP/1.1" 200 12345
10.0.0.55 - - [26/Mar/2026:05:30:21 +0000] "POST /api/checkout HTTP/1.1" 200 567
192.168.1.200 - - [26/Mar/2026:05:30:25 +0000] "GET /phpmyadmin/index.php HTTP/1.1" 404 0
192.168.1.200 - - [26/Mar/2026:05:30:26 +0000] "GET /xmlrpc.php HTTP/1.1" 405 0
10.0.0.50 - - [26/Mar/2026:05:31:00 +0000] "GET /api/health HTTP/1.1" 200 15`;
    parseLog(sample);
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-400';
    if (status >= 500) return 'text-red-400';
    if (status >= 400) return 'text-orange-400';
    if (status >= 300) return 'text-yellow-400';
    return 'text-green-400';
  };

  const filteredEntries = filterText
    ? entries.filter(e => e.raw.toLowerCase().includes(filterText.toLowerCase()))
    : entries;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FaFileAlt className="text-green-400" />
        <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider">Log File Parser</h3>
      </div>

      {!stats ? (
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-green-500/50 transition-colors"
          >
            <FaUpload className="text-3xl text-gray-600 mx-auto mb-3" />
            <div className="text-sm text-gray-400">Click to upload a log file</div>
            <div className="text-xs text-gray-600 mt-1">Supports Apache, Nginx, Syslog, Auth logs, JSON</div>
          </div>
          <input ref={fileInputRef} type="file" accept=".log,.txt,.json,.csv" onChange={handleFile} className="hidden" />
          <button
            onClick={handleSample}
            className="px-4 py-2 bg-green-600/20 border border-green-500/50 rounded text-green-400 text-sm font-mono hover:bg-green-600/30 transition-colors"
          >
            Load Sample Log
          </button>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3 pr-1">
          {/* Format Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500">
              Format: <span className="text-green-400">{LOG_PATTERNS[format]?.name || 'Raw Text'}</span>
              &nbsp;• {entries.length} lines parsed
            </span>
            <button onClick={() => { setStats(null); setEntries([]); }} className="text-xs text-gray-500 hover:text-gray-300">
              <FaTrash className="inline mr-1" />Clear
            </button>
          </div>

          {/* Tab Switch */}
          <div className="flex gap-1 bg-black/40 rounded p-0.5">
            {['stats', 'suspicious', 'raw'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`flex-1 py-1.5 rounded text-xs font-mono uppercase transition-colors ${
                  view === tab ? 'bg-green-600/30 text-green-400' : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {tab === 'stats' ? '📊 Stats' : tab === 'suspicious' ? '⚠️ Threats' : '📋 Logs'}
              </button>
            ))}
          </div>

          {view === 'stats' && (
            <div className="space-y-3">
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/40 border border-gray-800 rounded p-2 text-center">
                  <div className="text-xl font-bold font-mono text-cyan-400">{stats.totalLines}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Total Lines</div>
                </div>
                <div className="bg-black/40 border border-gray-800 rounded p-2 text-center">
                  <div className="text-xl font-bold font-mono text-yellow-400">{stats.uniqueIPs}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Unique IPs</div>
                </div>
                <div className="bg-black/40 border border-gray-800 rounded p-2 text-center">
                  <div className={`text-xl font-bold font-mono ${stats.suspiciousEntries.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {stats.suspiciousEntries.length}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Threats</div>
                </div>
              </div>

              {/* Status Codes */}
              {Object.keys(stats.statusCodes).length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Status Codes</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(stats.statusCodes).sort().map(([code, count]) => (
                      <span key={code} className={`text-xs font-mono px-2 py-0.5 rounded bg-black/40 border border-gray-800 ${getStatusColor(parseInt(code))}`}>
                        {code}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Paths */}
              {stats.topPathsList?.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Top Requested Paths</div>
                  <div className="space-y-0.5">
                    {stats.topPathsList.map(([path, count], i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-gray-600 w-8 text-right">{count}×</span>
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500/50 rounded-full" style={{ width: `${(count / stats.topPathsList[0][1]) * 100}%` }} />
                        </div>
                        <span className="text-gray-400 truncate max-w-[200px]">{path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'suspicious' && (
            <div className="space-y-1.5">
              {stats.suspiciousEntries.length === 0 ? (
                <div className="text-center text-gray-500 py-8 font-mono text-sm">No suspicious entries detected ✓</div>
              ) : (
                stats.suspiciousEntries.map((entry, i) => (
                  <div key={i} className="p-2 bg-red-950/10 border border-red-500/20 rounded text-xs font-mono">
                    <div className="flex items-center gap-1 mb-1">
                      {entry.flags.map((f, j) => (
                        <span key={j} className="text-[10px] px-1 py-0.5 bg-red-500/20 text-red-400 rounded">{f}</span>
                      ))}
                    </div>
                    <div className="text-gray-400 break-all">{entry.raw}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {view === 'raw' && (
            <div className="space-y-1">
              <div className="relative mb-2">
                <FaFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter logs..."
                  className="w-full bg-black/80 border border-gray-800 rounded pl-7 pr-3 py-1 text-xs font-mono text-gray-400 outline-none focus:border-green-500/50"
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-0.5">
                {filteredEntries.slice(0, 200).map((entry, i) => (
                  <div key={i} className={`text-xs font-mono p-1 rounded ${
                    entry.unparsed ? 'text-gray-500' :
                    entry.status >= 400 ? 'text-orange-400 bg-orange-950/10' : 'text-gray-400'
                  }`}>
                    <span className="text-gray-600 mr-2">{entry.lineNum}</span>
                    {entry.raw}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LogParser;
