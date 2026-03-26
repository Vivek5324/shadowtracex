import React, { useState } from 'react';
import { FaLock, FaSearch, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSync } from 'react-icons/fa';

const SECURITY_HEADERS = [
  { name: 'Strict-Transport-Security', severity: 'high', description: 'HSTS — forces HTTPS connections, prevents downgrade attacks' },
  { name: 'Content-Security-Policy', severity: 'high', description: 'CSP — prevents XSS by controlling resource loading' },
  { name: 'X-Content-Type-Options', severity: 'medium', description: 'Prevents MIME-type sniffing attacks' },
  { name: 'X-Frame-Options', severity: 'medium', description: 'Prevents clickjacking by controlling iframe embedding' },
  { name: 'X-XSS-Protection', severity: 'low', description: 'Legacy XSS filter (deprecated but still checked)' },
  { name: 'Referrer-Policy', severity: 'medium', description: 'Controls referrer information sent in requests' },
  { name: 'Permissions-Policy', severity: 'medium', description: 'Controls browser features (camera, mic, geolocation)' },
  { name: 'Cross-Origin-Opener-Policy', severity: 'low', description: 'COOP — isolates browsing context from cross-origin popups' },
  { name: 'Cross-Origin-Resource-Policy', severity: 'low', description: 'CORP — controls cross-origin resource loading' },
  { name: 'Cross-Origin-Embedder-Policy', severity: 'low', description: 'COEP — controls cross-origin embedding' },
];

function SecurityHeadersScanner() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Use a CORS proxy approach — fetch through Vercel's API route or a public headers API
      // For demo, we'll use a public API
      const response = await fetch(`https://headers.scratchpad.run/api/headers?url=${encodeURIComponent(targetUrl)}`);
      
      if (!response.ok) {
        // Fallback: try direct fetch (works for some sites with permissive CORS)  
        throw new Error('PROXY_FAIL');
      }

      const data = await response.json();
      analyzeHeaders(data.headers || {}, targetUrl);
    } catch (proxyErr) {
      try {
        // Fallback: direct HEAD request (limited by CORS)
        const directResp = await fetch(targetUrl, { method: 'HEAD', mode: 'cors' });
        const headerMap = {};
        directResp.headers.forEach((value, key) => {
          headerMap[key] = value;
        });
        analyzeHeaders(headerMap, targetUrl);
      } catch {
        // If everything fails, do a simulated analysis with common patterns
        performOfflineAnalysis(targetUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeHeaders = (headerMap, targetUrl) => {
    const normalizedHeaders = {};
    Object.entries(headerMap).forEach(([key, value]) => {
      normalizedHeaders[key.toLowerCase()] = { original: key, value };
    });

    const checks = SECURITY_HEADERS.map(sh => {
      const found = normalizedHeaders[sh.name.toLowerCase()];
      return {
        ...sh,
        present: !!found,
        value: found?.value || null,
      };
    });

    const present = checks.filter(c => c.present).length;
    const total = checks.length;
    const grade = present >= 8 ? 'A' : present >= 6 ? 'B' : present >= 4 ? 'C' : present >= 2 ? 'D' : 'F';

    setResults({
      url: targetUrl,
      checks,
      grade,
      score: Math.round((present / total) * 100),
      present,
      total,
      server: normalizedHeaders['server']?.value || 'Not disclosed',
      poweredBy: normalizedHeaders['x-powered-by']?.value || null,
      allHeaders: normalizedHeaders,
    });
  };

  const performOfflineAnalysis = (targetUrl) => {
    setError('⚠ CORS restricted — showing analysis template. For full results, use the browser DevTools Network tab.');
    const checks = SECURITY_HEADERS.map(sh => ({
      ...sh,
      present: false,
      value: null,
    }));
    setResults({
      url: targetUrl,
      checks,
      grade: '?',
      score: 0,
      present: 0,
      total: checks.length,
      server: 'Unknown (CORS restricted)',
      poweredBy: null,
      allHeaders: {},
      limited: true,
    });
  };

  const gradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-400 border-green-500';
      case 'B': return 'text-cyan-400 border-cyan-500';
      case 'C': return 'text-yellow-400 border-yellow-500';
      case 'D': return 'text-orange-400 border-orange-500';
      case 'F': return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FaLock className="text-cyan-400" />
        <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">Security Headers</h3>
      </div>

      <form onSubmit={handleScan} className="flex gap-2 mb-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL (e.g. google.com)"
          className="flex-1 bg-black/80 border border-gray-800 rounded px-3 py-1.5 text-sm font-mono text-gray-300 focus:border-cyan-500/50 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-4 py-1.5 bg-cyan-600/30 border border-cyan-500 rounded text-cyan-400 text-sm font-mono font-bold hover:bg-cyan-600/50 transition-colors disabled:opacity-30"
        >
          {loading ? <FaSync className="animate-spin" /> : <><FaSearch className="inline mr-1" />Scan</>}
        </button>
      </form>

      {error && (
        <div className="text-yellow-400 text-xs p-2 bg-yellow-950/20 border border-yellow-500/30 rounded mb-3 font-mono">{error}</div>
      )}

      {results && (
        <div className="flex-grow overflow-y-auto space-y-3 pr-1">
          {/* Grade Card */}
          <div className="flex items-center gap-4 p-3 bg-black/40 border border-gray-800 rounded">
            <div className={`text-4xl font-bold font-mono w-14 h-14 rounded-lg border-2 flex items-center justify-center ${gradeColor(results.grade)}`}>
              {results.grade}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-300 font-mono truncate">{results.url}</div>
              <div className="text-xs text-gray-500 mt-1">
                {results.present}/{results.total} headers present • Score: {results.score}%
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${results.score}%` }} />
              </div>
            </div>
          </div>

          {results.server && (
            <div className="text-xs font-mono text-gray-500">
              Server: <span className="text-gray-400">{results.server}</span>
              {results.poweredBy && <> • X-Powered-By: <span className="text-orange-400">{results.poweredBy}</span> (⚠ should be hidden)</>}
            </div>
          )}

          {/* Header Checks */}
          <div className="space-y-1">
            {results.checks.map((check, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded border ${
                check.present ? 'border-green-500/20 bg-green-950/10' : 'border-red-500/20 bg-red-950/10'
              }`}>
                {check.present ? <FaCheckCircle className="text-green-400 text-sm flex-shrink-0" /> : <FaTimesCircle className="text-red-400 text-sm flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-gray-300">{check.name}</div>
                  <div className="text-[10px] text-gray-500">{check.description}</div>
                  {check.value && <div className="text-[10px] font-mono text-gray-600 truncate mt-0.5">{check.value}</div>}
                </div>
                <span className={`text-[10px] px-1 py-0.5 rounded font-mono ${
                  check.severity === 'high' ? 'text-red-400 bg-red-500/20' :
                  check.severity === 'medium' ? 'text-yellow-400 bg-yellow-500/20' :
                  'text-gray-400 bg-gray-500/20'
                }`}>{check.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="flex-grow flex items-center justify-center text-gray-600 font-mono text-sm">
          Enter a URL to analyze its security headers
        </div>
      )}
    </div>
  );
}

export default SecurityHeadersScanner;
