<p align="center">
  <img src="https://img.shields.io/badge/SHADOWTRACE-X-00ff41?style=for-the-badge&labelColor=0a0a0a&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwZmY0MSI+PHBhdGggZD0iTTEyIDJMMyAxNGgxOEwxMiAyem0wIDRsNi4zIDlINS43TDEyIDZ6Ii8+PC9zdmc+" alt="ShadowTrace X" />
  <br/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/AbuseIPDB-API-FF3C3C?style=flat-square" alt="AbuseIPDB" />
  <img src="https://img.shields.io/badge/MITRE_ATT%26CK-Referenced-FF6600?style=flat-square" alt="MITRE ATT&CK" />
</p>

<h1 align="center">
  🛡️ ShadowTrace X
</h1>

<p align="center">
  <strong>Comprehensive Cybersecurity Operations Center & Investigation Toolkit</strong><br/>
  <em>An interactive threat intelligence dashboard and 8-in-1 cyber analysis suite for blue teamers, security researchers, and students.</em>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-soc-dashboard-features">SOC Dashboard</a> •
  <a href="#-the-security-toolkit">Security Toolkit</a> •
  <a href="#-tech-stack">Stack</a> •
  <a href="#-getting-started">Setup</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 🌟 Overview

**ShadowTrace X** is a high-fidelity web application built to simulate and analyze realistic cyberattacks, while simultaneously providing a practical suite of real-world cybersecurity utilities. The platform is divided into two main tabs:
1. **SOC Dashboard:** A live simulation engine demonstrating how common attacks look on a network level, complete with automated countermeasures and threat intelligence.
2. **Security Toolkit:** An 8-in-1 professional utility suite for investigating IOCs, parsing logs, analyzing headers, and generating incident reports.

---

## 🦅 SOC Dashboard Features

The heart of the application is a simulated Security Operations Center (SOC) dashboard. 

| Feature | Description |
|---------|-------------|
| **Live Attack Simulation** | Launch structured attack scenarios generating realistic logs and telemetry in real time. |
| **Real-Time Threat Timeline** | Terminal-style log feed with color-coded severity, IDS/IPS rule triggers, and clickable IPs. |
| **AbuseIPDB Integration** | Real-time intel lookups for attacking IPs — abuse scores, ISP data, and geographic locations (requires free API key). |
| **Dynamic Risk Meter** | Threat-level gauge that responds dynamically to simulated attacks as they breach deeper phases. |
| **Automated Response Panel** | Watches simulated SOC countermeasures deploy sequentially — WAF rules, account lockouts, VLAN isolation. |
| **MITRE ATT&CK Mapping** | Every attack scenario is tracked across ATT&CK techniques with real-world breach execution examples. |

### ⚔️ Attack Scenarios
1. **Credential Brute Force (`T1110.001`):** Recon → Credential Spray → Auth Bypass → Access Gained.
2. **Network Reconnaissance (`T1046`):** Host Discovery → Port Probing → Service Detection → OS Fingerprint.
3. **Advanced Persistent Threat (`T1071 / T1048`):** Initial Access → Lateral Movement → Privilege Escalation → Data Exfil via DNS tunneling.
4. **DDoS Botnet Strike (`T1498 / T1499`):** Traffic Ramp → Flood Peak → Resource Saturation → Service Degradation.

---

## 🧰 The Security Toolkit

ShadowTrace X includes an 8-tool "Overkill" investigation suite to perform real-world analysis without leaving the app.

1. **🚨 CVE Live Feed:** Streams real-time vulnerability data directly from the NVD API. Search by keyword, filter by CVSS severity, and track the latest zero-days.
2. **✉️ Email Header Analyzer:** Paste raw email headers to map the complete delivery path (hop chain), verify SPF/DKIM/DMARC authentication, and flag spam indicators.
3. **🔒 Security Headers Scanner:** Enter any URL to aggressively check its HTTP response headers (HSTS, CSP, X-Frame-Options) against modern security standards, returning a letter grade.
4. **🧬 Hash & IOC Checker:** Detect the hashing algorithm (MD5, SHA1, SHA256) of a file artifact and simulate threat-engine detection against known malware signatures.
5. **📜 Log File Parser:** Drop in Apache/Nginx, Syslog, or Auth logs. The parser intelligently extracts unique IPs, graphs HTTP status codes, and flags SQLi/LFI injection attempts.
6. **📊 Incident Report Generator:** Syncs with the SOC Dashboard to automatically export a professional, dark-themed HTML executive report summarizing the latest simulated attack.
7. **🔑 Password Analyzer:** Calculates cryptographic entropy (in bits), estimates offline cracking times, checks composition rules, and warns against common predictable patterns.
8. **🌐 Whois & DNS Recon**: Employs DNS-over-HTTPS (DoH) to retrieve live A, MX, NS, and TXT (SPF) records, augmented by RDAP registration data for a given domain.

---

## 🛠️ Tech Stack

Built for maximum portability and extreme performance with zero heavy backend dependencies:

- **Frontend:** React 19 + Vite 5
- **Styling:** Tailwind CSS 3 (Custom Cyber-Green theme + Glassmorphism)
- **Icons:** React Icons (Font Awesome)
- **External APIs:** AbuseIPDB, NVD (NIST), Cloudflare DoH, RDAP
- **Deployment:** Vercel (Optimized for SPA routing)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**

### Installation

```bash
# Clone the repository
git clone https://github.com/Vivek5324/shadowtracex.git
cd shadowtracex

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5174`.

### AbuseIPDB Integration (Optional)
To enable live threat intel on the SOC Dashboard:
1. Get a free API key at [abuseipdb.com](https://www.abuseipdb.com/account/api)
2. In the app on the SOC Dashboard tab, click the **key icon** on the IP Intelligence panel and paste your key. It is stored securely in your browser's local storage.

---

## 🌐 Deployment

ShadowTrace X is pre-configured for **Vercel** with a custom `vercel.json` file handling SPA routing rules and API proxy rewrites to bypass CORS for specific tools.

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Vercel automatically detects the Vite framework. Hit Deploy! 🚀

---

## ⚠️ Disclaimer

> **ShadowTrace X is an educational and theoretical tool.** All attacks simulated on the SOC Dashboard run entirely locally in the browser memory using synthetic arrays. The Security Toolkit interacts with public APIs for analysis purposes only. No unauthorized network attacks are performed by this software.

---

## 📄 License

MIT © [Vivek](https://github.com/Vivek5324)

<p align="center">
  <sub>Built with 🖤 for the cybersecurity community</sub>
</p>
