// AbuseIPDB API v2 Service
// Free tier: 1,000 checks/day
// Docs: https://docs.abuseipdb.com/

const API_KEY_STORAGE = 'shadowtracex_abuseipdb_key';

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key.trim());
}

export function hasApiKey() {
  return !!getApiKey();
}

/**
 * Check an IP address against AbuseIPDB.
 * @param {string} ip - IPv4 or IPv6 address
 * @param {number} maxAgeDays - How far back to look (1-365), default 90
 * @returns {Promise<Object>} - Structured result
 */
export async function checkIp(ip, maxAgeDays = 90) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No API key configured. Add your AbuseIPDB API key in settings.');
  }

  const params = new URLSearchParams({
    ipAddress: ip,
    maxAgeInDays: maxAgeDays.toString(),
    verbose: ''
  });

  const response = await fetch(`/abuseipdb-check?${params}`, {
    method: 'GET',
    headers: {
      'Key': apiKey,
      'Accept': 'application/json'
    }
  });

  if (response.status === 401) {
    throw new Error('Invalid API key. Check your AbuseIPDB API key in settings.');
  }

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Free tier allows 1,000 checks/day. Resets at 00:00 UTC.');
  }

  if (response.status === 422) {
    throw new Error('Invalid IP address format. Enter a valid IPv4 or IPv6 address.');
  }

  if (!response.ok) {
    throw new Error(`AbuseIPDB API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const d = json.data;

  return {
    ip: d.ipAddress,
    isPublic: d.isPublic,
    ipVersion: d.ipVersion,
    isWhitelisted: d.isWhitelisted,
    abuseConfidenceScore: d.abuseConfidenceScore,
    countryCode: d.countryCode,
    countryName: d.countryName || d.countryCode,
    usageType: d.usageType || 'Unknown',
    isp: d.isp || 'Unknown',
    domain: d.domain || 'N/A',
    hostnames: d.hostnames || [],
    totalReports: d.totalReports,
    numDistinctUsers: d.numDistinctUsers,
    lastReportedAt: d.lastReportedAt,
    // Category breakdown from reports
    reports: (d.reports || []).slice(0, 10).map(r => ({
      reportedAt: r.reportedAt,
      categories: r.categories,
      comment: r.comment,
      reporterCountryCode: r.reporterCountryCode
    }))
  };
}

/**
 * Map AbuseIPDB category IDs to human-readable names.
 */
export const ABUSE_CATEGORIES = {
  1: 'DNS Compromise',
  2: 'DNS Poisoning',
  3: 'Fraud Orders',
  4: 'DDoS Attack',
  5: 'FTP Brute-Force',
  6: 'Ping of Death',
  7: 'Phishing',
  8: 'Fraud VoIP',
  9: 'Open Proxy',
  10: 'Web Spam',
  11: 'Email Spam',
  12: 'Blog Spam',
  13: 'VPN IP',
  14: 'Port Scan',
  15: 'Hacking',
  16: 'SQL Injection',
  17: 'Spoofing',
  18: 'Brute-Force',
  19: 'Bad Web Bot',
  20: 'Exploited Host',
  21: 'Web App Attack',
  22: 'SSH',
  23: 'IoT Targeted'
};

export function getCategoryNames(categoryIds) {
  return categoryIds.map(id => ABUSE_CATEGORIES[id] || `Unknown (${id})`);
}
