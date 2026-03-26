import React, { useState, useCallback } from 'react';
import { FaFileExport, FaDownload, FaSpinner } from 'react-icons/fa';

function IncidentReportGenerator({ logs = [], alerts = [], responses = [], riskPercentage = 0 }) {
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [analystName, setAnalystName] = useState('');
  const [incidentId, setIncidentId] = useState('');

  const generateId = () => `INC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const getSeverityFromRisk = (risk) => {
    if (risk >= 70) return { level: 'CRITICAL', color: '#ff003c' };
    if (risk >= 40) return { level: 'HIGH', color: '#ff8c00' };
    if (risk >= 20) return { level: 'MEDIUM', color: '#ffd700' };
    return { level: 'LOW', color: '#00ff41' };
  };

  const generateReport = useCallback(() => {
    setGenerating(true);
    const id = incidentId || generateId();
    setIncidentId(id);

    setTimeout(() => {
      const severity = getSeverityFromRisk(riskPercentage);
      const now = new Date();
      const analyst = analystName || 'SOC Analyst';

      const structuredLogs = logs.filter(l => l.isStructured);
      const ruleTriggers = logs.filter(l => l.isRule);
      const uniqueSourceIps = [...new Set(structuredLogs.map(l => l.sourceIp).filter(Boolean))];
      const criticalLogs = structuredLogs.filter(l => l.severity === 'critical');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Incident Report ${id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 40px; line-height: 1.6; }
    .report { max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 2px solid ${severity.color}; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; color: ${severity.color}; margin-bottom: 5px; }
    .header .subtitle { color: #888; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; font-family: monospace; }
    .badge-critical { background: rgba(255,0,60,0.2); color: #ff3c5c; border: 1px solid rgba(255,0,60,0.5); }
    .badge-high { background: rgba(255,140,0,0.2); color: #ff8c00; border: 1px solid rgba(255,140,0,0.5); }
    .badge-medium { background: rgba(255,215,0,0.2); color: #ffd700; border: 1px solid rgba(255,215,0,0.5); }
    .badge-low { background: rgba(0,255,65,0.2); color: #00ff41; border: 1px solid rgba(0,255,65,0.5); }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; color: #00f0ff; border-bottom: 1px solid #222; padding-bottom: 8px; margin-bottom: 15px; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .meta-item { background: #111; border: 1px solid #222; border-radius: 6px; padding: 12px; }
    .meta-item label { display: block; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .meta-item span { font-family: monospace; color: #ccc; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace; }
    th { text-align: left; padding: 8px; background: #111; color: #888; border: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
    td { padding: 6px 8px; border: 1px solid #222; color: #ccc; }
    tr:nth-child(even) { background: #0d0d0d; }
    .alert-entry { padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid; }
    .alert-critical { border-color: #ff003c; background: rgba(255,0,60,0.08); }
    .alert-high { border-color: #ff8c00; background: rgba(255,140,0,0.08); }
    .response-entry { padding: 8px 12px; margin-bottom: 6px; background: rgba(0,240,255,0.05); border: 1px solid rgba(0,240,255,0.2); border-radius: 4px; font-family: monospace; font-size: 12px; }
    .response-entry::before { content: "✓ "; color: #00ff41; }
    .ioc-chip { display: inline-block; padding: 3px 8px; margin: 2px; background: #1a1a1a; border: 1px solid #333; border-radius: 3px; font-family: monospace; font-size: 12px; color: #ffd700; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #222; color: #555; font-size: 12px; text-align: center; }
    @media print { body { background: white; color: #333; } .meta-item, th { background: #f5f5f5; } td, th { border-color: #ddd; } }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>🛡️ INCIDENT REPORT</h1>
      <div class="subtitle">ShadowTrace X — Automated Incident Documentation</div>
    </div>

    <div class="section">
      <div class="meta-grid">
        <div class="meta-item"><label>Incident ID</label><span>${id}</span></div>
        <div class="meta-item"><label>Severity</label><span class="badge badge-${severity.level.toLowerCase()}">${severity.level}</span></div>
        <div class="meta-item"><label>Risk Score</label><span>${riskPercentage}%</span></div>
        <div class="meta-item"><label>Analyst</label><span>${analyst}</span></div>
        <div class="meta-item"><label>Generated</label><span>${now.toLocaleString()}</span></div>
        <div class="meta-item"><label>Status</label><span>Under Investigation</span></div>
      </div>
    </div>

    <div class="section">
      <h2>Executive Summary</h2>
      <p>This report documents a security incident detected by ShadowTrace X intrusion detection system. 
      The system recorded <strong>${logs.length}</strong> log events, triggered <strong>${alerts.length}</strong> alerts, 
      and deployed <strong>${responses.length}</strong> automated countermeasures. 
      The incident involved <strong>${uniqueSourceIps.length}</strong> unique source IP(s) 
      with <strong>${criticalLogs.length}</strong> critical-severity events observed.</p>
    </div>

    ${alerts.length > 0 ? `
    <div class="section">
      <h2>Alerts Triggered (${alerts.length})</h2>
      ${alerts.map(a => `
        <div class="alert-entry alert-${a.level?.toLowerCase() || 'high'}">
          <strong>[${a.level}]</strong> ${a.message}
        </div>
      `).join('')}
    </div>` : ''}

    ${uniqueSourceIps.length > 0 ? `
    <div class="section">
      <h2>Indicators of Compromise (IOCs)</h2>
      <p style="margin-bottom: 10px; color: #888; font-size: 13px;">Source IP addresses observed during the incident:</p>
      ${uniqueSourceIps.map(ip => `<span class="ioc-chip">${ip}</span>`).join('')}
    </div>` : ''}

    ${ruleTriggers.length > 0 ? `
    <div class="section">
      <h2>IDS/IPS Rule Triggers (${ruleTriggers.length})</h2>
      <table>
        <thead><tr><th>Time</th><th>Rule / Message</th></tr></thead>
        <tbody>
          ${ruleTriggers.map(r => `<tr><td>${r.time || ''}</td><td style="color:#ff6b6b">${r.message || ''}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${structuredLogs.length > 0 ? `
    <div class="section">
      <h2>Event Timeline (${structuredLogs.length} events)</h2>
      <table>
        <thead><tr><th>Time</th><th>Source</th><th>Target</th><th>Method</th><th>URI</th><th>Status</th><th>Details</th></tr></thead>
        <tbody>
          ${structuredLogs.slice(0, 50).map(l => `
            <tr>
              <td>${l.time || ''}</td>
              <td>${l.sourceIp || ''}:${l.sourcePort || ''}</td>
              <td>${l.targetIp || ''}:${l.targetPort || ''}</td>
              <td>${l.method || ''}</td>
              <td>${l.targetUri || ''}</td>
              <td>${l.statusCode || ''}</td>
              <td>${l.details || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${structuredLogs.length > 50 ? `<p style="color:#666;font-size:12px;margin-top:8px;">... and ${structuredLogs.length - 50} more events</p>` : ''}
    </div>` : ''}

    ${responses.length > 0 ? `
    <div class="section">
      <h2>Automated Countermeasures (${responses.length})</h2>
      ${responses.map(r => `<div class="response-entry">${r}</div>`).join('')}
    </div>` : ''}

    <div class="section">
      <h2>Recommendations</h2>
      <ol style="padding-left: 20px; color: #bbb; font-size: 13px;">
        ${riskPercentage >= 70 ? '<li>Immediately isolate affected systems and initiate full forensic investigation</li>' : ''}
        ${uniqueSourceIps.length > 0 ? `<li>Block source IPs at perimeter firewall and submit to threat intelligence feeds</li>` : ''}
        <li>Review and update IDS/IPS ruleset based on detected attack patterns</li>
        <li>Verify all automated countermeasures were applied correctly</li>
        <li>Conduct post-incident review and update incident response playbook</li>
        ${riskPercentage >= 40 ? '<li>Notify security stakeholders and consider breach notification requirements</li>' : ''}
      </ol>
    </div>

    <div class="footer">
      Generated by ShadowTrace X v3.0 • ${now.toISOString()} • CONFIDENTIAL
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-report-${id}.html`;
      a.click();
      URL.revokeObjectURL(url);

      setGenerating(false);
      setReportReady(true);
    }, 1500);
  }, [logs, alerts, responses, riskPercentage, analystName, incidentId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FaFileExport className="text-red-400" />
        <h3 className="text-lg font-bold text-red-400 uppercase tracking-wider">Incident Report</h3>
      </div>

      <div className="flex-grow space-y-4">
        {/* Current Incident Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-gray-800 rounded p-3 text-center">
            <div className="text-2xl font-bold font-mono text-cyan-400">{logs.length}</div>
            <div className="text-xs text-gray-500">Log Events</div>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded p-3 text-center">
            <div className="text-2xl font-bold font-mono text-red-400">{alerts.length}</div>
            <div className="text-xs text-gray-500">Alerts</div>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded p-3 text-center">
            <div className="text-2xl font-bold font-mono text-green-400">{responses.length}</div>
            <div className="text-xs text-gray-500">Countermeasures</div>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded p-3 text-center">
            <div className={`text-2xl font-bold font-mono ${riskPercentage >= 70 ? 'text-red-400' : riskPercentage >= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
              {riskPercentage}%
            </div>
            <div className="text-xs text-gray-500">Risk Level</div>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-2">
          <input
            type="text"
            value={analystName}
            onChange={(e) => setAnalystName(e.target.value)}
            placeholder="Analyst name (optional)"
            className="w-full bg-black/80 border border-gray-800 rounded px-3 py-1.5 text-sm font-mono text-gray-300 outline-none focus:border-red-500/50"
          />
          <input
            type="text"
            value={incidentId}
            onChange={(e) => setIncidentId(e.target.value)}
            placeholder="Incident ID (auto-generated if empty)"
            className="w-full bg-black/80 border border-gray-800 rounded px-3 py-1.5 text-sm font-mono text-gray-300 outline-none focus:border-red-500/50"
          />
        </div>

        <div className="text-xs text-gray-600 font-mono">
          The report will include: executive summary, alerts, IOCs, IDS/IPS rules, event timeline, countermeasures, and recommendations.
        </div>

        {/* Generate Button */}
        <button
          onClick={generateReport}
          disabled={generating || (logs.length === 0)}
          className="w-full py-3 bg-red-600/30 border border-red-500 rounded text-red-400 font-mono text-sm font-bold hover:bg-red-600/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <><FaSpinner className="animate-spin" /> Generating Report...</>
          ) : (
            <><FaDownload /> Generate & Download Report</>
          )}
        </button>

        {reportReady && (
          <div className="text-center text-green-400 text-sm font-mono p-3 bg-green-950/20 border border-green-500/30 rounded">
            ✓ Report downloaded! Check your downloads folder.
          </div>
        )}

        {logs.length === 0 && (
          <div className="text-center text-gray-500 text-xs font-mono p-4 bg-black/40 border border-gray-800 rounded">
            Run an attack simulation first to generate data for the report.
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentReportGenerator;
