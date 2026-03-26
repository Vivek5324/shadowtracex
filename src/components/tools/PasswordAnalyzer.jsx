import React, { useState } from 'react';
import { FaKey, FaShieldAlt, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';

function calculateEntropy(password) {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) return 0;
  const entropy = password.length * Math.log2(poolSize);
  return Math.round(entropy);
}

function estimateCrackTime(entropy) {
  // Assume generic fast hashing (MD5/SHA1) ~100B guesses/sec (modern offline cluster)
  // For online attacks, it's irrelevant, but this is a standard metric
  const guesses = Math.pow(2, entropy);
  const guessesPerSecond = 100_000_000_000; 
  const seconds = guesses / guessesPerSecond;

  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  return '> 100 years';
}

function PasswordAnalyzer() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Analysis
  const entropy = calculateEntropy(password);
  const crackTime = estimateCrackTime(entropy);
  
  // Score 0-100
  const score = Math.min(100, Math.max(0, (entropy / 100) * 100));
  
  const getStrengthConfig = () => {
    if (!password) return { text: 'Enter Password', color: 'text-gray-500', border: 'border-gray-700', bg: 'bg-gray-800' };
    if (entropy < 40) return { text: 'WEAK', color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500' };
    if (entropy < 60) return { text: 'FAIR', color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500' };
    if (entropy < 80) return { text: 'GOOD', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500' };
    return { text: 'STRONG', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500' };
  };

  const config = getStrengthConfig();

  // Checks
  const checks = [
    { label: 'Length ≥ 12', pass: password.length >= 12 },
    { label: 'Uppercase Letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase Letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special Character', pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  // Common patterns
  const patterns = [];
  if (/^[a-zA-Z]+$/.test(password)) patterns.push('Letters only (dictionary attack vulnerable)');
  if (/^[0-9]+$/.test(password)) patterns.push('Numbers only (brute-force vulnerable)');
  if (/(.)\1{2,}/.test(password)) patterns.push('Repeated characters detected');
  if (/(123|abc|qwe|pass|\d{4,})/.test(password.toLowerCase())) patterns.push('Common sequence or predictable pattern');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <FaKey className="text-yellow-400" />
        <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider">Password Analyzer</h3>
      </div>

      <div className="relative mb-6">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter prototype password to analyze..."
          className="w-full bg-black/80 border-b-2 border-gray-800 px-3 py-3 text-lg font-mono text-gray-300 outline-none focus:border-yellow-500/50 pr-10"
        />
        <button 
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="flex-grow space-y-4">
        {/* Main Score Bar */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className={`font-mono font-bold text-lg ${config.color}`}>{config.text}</span>
            <span className="font-mono text-xs text-gray-500">Entropy: {entropy} bits</span>
          </div>
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${config.bg}`} 
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-black/40 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-500 uppercase flex items-center gap-1 mb-1">
              <FaShieldAlt /> Offline Crack Time
            </div>
            <div className={`font-mono text-lg font-bold ${entropy >= 80 ? 'text-green-400' : 'text-red-400'}`}>
              {password ? crackTime : '-'}
            </div>
            <div className="text-[10px] text-gray-600 mt-1">Assuming 100B hashes/sec</div>
          </div>
          
          <div className="bg-black/40 border border-gray-800 rounded p-3">
             <div className="text-xs text-gray-500 uppercase mb-1">Length</div>
             <div className="font-mono text-lg font-bold text-cyan-400">{password.length}</div>
             <div className="text-[10px] text-gray-600 mt-1">characters</div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="bg-black/40 border border-gray-800 rounded p-3">
          <div className="text-xs text-gray-500 uppercase font-bold mb-2">Composition Metrics</div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {checks.map((check, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs font-mono ${check.pass ? 'text-green-400' : 'text-gray-600'}`}>
                {check.pass ? '☑' : '☐'} {check.label}
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {password && patterns.length > 0 && (
          <div className="p-3 bg-orange-950/20 border border-orange-500/30 rounded">
            <div className="flex items-center gap-1 text-orange-400 text-xs font-bold uppercase mb-2">
              <FaExclamationTriangle /> Vulnerability Patterns
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {patterns.map((p, i) => (
                <li key={i} className="text-xs text-orange-300 font-mono">{p}</li>
              ))}
            </ul>
          </div>
        )}

        {password && !patterns.length && entropy >= 60 && (
          <div className="text-center text-green-400 text-xs font-mono p-3 bg-green-950/20 border border-green-500/30 rounded">
            No obvious pattern vulnerabilities detected. Safe against dictionary attacks.
          </div>
        )}

        <div className="text-[10px] text-gray-600 font-mono text-center mt-4">
           All analysis runs locally in your browser. Passwords are never transmitted.
        </div>
      </div>
    </div>
  );
}

export default PasswordAnalyzer;
