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
  <strong>Live Threat Intelligence & Attack Simulation Dashboard</strong><br/>
  <em>An interactive cybersecurity SOC dashboard for security researchers, students, and blue teamers.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-attack-scenarios">Attacks</a> •
  <a href="#-tech-stack">Stack</a> •
  <a href="#-getting-started">Setup</a> •
  <a href="#-abuseipdb-integration">API</a> •
  <a href="#-license">License</a>
</p>

---

## 🔥 Features

| Feature | Description |
|---------|-------------|
| **Live Attack Simulation** | Launch realistic, multi-phase attack scenarios with SIEM-style structured log output |
| **Real-Time Threat Timeline** | Terminal-style log feed with color-coded severity, IDS/IPS rule triggers, and clickable IPs |
| **AbuseIPDB Integration** | Real-time threat intelligence lookups — abuse scores, ISP data, geolocation, and report history |
| **Risk Meter** | Dynamic threat-level gauge that responds to simulated attacks in real time |
| **Automated Response Panel** | Simulated SOC countermeasures — firewall rules, account lockouts, incident response actions |
| **MITRE ATT&CK Mapping** | Every attack scenario mapped to ATT&CK techniques with real-world breach examples |
| **Educational Attack Cards** | Expandable panels with detection indicators, attacker tools, target services, and case studies |

---

## ⚔️ Attack Scenarios

### 🔑 Credential Brute Force — `T1110.001`
> 4-phase attack: Recon → Credential Spray → Auth Bypass → Access Gained

Simulates automated credential stuffing against WordPress login endpoints. Generates realistic HTTP POST logs with payloads, IDS rule triggers (`ET BRUTE_FORCE`), and automated WAF countermeasures.

### 🔍 Network Reconnaissance — `T1046`
> 4-phase attack: Host Discovery → Port Probing → Service Detection → OS Fingerprint

Full Nmap-style SYN scan simulation including ICMP discovery, sequential port probes, banner grabbing (OpenSSH, nginx, MySQL), and OS fingerprint detection.

### 👻 Advanced Persistent Threat — `T1071 / T1048`
> 4-phase attack: Initial Access → Lateral Movement → Privilege Escalation → Data Exfil

Multi-stage APT simulation featuring Cobalt Strike C2 beacons, PsExec lateral movement across VLANs, Mimikatz credential dumps, and DNS tunneling exfiltration.

### 🌐 DDoS Botnet Strike — `T1498 / T1499`
> 4-phase attack: Traffic Ramp → Flood Peak → Resource Saturation → Service Degradation

Distributed denial-of-service from 1,800+ simulated botnet IPs. Includes HTTP flood, SYN flood, connection pool exhaustion, and load balancer failure cascade.

---

## 🛠️ Tech Stack

```
Frontend       React 19 + Vite 5
Styling        Tailwind CSS 3 with custom cyber theme
Icons          React Icons (Font Awesome)
Threat Intel   AbuseIPDB API v2 (free tier: 1,000 checks/day)
Deployment     Vercel
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **AbuseIPDB API Key** *(optional — for live threat intelligence)*
  - Get a free key at [abuseipdb.com](https://www.abuseipdb.com/account/api)

### Installation

```bash
# Clone the repo
git clone https://github.com/Vivek5324/shadowtracex.git
cd shadowtracex

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🔑 AbuseIPDB Integration

ShadowTrace X integrates with the **AbuseIPDB API v2** for real-time threat intelligence.

### Setup

1. Create a free account at [abuseipdb.com](https://www.abuseipdb.com/account/api)
2. Generate an API key (free tier = 1,000 lookups/day)
3. In the app, click the **IP Intelligence** panel's key icon and paste your API key
4. The key is stored in `localStorage` — never sent to any server except AbuseIPDB

### What You Get

- **Abuse Confidence Score** (0–100%)
- **ISP & Domain** identification
- **Geolocation** (country)
- **Total abuse reports** and reporter count
- **Latest reports** with attack categories
- **Automatic lookup** of attacker IPs during simulations

---

## 📁 Project Structure

```
shadowtracex/
├── index.html                    # Entry point
├── vercel.json                   # Vercel deployment config
├── tailwind.config.js            # Custom cyber theme colors & animations
├── vite.config.js                # Vite config with API proxy
├── src/
│   ├── main.jsx                  # App bootstrap
│   ├── App.jsx                   # Core app — attack engine & state management
│   ├── index.css                 # Tailwind base + custom utilities
│   ├── components/
│   │   ├── AttackControlPanel.jsx    # Attack cards with MITRE refs
│   │   ├── LiveAttackTimeline.jsx    # Terminal-style log feed
│   │   ├── AlertSystem.jsx           # Threat alert notifications
│   │   ├── AutoResponsePanel.jsx     # Automated countermeasures
│   │   ├── IpLookupPanel.jsx         # AbuseIPDB integration UI
│   │   └── RiskMeter.jsx             # Dynamic risk gauge
│   └── services/
│       └── abuseipdbService.js       # AbuseIPDB API client
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite — no extra config needed
4. Deploy! 🚀

The included `vercel.json` handles:
- Vite framework detection & build
- AbuseIPDB API proxy (avoids CORS issues)
- SPA fallback routing

---

## ⚠️ Disclaimer

> **ShadowTrace X is an educational tool.** All attack simulations run entirely in the browser using randomized, synthetic data. No actual network attacks are performed. The tool is intended for cybersecurity education, SOC analyst training, and security awareness demonstrations.

---

## 📄 License

MIT © [Vivek](https://github.com/Vivek5324)

---

<p align="center">
  <sub>Built with 🖤 for the cybersecurity community</sub>
</p>
