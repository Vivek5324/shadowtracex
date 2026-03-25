import React, { useState } from 'react';
import { FaSearch, FaCog, FaGlobe, FaServer, FaShieldAlt, FaExclamationTriangle, FaTimes, FaSave } from 'react-icons/fa';
import { checkIp, getApiKey, setApiKey, hasApiKey, getCategoryNames } from '../services/abuseipdbService';

function IpLookupPanel({ prefillIp, onClearPrefill }) {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState(getApiKey());

  // If prefillIp changes from parent (clicked IP in timeline), use it
  React.useEffect(() => {
    if (prefillIp) {
      setIp(prefillIp);
      handleLookup(prefillIp);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillIp]);

  const handleLookup = async (overrideIp) => {
    const target = overrideIp || ip;
    if (!target.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await checkIp(target.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = () => {
    setApiKey(keyInput);
    setShowSettings(false);
    setError('');
  };

  const getScoreColor = (score) => {
    if (score === 0) return 'text-green-400';
    if (score < 25) return 'text-yellow-400';
    if (score < 50) return 'text-orange-400';
    if (score < 75) return 'text-red-400';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score === 0) return 'bg-green-500';
    if (score < 25) return 'bg-yellow-500';
    if (score < 50) return 'bg-orange-500';
    if (score < 75) return 'bg-red-500';
    return 'bg-red-600';
  };

  return (
    <div className="glass-panel p-4 rounded-lg flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-purple-500/30 pb-2 mb-3">
        <h2 className="text-lg font-bold text-purple-400 uppercase tracking-widest flex items-center">
          <FaGlobe className="mr-2" />
          IP Intel
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-500 hover:text-purple-400 transition-colors p-1"
          title="API Key Settings"
        >
          <FaCog />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-3 p-3 bg-gray-900/80 border border-purple-500/30 rounded">
          <label className="text-xs text-gray-400 block mb-1">AbuseIPDB API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter API key..."
              className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-sm font-mono text-gray-300 focus:border-purple-500 outline-none"
            />
            <button
              onClick={handleSaveKey}
              className="bg-purple-600/30 border border-purple-500 text-purple-400 px-2 py-1 rounded text-xs hover:bg-purple-600/50 transition-colors flex items-center"
            >
              <FaSave className="mr-1" /> Save
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Free: 1,000 checks/day • <a href="https://www.abuseipdb.com/account/api" target="_blank" rel="noopener" className="text-purple-500 underline">Get key</a>
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="Enter IP address..."
          className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 focus:border-purple-500 outline-none"
        />
        <button
          onClick={() => handleLookup()}
          disabled={loading}
          className="bg-purple-600/30 border border-purple-500 text-purple-400 px-3 py-2 rounded text-sm hover:bg-purple-600/50 transition-colors disabled:opacity-40"
        >
          {loading ? '...' : <FaSearch />}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-xs font-mono p-2 bg-red-900/20 border border-red-800/50 rounded mb-2">
          {error}
        </div>
      )}

      {/* No Key Warning */}
      {!hasApiKey() && !showSettings && !result && !error && (
        <div className="text-yellow-500/70 text-xs font-mono text-center py-3 flex flex-col items-center gap-1">
          <FaExclamationTriangle />
          <span>No API key configured</span>
          <button onClick={() => setShowSettings(true)} className="text-purple-400 underline">Add key</button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex-grow overflow-y-auto space-y-2 text-sm">
          {/* Confidence Score */}
          <div className="text-center py-2">
            <div className={`text-3xl font-mono font-bold ${getScoreColor(result.abuseConfidenceScore)}`}>
              {result.abuseConfidenceScore}%
            </div>
            <div className="text-xs text-gray-500 uppercase">Abuse Confidence</div>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getScoreBg(result.abuseConfidenceScore)}`}
                style={{ width: `${result.abuseConfidenceScore}%` }}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-1 text-xs font-mono">
            <div className="text-gray-500">IP</div>
            <div className="text-gray-300">{result.ip} (v{result.ipVersion})</div>

            <div className="text-gray-500">Country</div>
            <div className="text-gray-300">{result.countryCode}</div>

            <div className="text-gray-500">ISP</div>
            <div className="text-gray-300 truncate" title={result.isp}>{result.isp}</div>

            <div className="text-gray-500">Domain</div>
            <div className="text-gray-300 truncate" title={result.domain}>{result.domain}</div>

            <div className="text-gray-500">Usage</div>
            <div className="text-gray-300">{result.usageType}</div>

            <div className="text-gray-500">Reports</div>
            <div className="text-gray-300">{result.totalReports} ({result.numDistinctUsers} users)</div>

            <div className="text-gray-500">Last Seen</div>
            <div className="text-gray-300">{result.lastReportedAt ? new Date(result.lastReportedAt).toLocaleDateString() : 'Never'}</div>

            <div className="text-gray-500">Whitelisted</div>
            <div className={result.isWhitelisted ? 'text-green-400' : 'text-gray-300'}>
              {result.isWhitelisted ? 'Yes' : 'No'}
            </div>
          </div>

          {/* Recent Reports */}
          {result.reports.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 uppercase mb-1 border-t border-gray-800 pt-2">Recent Reports</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {result.reports.map((r, i) => (
                  <div key={i} className="text-xs font-mono p-1.5 bg-black/50 rounded border border-gray-800">
                    <div className="flex justify-between text-gray-500">
                      <span>{new Date(r.reportedAt).toLocaleString()}</span>
                      <span>{r.reporterCountryCode}</span>
                    </div>
                    <div className="text-yellow-400/80 mt-0.5">
                      {getCategoryNames(r.categories).join(', ')}
                    </div>
                    {r.comment && <div className="text-gray-400 mt-0.5 truncate">{r.comment}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !error && hasApiKey() && (
        <div className="flex-grow flex items-center justify-center text-gray-600 text-xs font-mono">
          Enter an IP to check its reputation
        </div>
      )}
    </div>
  );
}

export default IpLookupPanel;
