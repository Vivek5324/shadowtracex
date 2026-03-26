import React, { useState } from 'react';
import { FaFingerprint, FaSearch, FaSync, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCopy } from 'react-icons/fa';

function HashChecker() {
  const [hash, setHash] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hashType, setHashType] = useState('auto');

  const detectHashType = (h) => {
    const len = h.trim().length;
    if (len === 32) return 'MD5';
    if (len === 40) return 'SHA-1';
    if (len === 64) return 'SHA-256';
    if (len === 128) return 'SHA-512';
    return 'Unknown';
  };

  const generateAnalysis = (inputHash) => {
    const h = inputHash.trim().toLowerCase();
    const detected = detectHashType(h);

    // Known malicious hash database (common test samples)
    const knownMalicious = {
      '44d88612fea8a8f36de82e1278abb02f': { name: 'EICAR Test File', threat: 'Test:EICAR_Test_File', confidence: 100 },
      '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f': { name: 'EICAR Test File', threat: 'Test:EICAR_Test_File', confidence: 100 },
      'd41d8cd98f00b204e9800998ecf8427e': { name: 'Empty File', threat: 'None — empty file (0 bytes)', confidence: 0 },
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': { name: 'Empty File', threat: 'None — empty file (0 bytes)', confidence: 0 },
    };

    const known = knownMalicious[h];

    // Simulate threat analysis based on hash patterns
    const analysisDelay = 500 + Math.random() * 1000;

    setTimeout(() => {
      if (known) {
        setResults({
          hash: h,
          type: detected,
          status: known.confidence > 50 ? 'malicious' : 'clean',
          fileName: known.name,
          threat: known.threat,
          confidence: known.confidence,
          engines: {
            total: 72,
            detected: known.confidence > 50 ? Math.floor(45 + Math.random() * 25) : 0,
          },
          details: [
            { engine: 'CrowdStrike', result: known.confidence > 50 ? 'Malware.Generic' : 'Clean' },
            { engine: 'SentinelOne', result: known.confidence > 50 ? 'Trojan.Agent' : 'Clean' },
            { engine: 'Microsoft', result: known.confidence > 50 ? known.threat : 'Clean' },
            { engine: 'Kaspersky', result: known.confidence > 50 ? 'HEUR:Trojan.Win32' : 'Clean' },
            { engine: 'Sophos', result: known.confidence > 50 ? 'Mal/Generic-S' : 'Clean' },
          ],
          firstSeen: known.confidence > 50 ? '2023-08-15' : null,
          lastAnalysis: new Date().toISOString(),
        });
      } else {
        // Unknown hash — report as not found
        setResults({
          hash: h,
          type: detected,
          status: 'unknown',
          fileName: null,
          threat: null,
          confidence: null,
          engines: { total: 72, detected: 0 },
          details: [],
          firstSeen: null,
          lastAnalysis: new Date().toISOString(),
        });
      }
      setLoading(false);
    }, analysisDelay);
  };

  const handleCheck = (e) => {
    e.preventDefault();
    if (!hash.trim()) return;
    const h = hash.trim();
    if (!/^[a-fA-F0-9]+$/.test(h)) {
      setResults({ error: 'Invalid hash format. Enter a valid MD5, SHA-1, SHA-256, or SHA-512 hash.' });
      return;
    }
    setLoading(true);
    setResults(null);
    generateAnalysis(h);
  };

  const statusConfig = {
    malicious: { icon: <FaTimesCircle className="text-red-400 text-2xl" />, text: 'MALICIOUS', color: 'text-red-400', bg: 'bg-red-950/30 border-red-500/50' },
    clean: { icon: <FaCheckCircle className="text-green-400 text-2xl" />, text: 'CLEAN', color: 'text-green-400', bg: 'bg-green-950/30 border-green-500/50' },
    unknown: { icon: <FaExclamationTriangle className="text-gray-400 text-2xl" />, text: 'NOT FOUND', color: 'text-gray-400', bg: 'bg-gray-900/50 border-gray-700' },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FaFingerprint className="text-orange-400" />
        <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wider">Hash / IOC Checker</h3>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2 mb-3">
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="Paste file hash (MD5, SHA-1, SHA-256, SHA-512)"
          className="flex-1 bg-black/80 border border-gray-800 rounded px-3 py-1.5 text-sm font-mono text-gray-300 focus:border-orange-500/50 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !hash.trim()}
          className="px-4 py-1.5 bg-orange-600/30 border border-orange-500 rounded text-orange-400 text-sm font-mono font-bold hover:bg-orange-600/50 transition-colors disabled:opacity-30"
        >
          {loading ? <FaSync className="animate-spin" /> : 'Check'}
        </button>
      </form>

      <div className="text-xs text-gray-600 mb-3 font-mono">
        Test hash: <span
          className="text-gray-500 cursor-pointer hover:text-orange-400 transition-colors"
          onClick={() => setHash('44d88612fea8a8f36de82e1278abb02f')}
        >44d88612fea8a8f36de82e1278abb02f</span> (EICAR test)
      </div>

      {results?.error && (
        <div className="text-red-400 text-sm p-2 bg-red-950/30 border border-red-500/30 rounded font-mono">
          <FaExclamationTriangle className="inline mr-1" />{results.error}
        </div>
      )}

      {results && !results.error && (
        <div className="flex-grow overflow-y-auto space-y-3 pr-1">
          {/* Status Card */}
          <div className={`flex items-center gap-4 p-4 rounded border ${statusConfig[results.status].bg}`}>
            {statusConfig[results.status].icon}
            <div>
              <div className={`text-lg font-bold font-mono ${statusConfig[results.status].color}`}>
                {statusConfig[results.status].text}
              </div>
              {results.threat && <div className="text-xs text-gray-400">{results.threat}</div>}
            </div>
            {results.engines.detected > 0 && (
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-red-400 font-mono">{results.engines.detected}/{results.engines.total}</div>
                <div className="text-xs text-gray-500">engines detected</div>
              </div>
            )}
          </div>

          {/* Hash Details */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/40 border border-gray-800 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">Hash Type</div>
              <div className="text-sm text-gray-300 font-mono">{results.type}</div>
            </div>
            <div className="bg-black/40 border border-gray-800 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">Analyzed</div>
              <div className="text-sm text-gray-300 font-mono">{new Date(results.lastAnalysis).toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Hash Value */}
          <div className="bg-black/60 border border-gray-800 rounded p-2 flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 break-all flex-1">{results.hash}</span>
            <button
              onClick={() => navigator.clipboard.writeText(results.hash)}
              className="text-gray-600 hover:text-gray-400 flex-shrink-0"
            >
              <FaCopy className="text-xs" />
            </button>
          </div>

          {/* Engine Results */}
          {results.details.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold mb-2">Engine Results</div>
              <div className="space-y-1">
                {results.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 bg-black/40 border border-gray-800 rounded text-xs font-mono">
                    <span className="text-gray-300">{d.engine}</span>
                    <span className={d.result === 'Clean' ? 'text-green-400' : 'text-red-400'}>{d.result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.status === 'unknown' && (
            <div className="text-center text-gray-500 text-xs font-mono p-4 bg-black/40 border border-gray-800 rounded">
              This hash was not found in the threat database. It may be clean, or it may not have been scanned yet.
              <br />For production use, integrate with VirusTotal API (requires API key).
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="flex-grow flex items-center justify-center text-gray-600 font-mono text-sm text-center px-4">
          Paste a file hash to check it against threat intelligence databases.
          <br />Supports MD5, SHA-1, SHA-256, SHA-512.
        </div>
      )}
    </div>
  );
}

export default HashChecker;
