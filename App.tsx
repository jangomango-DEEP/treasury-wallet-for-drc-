
import React, { useState, useEffect, useMemo } from 'react';
import { AppTab, WalletCredentials, ManagedToken, SolanaCluster } from './types';
import { SolanaService } from './services/solanaService';
import { BiometricService } from './services/biometricService';
import { AuthService } from './services/authService';
import { Keypair } from '@solana/web3.js';
import Dashboard from './components/Dashboard';
import TokenFactory from './components/TokenFactory';
import TokenManager from './components/TokenManager';
import AirdropTool from './components/AirdropTool';
import SecurityPanel from './components/SecurityPanel';
import DeploymentPanel from './components/DeploymentPanel';
import Sidebar from './components/Sidebar';

// Logo SVG matching the user's provided "DR" hexagon logo
const DR_LOGO = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d9488;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" fill="url(#grad)" />
  <text x="50" y="58" font-family="Georgia, serif" font-size="34" fill="white" text-anchor="middle" font-weight="bold">DR</text>
</svg>
`)}`;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [wallet, setWallet] = useState<WalletCredentials | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<ManagedToken[]>([]);
  const [cluster, setCluster] = useState<SolanaCluster>(SolanaCluster.DEVNET);
  
  // Login States
  const [isImporting, setIsImporting] = useState(false);
  const [isIdentityLogin, setIsIdentityLogin] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  const solana = useMemo(() => new SolanaService(cluster), [cluster]);

  useEffect(() => {
    const savedWallet = localStorage.getItem('sol_wallet');
    const bioId = localStorage.getItem('sol_bio_id');
    
    if (bioId) setHasBiometrics(true);
    
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
      } catch (e) {
        localStorage.removeItem('sol_wallet');
      }
    }
  }, []);

  useEffect(() => {
    solana.setCluster(cluster);
    if (wallet) {
      updateBalance();
    }
  }, [cluster, wallet, solana]);

  const updateBalance = async () => {
    if (wallet) {
      const bal = await solana.getBalance(wallet.publicKey);
      setBalance(bal);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await BiometricService.authenticate();
    if (success) {
      const savedWallet = localStorage.getItem('sol_wallet');
      if (savedWallet) {
        setWallet(JSON.parse(savedWallet));
      } else {
        alert("Biometrics matched, but no wallet found. Please use recovery factors.");
      }
    } else {
      alert("Biometric verification failed.");
    }
  };

  const handleIdentityLoginSubmit = async () => {
    if (!otpSent) {
      if (!identifier.trim()) return alert("Enter your recovery Email or Phone");
      setIsConnecting(true);
      const sent = await AuthService.sendOtp(identifier);
      if (sent) setOtpSent(true);
      setIsConnecting(false);
    } else {
      if (otp.length < 4) return alert("Enter valid security code");
      setIsConnecting(true);
      const userWallet = await AuthService.verifyOtpAndGetWallet(identifier, otp);
      if (userWallet) {
        setWallet(userWallet);
        localStorage.setItem('sol_wallet', JSON.stringify(userWallet));
      } else {
        alert("Invalid code or identity check failed.");
      }
      setIsConnecting(false);
    }
  };

  const handleCreateWallet = () => {
    const newWallet = solana.generateNewWallet();
    setWallet(newWallet);
    localStorage.setItem('sol_wallet', JSON.stringify(newWallet));
  };

  const handleConnectBrowserWallet = async () => {
    const provider = (window as any).solana;
    if (!provider) {
      alert("Solana wallet extension not found! Please install Phantom or Solflare.");
      window.open("https://phantom.app/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const resp = await provider.connect();
      const connectedWallet: WalletCredentials = {
        publicKey: resp.publicKey.toString(),
        privateKey: "MANAGED_BY_BROWSER_EXTENSION",
        mnemonic: "MANAGED_BY_BROWSER_EXTENSION"
      };
      setWallet(connectedWallet);
      localStorage.setItem('sol_wallet', JSON.stringify(connectedWallet));
    } catch (err) {
      console.error("User rejected connection", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleImportWallet = () => {
    if (!importKey.trim()) return;
    try {
      let secretKey: Uint8Array;
      const trimmedKey = importKey.trim();
      if (trimmedKey.startsWith('[') && trimmedKey.endsWith(']')) {
        secretKey = new Uint8Array(JSON.parse(trimmedKey));
      } else if (/^[0-9a-fA-F]+$/.test(trimmedKey)) {
        const matches = trimmedKey.match(/.{1,2}/g);
        if (!matches) throw new Error("Invalid hex");
        secretKey = new Uint8Array(matches.map(byte => parseInt(byte, 16)));
      } else {
        throw new Error("Unsupported format.");
      }
      const keypair = Keypair.fromSecretKey(secretKey);
      const importedWallet: WalletCredentials = {
        publicKey: keypair.publicKey.toBase58(),
        privateKey: trimmedKey,
        mnemonic: "Imported from Private Key"
      };
      setWallet(importedWallet);
      localStorage.setItem('sol_wallet', JSON.stringify(importedWallet));
      setIsImporting(false);
      setImportKey('');
    } catch (e) {
      alert("Invalid format. Use Private Key Hex or [u8] array.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Lock wallet and clear session?")) {
      setWallet(null);
      localStorage.removeItem('sol_wallet');
      window.location.reload();
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617]">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-6">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
             <img src={DR_LOGO} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-2">Digital Riyal Network</h1>
            <p className="text-slate-400 text-sm">Treasury Wallet Administration Suite</p>
          </div>

          {!isImporting && !isIdentityLogin ? (
            <div className="space-y-3">
              {hasBiometrics && (
                <button 
                  onClick={handleBiometricLogin}
                  className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"/></svg>
                  Biometric Unlock
                </button>
              )}
              
              <button 
                onClick={() => setIsIdentityLogin(true)}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 border border-slate-700"
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Restore with Identity
              </button>

              <button 
                disabled={isConnecting}
                onClick={handleConnectBrowserWallet}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-3"
              >
                {isConnecting ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/></svg>
                )}
                Connect Extension
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={handleCreateWallet}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all text-sm"
                >
                  New Wallet
                </button>
                <button 
                  onClick={() => setIsImporting(true)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-sm border border-slate-700"
                >
                  Import Key
                </button>
              </div>
            </div>
          ) : isIdentityLogin ? (
            <div className="space-y-4 text-left animate-in fade-in zoom-in-95">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                  {otpSent ? 'Security Code' : 'Email or Phone Number'}
                </label>
                {!otpSent ? (
                  <input 
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or +1..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                ) : (
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center text-xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsIdentityLogin(false); setOtpSent(false); }}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm"
                >
                  Back
                </button>
                <button 
                  disabled={isConnecting}
                  onClick={handleIdentityLoginSubmit}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm flex items-center justify-center"
                >
                  {isConnecting ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (otpSent ? 'Verify Identity' : 'Send Code')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Private Key (Hex or JSON)</label>
              <textarea 
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="0a1b2c... or [1,2,3...]"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm mono h-24 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsImporting(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm"
                >
                  Back
                </button>
                <button 
                  onClick={handleImportWallet}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm"
                >
                  Access
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
            <div className="flex items-center gap-3">
              <p className="text-slate-400 text-sm font-medium">Admin: {wallet.publicKey.slice(0, 4)}...{wallet.publicKey.slice(-4)}</p>
              <span className="text-slate-800">|</span>
              <select 
                value={cluster}
                onChange={(e) => setCluster(e.target.value as SolanaCluster)}
                className="bg-transparent text-emerald-400 text-xs font-bold border-none focus:ring-0 cursor-pointer uppercase tracking-widest hover:text-emerald-300 transition-colors"
              >
                <option value={SolanaCluster.MAINNET} className="bg-slate-900 text-white">Mainnet</option>
                <option value={SolanaCluster.DEVNET} className="bg-slate-900 text-white">Devnet</option>
                <option value={SolanaCluster.TESTNET} className="bg-slate-900 text-white">Testnet</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-3xl border border-slate-800 shadow-sm">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total SOL</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold mono">{balance.toFixed(4)}</p>
                <button onClick={updateBalance} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {activeTab === AppTab.DASHBOARD && <Dashboard tokens={tokens} cluster={cluster} />}
          {activeTab === AppTab.FACTORY && <TokenFactory wallet={wallet} setTokens={setTokens} solana={solana} />}
          {activeTab === AppTab.MANAGER && <TokenManager tokens={tokens} setTokens={setTokens} solana={solana} />}
          {activeTab === AppTab.AIRDROP && <AirdropTool tokens={tokens} />}
          {activeTab === AppTab.SECURITY && <SecurityPanel wallet={wallet} />}
          {activeTab === AppTab.DEPLOYMENT && <DeploymentPanel />}
        </div>
      </main>
    </div>
  );
};

export default App;
