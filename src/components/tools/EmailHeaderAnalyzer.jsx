import React, { useState } from 'react';
import { FaEnvelope, FaPaste, FaTrash, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function parseEmailHeaders(raw) {
  const lines = raw.split(/\r?\n/);
  const headers = [];
  let current = null;

  for (const line of lines) {
    if (/^\S+:\s/.test(line)) {
      if (current) headers.push(current);
      const idx = line.indexOf(':');
      current = { name: line.substring(0, idx).trim(), value: line.substring(idx + 1).trim() };
    } else if (current && /^\s+/.test(line)) {
      current.value += ' ' + line.trim();
    }
  }
  if (current) headers.push(current);
  return headers;
}

function extractReceivedChain(headers) {
  return headers
    .filter(h => h.name.toLowerCase() === 'received')
    .map((h, i) => {
      const fromMatch = h.value.match(/from\s+([\w.\-\[\]]+)/i);
      const byMatch = h.value.match(/by\s+([\w.\-\[\]]+)/i);
      const dateMatch = h.value.match(/;\s*(.+)$/);
      const ipMatch = h.value.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
      return {
        hop: i + 1,
        from: fromMatch?.[1] || 'unknown',
        by: byMatch?.[1] || 'unknown',
        ip: ipMatch?.[1] || null,
        date: dateMatch?.[1]?.trim() || '',
        raw: h.value,
      };
    });
}

function analyzeSecurityHeaders(headers) {
  const findings = [];
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;

  // SPF
  const receivedSPF = getHeader('Received-SPF');
  if (receivedSPF) {
    const pass = /pass/i.test(receivedSPF);
    findings.push({
      name: 'SPF',
      status: pass ? 'pass' : 'fail',
      detail: pass ? 'SPF check passed — sender IP authorized' : 'SPF FAILED — sender IP not authorized by domain',
    });
  } else {
    findings.push({ name: 'SPF', status: 'missing', detail: 'No SPF header found — cannot verify sender authorization' });
  }

  // DKIM
  const dkim = getHeader('DKIM-Signature');
  const authResults = getHeader('Authentication-Results') || '';
  const dkimPass = /dkim=pass/i.test(authResults);
  if (dkim) {
    findings.push({
      name: 'DKIM',
      status: dkimPass ? 'pass' : 'warning',
      detail: dkimPass ? 'DKIM signature verified' : 'DKIM signature present but verification unclear',
    });
  } else {
    findings.push({ name: 'DKIM', status: 'missing', detail: 'No DKIM signature — message integrity unverified' });
  }

  // DMARC
  const dmarcPass = /dmarc=pass/i.test(authResults);
  if (authResults && /dmarc/i.test(authResults)) {
    findings.push({
      name: 'DMARC',
      status: dmarcPass ? 'pass' : 'fail',
      detail: dmarcPass ? 'DMARC policy passed' : 'DMARC check failed — potential spoofing',
    });
  } else {
    findings.push({ name: 'DMARC', status: 'missing', detail: 'No DMARC results found' });
  }

  // Return-Path vs From mismatch
  const returnPath = getHeader('Return-Path');
  const from = getHeader('From');
  if (returnPath && from) {
    const rpDomain = returnPath.match(/@([\w.\-]+)/)?.[1];
    const fromDomain = from.match(/@([\w.\-]+)/)?.[1];
    if (rpDomain && fromDomain && rpDomain.toLowerCase() !== fromDomain.toLowerCase()) {
      findings.push({
        name: 'Return-Path Mismatch',
        status: 'fail',
        detail: `Return-Path domain (${rpDomain}) ≠ From domain (${fromDomain}) — possible spoofing`,
      });
    }
  }

  // X-Spam-Status
  const spamStatus = getHeader('X-Spam-Status');
  if (spamStatus) {
    const isSpam = /yes/i.test(spamStatus);
    findings.push({
      name: 'Spam Filter',
      status: isSpam ? 'fail' : 'pass',
      detail: isSpam ? 'Flagged as SPAM by mail server' : 'Passed spam filter',
    });
  }

  return findings;
}

function EmailHeaderAnalyzer() {
  const [rawHeaders, setRawHeaders] = useState('');
  const [parsed, setParsed] = useState(null);

  const handleAnalyze = () => {
    if (!rawHeaders.trim()) return;
    const headers = parseEmailHeaders(rawHeaders);
    const chain = extractReceivedChain(headers);
    const security = analyzeSecurityHeaders(headers);
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
    const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
    const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
    const messageId = headers.find(h => h.name.toLowerCase() === 'message-id')?.value || '';

    setParsed({ headers, chain, security, from, to, subject, date, messageId });
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'pass': return <FaCheckCircle className="text-green-400" />;
      case 'fail': return <FaTimesCircle className="text-red-400" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-400" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'pass': return 'border-green-500/30 bg-green-950/20';
      case 'fail': return 'border-red-500/30 bg-red-950/20';
      case 'warning': return 'border-yellow-500/30 bg-yellow-950/20';
      default: return 'border-gray-700 bg-gray-900/30';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FaEnvelope className="text-purple-400" />
        <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider">Email Header Analyzer</h3>
      </div>

      {!parsed ? (
        <div className="flex flex-col flex-grow">
          <textarea
            value={rawHeaders}
            onChange={(e) => setRawHeaders(e.target.value)}
            placeholder="Paste raw email headers here...&#10;&#10;To get headers:&#10;• Gmail: Open email → ⋮ → Show original&#10;• Outlook: Open email → ⋯ → View message source&#10;• Mail app: View → Message → All Headers"
            className="flex-grow bg-black/80 border border-gray-800 rounded p-3 font-mono text-xs text-gray-300 resize-none outline-none focus:border-purple-500/50 min-h-[200px]"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAnalyze}
              disabled={!rawHeaders.trim()}
              className="flex-1 py-2 bg-purple-600/30 border border-purple-500 rounded text-purple-400 font-mono text-sm font-bold hover:bg-purple-600/50 transition-colors disabled:opacity-30"
            >
              <FaSearch className="inline mr-2" />Analyze Headers
            </button>
            <button
              onClick={async () => {
                const text = await navigator.clipboard.readText();
                setRawHeaders(text);
              }}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-400 hover:text-gray-300 transition-colors"
            >
              <FaPaste />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-4 pr-1">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/40 border border-gray-800 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">From</div>
              <div className="text-sm text-gray-300 font-mono truncate">{parsed.from}</div>
            </div>
            <div className="bg-black/40 border border-gray-800 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">To</div>
              <div className="text-sm text-gray-300 font-mono truncate">{parsed.to}</div>
            </div>
            <div className="col-span-2 bg-black/40 border border-gray-800 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">Subject</div>
              <div className="text-sm text-gray-300">{parsed.subject || 'N/A'}</div>
            </div>
          </div>

          {/* Security Analysis */}
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold mb-2">Security Analysis</div>
            <div className="space-y-1.5">
              {parsed.security.map((finding, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded border ${statusColor(finding.status)}`}>
                  {statusIcon(finding.status)}
                  <span className="text-xs font-mono font-bold text-gray-300 w-16">{finding.name}</span>
                  <span className="text-xs text-gray-400 flex-1">{finding.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hop Chain */}
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold mb-2">Delivery Path ({parsed.chain.length} hops)</div>
            <div className="space-y-1">
              {parsed.chain.map((hop, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-black/40 border border-gray-800 rounded text-xs font-mono">
                  <span className="text-cyan-400 font-bold w-6">#{hop.hop}</span>
                  <div className="flex-1">
                    <div>
                      <span className="text-gray-500">from </span>
                      <span className="text-yellow-300">{hop.from}</span>
                      {hop.ip && <span className="text-orange-400 ml-1">[{hop.ip}]</span>}
                      <span className="text-gray-500"> by </span>
                      <span className="text-green-400">{hop.by}</span>
                    </div>
                    {hop.date && <div className="text-gray-600 text-[10px] mt-0.5">{hop.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Headers */}
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold mb-2">All Headers ({parsed.headers.length})</div>
            <div className="max-h-[200px] overflow-y-auto bg-black/60 rounded border border-gray-800 p-2 space-y-0.5">
              {parsed.headers.map((h, i) => (
                <div key={i} className="text-xs font-mono">
                  <span className="text-cyan-400">{h.name}: </span>
                  <span className="text-gray-400 break-all">{h.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setParsed(null)}
            className="w-full py-2 bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono text-sm hover:bg-gray-700 transition-colors"
          >
            <FaTrash className="inline mr-2" />Analyze Another
          </button>
        </div>
      )}
    </div>
  );
}

export default EmailHeaderAnalyzer;
