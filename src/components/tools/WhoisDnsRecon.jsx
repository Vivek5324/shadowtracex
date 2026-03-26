import React, { useState } from 'react';
import { FaGlobe, FaSearch, FaSync, FaExclamationTriangle } from 'react-icons/fa';

function WhoisDnsRecon() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;
    
    // Clean domain input (remove http, paths)
    let target = domain.trim().toLowerCase();
    target = target.replace(/^https?:\/\//, '').split('/')[0];
    
    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Free endpoints for DNS over HTTPS (Google or Cloudflare)
      const fetchDns = async (type) => {
        const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${target}&type=${type}`, {
          headers: { 'Accept': 'application/dns-json' }
        });
        if (!res.ok) throw new Error('DNS Query Failed');
        return res.json();
      };

      const [a, mx, txt, ns] = await Promise.all([
        fetchDns('A'),
        fetchDns('MX'),
        fetchDns('TXT'),
        fetchDns('NS')
      ]);

      // Simple WHOIS proxy (using a free open API for demo purposes)
      // Note: RDAP is the modern replacement for WHOIS
      let rdapData = null;
      try {
        const rdapRes = await fetch(`https://rdap.org/domain/${target}`);
        if (rdapRes.ok) {
          rdapData = await rdapRes.json();
        }
      } catch (err) {
        // Ignore RDAP failure, we'll just show DNS
      }

      setResults({
        domain: target,
        dns: {
          A: a.Answer || [],
          MX: mx.Answer || [],
          TXT: txt.Answer || [],
          NS: ns.Answer || []
        },
        rdap: rdapData
      });
    } catch (err) {
      setError('Failed to perform lookup. Ensure the domain is valid (e.g., example.com).');
    } finally {
      setLoading(false);
    }
  };

  const parseRdap = (rdap) => {
    if (!rdap) return null;
    
    const extractVcardStr = (entities, role) => {
      const entity = entities?.find(e => e.roles?.includes(role));
      const vcard = entity?.vcardArray?.[1];
      const fn = vcard?.find(v => v[0] === 'fn')?.[3];
      return fn || 'Redacted / Private';
    };

    return {
      registrar: extractVcardStr(rdap.entities, 'registrar'),
      registrant: extractVcardStr(rdap.entities, 'registrant'),
      events: rdap.events?.map(e => ({ action: e.eventAction, date: new Date(e.eventDate).toLocaleDateString() })) || [],
      status: rdap.status || []
    };
  };

  const rdapInfo = parseRdap(results?.rdap);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FaGlobe className="text-blue-400" />
        <h3 className="text-lg font-bold text-blue-400 uppercase tracking-wider">DNS & WHOIS Recon</h3>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2 mb-4">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain (e.g., github.com)"
          className="flex-1 bg-black/80 border border-gray-800 rounded px-3 py-1.5 text-sm font-mono text-gray-300 focus:border-blue-500/50 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="px-4 py-1.5 bg-blue-600/30 border border-blue-500 rounded text-blue-400 text-sm font-mono font-bold hover:bg-blue-600/50 transition-colors disabled:opacity-30"
        >
          {loading ? <FaSync className="animate-spin" /> : <><FaSearch className="inline mr-1" />Lookup</>}
        </button>
      </form>

      {error && (
        <div className="text-red-400 text-sm p-2 bg-red-950/30 border border-red-500/30 rounded font-mono mb-3">
          <FaExclamationTriangle className="inline mr-1" />{error}
        </div>
      )}

      {results && (
        <div className="flex-grow overflow-y-auto space-y-4 pr-1">
          
          {/* Domain Header */}
          <div className="p-3 bg-black/40 border border-gray-800 rounded flex justify-between items-center">
            <div className="font-mono text-xl font-bold text-cyan-400">{results.domain}</div>
            {rdapInfo && rdapInfo.events.length > 0 && (
              <div className="text-xs font-mono text-gray-500 text-right">
                Reg: {rdapInfo.events.find(e => e.action.includes('registration'))?.date || 'Unknown'}<br/>
                Exp: {rdapInfo.events.find(e => e.action.includes('expiration'))?.date || 'Unknown'}
              </div>
            )}
          </div>

          {/* RDAP / WHOIS */}
          {rdapInfo && (
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold mb-2 border-b border-gray-800 pb-1">Registration Info (RDAP)</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/20 border border-gray-800 rounded p-2">
                  <div className="text-[10px] text-gray-500 uppercase">Registrar</div>
                  <div className="text-xs font-mono text-gray-300 truncate">{rdapInfo.registrar}</div>
                </div>
                <div className="bg-black/20 border border-gray-800 rounded p-2">
                  <div className="text-[10px] text-gray-500 uppercase">Registrant</div>
                  <div className="text-xs font-mono text-gray-300 truncate">{rdapInfo.registrant}</div>
                </div>
              </div>
              {rdapInfo.status.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {rdapInfo.status.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded font-mono border border-gray-700">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DNS Records */}
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold mb-2 border-b border-gray-800 pb-1">DNS Records</div>
            
            <div className="space-y-3">
              {/* A Records */}
              {results.dns.A.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-green-400 mr-2 font-mono w-6 inline-block">A</span>
                  <div className="space-y-1 mt-1">
                    {results.dns.A.map((rec, i) => (
                      <div key={i} className="text-xs font-mono text-gray-300 bg-black/40 border border-gray-800 rounded px-2 py-1">{rec.data}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* MX Records */}
              {results.dns.MX.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-yellow-400 mr-2 font-mono w-6 inline-block">MX</span>
                  <div className="space-y-1 mt-1">
                    {results.dns.MX.map((rec, i) => (
                      <div key={i} className="text-xs font-mono text-gray-300 bg-black/40 border border-gray-800 rounded px-2 py-1 truncate">{rec.data}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* NS Records */}
              {results.dns.NS.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-purple-400 mr-2 font-mono w-6 inline-block">NS</span>
                  <div className="space-y-1 mt-1">
                    {results.dns.NS.map((rec, i) => (
                      <div key={i} className="text-xs font-mono text-gray-300 bg-black/40 border border-gray-800 rounded px-2 py-1 truncate">{rec.data}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* TXT Records */}
              {results.dns.TXT.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-orange-400 mr-2 font-mono w-6 inline-block">TXT</span>
                  <div className="space-y-1 mt-1">
                    {results.dns.TXT.map((rec, i) => (
                      <div key={i} className="text-[10px] font-mono text-gray-400 bg-black/40 border border-gray-800 rounded px-2 py-1 break-all">
                        {rec.data.replace(/"/g, '')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.values(results.dns).every(arr => arr.length === 0) && (
                <div className="text-xs font-mono text-gray-600">No standard DNS records found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="flex-grow flex items-center justify-center text-gray-600 font-mono text-sm text-center px-4">
          Perform a lookup to retrieve RDAP registration data and A, MX, NS, and TXT (SPF/DKIM) records via DoH.
        </div>
      )}
    </div>
  );
}

export default WhoisDnsRecon;
