import React, { useState, useEffect, useCallback } from 'react';
import { FaDatabase, FaSync, FaSearch, FaExternalLinkAlt, FaExclamationTriangle } from 'react-icons/fa';

const NVD_API = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

function CVEFeed() {
  const [cves, setCves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const fetchCVEs = useCallback(async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        resultsPerPage: '20',
        startIndex: '0',
      });
      if (keyword.trim()) {
        params.set('keywordSearch', keyword.trim());
      }

      const response = await fetch(`${NVD_API}?${params}`);
      if (!response.ok) {
        throw new Error(`NVD API Error: ${response.status}`);
      }

      const data = await response.json();
      const parsed = (data.vulnerabilities || []).map(v => {
        const cve = v.cve;
        const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData
          || cve.metrics?.cvssMetricV30?.[0]?.cvssData
          || cve.metrics?.cvssMetricV2?.[0]?.cvssData
          || null;
        
        return {
          id: cve.id,
          description: cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description',
          published: cve.published,
          lastModified: cve.lastModified,
          score: metrics?.baseScore || null,
          severity: metrics?.baseSeverity || 'UNKNOWN',
          vector: metrics?.vectorString || '',
          references: (cve.references || []).slice(0, 5),
          weaknesses: (cve.weaknesses || []).flatMap(w =>
            w.description?.map(d => d.value) || []
          ),
        };
      });

      setCves(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCVEs();
  }, [fetchCVEs]);

  const getSeverityColor = (sev) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getScoreBarColor = (score) => {
    if (!score) return 'bg-gray-600';
    if (score >= 9) return 'bg-red-500';
    if (score >= 7) return 'bg-orange-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredCves = cves.filter(c =>
    severityFilter === 'ALL' || c.severity?.toUpperCase() === severityFilter
  );

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCVEs(searchQuery);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FaDatabase className="text-cyber-green" />
        <h3 className="text-lg font-bold text-cyber-green uppercase tracking-wider">CVE Live Feed</h3>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVEs... (e.g. apache, log4j, chrome)"
            className="w-full bg-black/80 border border-gray-800 rounded px-7 py-1.5 text-sm font-mono text-gray-300 focus:border-cyber-green/50 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-cyber-green/20 border border-cyber-green/50 rounded text-cyber-green text-sm font-mono hover:bg-cyber-green/30 transition-colors disabled:opacity-50"
        >
          {loading ? <FaSync className="animate-spin" /> : 'Search'}
        </button>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-black/80 border border-gray-800 rounded px-2 py-1.5 text-xs font-mono text-gray-400 outline-none"
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </form>

      {error && (
        <div className="text-red-400 text-sm p-2 bg-red-950/30 border border-red-500/30 rounded mb-3 font-mono">
          <FaExclamationTriangle className="inline mr-1" />{error}
        </div>
      )}

      {/* CVE List */}
      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {loading && cves.length === 0 ? (
          <div className="text-gray-500 text-center py-8 font-mono">
            <FaSync className="animate-spin inline mr-2" />Querying NVD database...
          </div>
        ) : filteredCves.length === 0 ? (
          <div className="text-gray-500 text-center py-8 font-mono">No CVEs found</div>
        ) : (
          filteredCves.map(cve => (
            <div
              key={cve.id}
              className="border border-gray-800 rounded bg-black/40 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => setExpandedId(expandedId === cve.id ? null : cve.id)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-cyan-400">{cve.id}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${getSeverityColor(cve.severity)}`}>
                      {cve.severity}
                    </span>
                  </div>
                  {cve.score !== null && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getScoreBarColor(cve.score)}`} style={{ width: `${cve.score * 10}%` }} />
                      </div>
                      <span className="text-xs font-mono text-gray-400">{cve.score}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{cve.description}</p>
                <div className="text-xs text-gray-600 mt-1 font-mono">
                  Published: {new Date(cve.published).toLocaleDateString()}
                </div>
              </div>

              {expandedId === cve.id && (
                <div className="border-t border-gray-800 p-3 space-y-2 animate-fade-in">
                  <p className="text-xs text-gray-400">{cve.description}</p>
                  {cve.vector && (
                    <div className="text-xs font-mono text-gray-500">
                      <span className="text-gray-600">Vector: </span>{cve.vector}
                    </div>
                  )}
                  {cve.weaknesses.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cve.weaknesses.map((w, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded font-mono">{w}</span>
                      ))}
                    </div>
                  )}
                  {cve.references.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 uppercase font-bold">References</div>
                      {cve.references.map((ref, i) => (
                        <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 block truncate font-mono">
                          <FaExternalLinkAlt className="inline mr-1 text-[10px]" />{ref.url}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CVEFeed;
