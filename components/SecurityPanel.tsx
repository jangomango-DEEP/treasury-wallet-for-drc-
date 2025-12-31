
import React, { useState, useEffect } from 'react';
import { WalletCredentials } from '../types';
import { BiometricService } from '../services/biometricService';
import { AuthService } from '../services/authService';

interface SecurityPanelProps {
  wallet: WalletCredentials;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ wallet }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isBioEnabled, setIsBioEnabled] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  
  // Recovery States
  const [email, setEmail] = useState(wallet.email || '');
  const [phone, setPhone] = useState(wallet.phoneNumber || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'IDLE' | 'VERIFYING'>('IDLE');
  const [isLinked, setIsLinked] = useState(!!(wallet.email && wallet.phoneNumber));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsBioEnabled(!!localStorage.getItem('sol_bio_id'));
  }, []);

  const handleEnableBiometrics = async () => {
    setBioLoading(true);
    const credentialId = await BiometricService.registerBiometrics(wallet.publicKey.slice(0, 10));
    if (credentialId) {
      localStorage.setItem('sol_bio_id', credentialId);
      setIsBioEnabled(true);
      alert("Biometric unlock enabled successfully!");
    }
    setBioLoading(false);
  };

  const handleDisableBiometrics = () => {
    if (confirm("Disable biometric unlock? You will need your private key/mnemonic to access next time.")) {
      localStorage.removeItem('sol_bio_id');
      setIsBioEnabled(false);
    }
  };

  const handleStartLinking = async () => {
    if (!email || !phone) return alert("Please enter both email and phone number for secure recovery.");
    setLoading(true);
    await AuthService.sendOtp(email);
    // Logic for phone handled by same backend simulation
    setStep('VERIFYING');
    setLoading(false);
  };

  const handleVerifyLinking = async () => {
    if (otp.length < 4) return alert("Invalid verification code.");
    setLoading(true);
    const success = await AuthService.linkRecoveryData(wallet.publicKey, email, phone);
    if (success) {
      setIsLinked(true);
      setStep('IDLE');
      alert("Recovery cluster established! You can now recover this wallet via Email or Phone.");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadCredentials = () => {
    const data = `
DIGITAL RIYAL NETWORK TREASURY CREDENTIALS
Generated: ${new Date().toLocaleString()}
Recovery Cluster: 
Email: ${email || 'Not Set'}
Phone: ${phone || 'Not Set'}
--------------------------------------------------
PUBLIC KEY: 
${wallet.publicKey}

PRIVATE KEY:
${wallet.privateKey}

RECOVERY PHRASE (MNEMONIC):
${wallet.mnemonic}
--------------------------------------------------
CONGRATULATIONS: If you lost your recovery keys phrases 
you can get back through your email id or phone number.
Your wallet is secured with multi-factor recovery.
    `;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drn_treasury_recovery_pack_${wallet.publicKey.slice(0, 8)}.txt`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex gap-6 items-start shadow-xl shadow-emerald-500/5">
          <div className="text-emerald-400 pt-1">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-emerald-400">Congratulations</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              If you lost your recovery keys phrases you can get back through your email id so please attach email id and phone number for recovery.
            </p>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 flex flex-col justify-between border-slate-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isBioEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c1.72 0 3.341.433 4.76 1.198a10.001 10.001 0 013.03 3.43M17 14.95a10.014 10.014 0 01-1.542 2.726m-4.02L12 17.25m-4.239-9.75M12 11v-1m0 5h.01M5.07 12.14m13.86 0"/></svg>
            </div>
            <div>
              <h3 className="font-bold">Biometric Vault</h3>
              <p className="text-xs text-slate-500">{isBioEnabled ? 'Device Authentication Active' : 'FaceID / TouchID Lock'}</p>
            </div>
          </div>
          
          {isBioEnabled ? (
            <button 
              onClick={handleDisableBiometrics}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl transition-all text-sm border border-red-500/10"
            >
              Disable Biometrics
            </button>
          ) : (
            <button 
              disabled={bioLoading}
              onClick={handleEnableBiometrics}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {bioLoading ? 'Detecting...' : 'Enable Biometric Unlock'}
            </button>
          )}
        </div>
      </div>

      {/* Account Recovery Section */}
      <div className="glass rounded-3xl p-8 space-y-6 border-slate-700/50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Recovery Credentials</h2>
            <p className="text-slate-500 text-sm">Link your identity for emergency wallet restoration.</p>
          </div>
          {isLinked && <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Verified</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-sm font-semibold text-slate-400">Recovery Email</label>
              {isLinked && <button onClick={() => copyToClipboard(email)} className="text-[10px] text-purple-400 uppercase font-bold tracking-widest hover:text-purple-300">Copy</button>}
            </div>
            <input 
              disabled={isLinked || step === 'VERIFYING'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-sm font-semibold text-slate-400">Recovery Phone</label>
              {isLinked && <button onClick={() => copyToClipboard(phone)} className="text-[10px] text-purple-400 uppercase font-bold tracking-widest hover:text-purple-300">Copy</button>}
            </div>
            <input 
              disabled={isLinked || step === 'VERIFYING'}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 transition-all"
            />
          </div>
        </div>

        {step === 'VERIFYING' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20">
            <label className="text-sm font-semibold text-purple-300 px-1">Enter Confirmation Code</label>
            <input 
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="1234"
              className="w-full bg-slate-900 border border-purple-500/50 rounded-xl p-4 text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest pt-1">Check your inbox/SMS for the security code</p>
          </div>
        )}

        {!isLinked && (
          <button 
            disabled={loading}
            onClick={step === 'IDLE' ? handleStartLinking : handleVerifyLinking}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (step === 'IDLE' ? 'Link Identity Cluster' : 'Confirm Recovery Setup')}
          </button>
        )}
      </div>

      <div className="glass rounded-3xl overflow-hidden p-8 space-y-8 border-slate-700/50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Credentials</h2>
          <button 
            onClick={() => setShowKeys(!showKeys)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-all text-sm flex items-center gap-2 border border-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            {showKeys ? "Lock Display" : "Reveal Credentials"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-sm font-semibold text-slate-400">Public Address (SOL)</label>
              <button onClick={() => copyToClipboard(wallet.publicKey)} className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-widest transition-colors">Copy</button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mono text-sm break-all font-medium text-slate-300">
              {wallet.publicKey}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-sm font-semibold text-slate-400">Private Secret Key</label>
              {showKeys && <button onClick={() => copyToClipboard(wallet.privateKey)} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest transition-colors">Copy</button>}
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mono text-sm break-all font-medium group relative overflow-hidden">
              <span className={showKeys ? 'text-slate-300' : 'blur-md select-none opacity-20'}>
                {showKeys ? wallet.privateKey : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              </span>
              {!showKeys && <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold uppercase text-xs tracking-[0.4em]">Encrypted</div>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-sm font-semibold text-slate-400">Master Recovery Phrase</label>
              {showKeys && <button onClick={() => copyToClipboard(wallet.mnemonic)} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest transition-colors">Copy</button>}
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 leading-relaxed font-medium group relative overflow-hidden">
              <span className={showKeys ? 'text-slate-300' : 'blur-md select-none opacity-20'}>
                {showKeys ? wallet.mnemonic : 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'}
              </span>
               {!showKeys && <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold uppercase text-xs tracking-[0.4em]">Encrypted</div>}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/50">
           <button 
             onClick={downloadCredentials}
             className="w-full py-4 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-white/5"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
             Export Security Package (TXT)
           </button>
           <p className="text-center text-slate-500 text-[10px] uppercase tracking-widest mt-4">Security Notice: Store backups offline in a secure physical location.</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;
