
import React, { useState } from 'react';
import { ManagedToken } from '../types';
import { SolanaService } from '../services/solanaService';

interface TokenManagerProps {
  tokens: ManagedToken[];
  setTokens: React.Dispatch<React.SetStateAction<ManagedToken[]>>;
  solana: SolanaService;
}

const TokenManager: React.FC<TokenManagerProps> = ({ tokens, setTokens, solana }) => {
  const [selectedToken, setSelectedToken] = useState<ManagedToken | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: string) => {
    if (!selectedToken) return;
    setIsProcessing(true);
    
    try {
      let success = false;
      switch (action) {
        case 'Mint':
          success = await solana.mintTo(selectedToken.mintAddress, selectedToken.mintAddress, amount);
          if (success) {
            setTokens(prev => prev.map(t => 
              t.mintAddress === selectedToken.mintAddress ? { ...t, supply: t.supply + amount, balance: t.balance + amount } : t
            ));
          }
          break;
        case 'Burn':
          success = await solana.burn(selectedToken.mintAddress, amount);
          if (success) {
            setTokens(prev => prev.map(t => 
              t.mintAddress === selectedToken.mintAddress ? { ...t, supply: t.supply - amount, balance: t.balance - amount } : t
            ));
          }
          break;
        case 'Revoke Mint Authority':
          if (confirm("WARNING: Revoking mint authority is PERMANENT. You will never be able to mint this token again. Continue?")) {
            success = await solana.revokeAuthority(selectedToken.mintAddress, 'mint');
            if (success) {
              setTokens(prev => prev.map(t => t.mintAddress === selectedToken.mintAddress ? { ...t, mintAuthority: false } : t));
            }
          }
          break;
        case 'Revoke Freeze Authority':
          if (confirm("WARNING: Revoking freeze authority is PERMANENT. Continue?")) {
            success = await solana.revokeAuthority(selectedToken.mintAddress, 'freeze');
            if (success) {
              setTokens(prev => prev.map(t => t.mintAddress === selectedToken.mintAddress ? { ...t, freezeAuthority: false } : t));
            }
          }
          break;
        case 'Freeze Account':
          if (!targetAddress) return alert("Enter target address");
          success = await solana.freezeAccount(selectedToken.mintAddress, targetAddress);
          break;
        case 'Thaw Account':
          if (!targetAddress) return alert("Enter target address");
          success = await solana.thawAccount(selectedToken.mintAddress, targetAddress);
          break;
      }
      
      if (success) {
        alert(`${action} successful on the Solana network!`);
        // Update local selected token reference to reflect state changes
        const updated = tokens.find(t => t.mintAddress === selectedToken.mintAddress);
        if (updated) setSelectedToken(updated);
      }
    } catch (err) {
      alert("Error executing on-chain operation");
    } finally {
      setIsProcessing(false);
      setAmount(0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-xl font-bold mb-4">Select Admin Token</h3>
        <div className="space-y-3">
          {tokens.map(token => (
            <button
              key={token.mintAddress}
              onClick={() => setSelectedToken(token)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border ${
                selectedToken?.mintAddress === token.mintAddress 
                  ? 'bg-purple-600/10 border-purple-500' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-300">
                  {token.symbol.slice(0, 1)}
                </div>
                <div className="text-left">
                  <p className="font-bold">{token.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{token.symbol}</p>
                </div>
              </div>
              <svg className={`w-5 h-5 ${selectedToken?.mintAddress === token.mintAddress ? 'text-purple-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          ))}
          {tokens.length === 0 && (
            <div className="p-8 text-center glass rounded-2xl border-dashed border-slate-800">
              <p className="text-slate-500 text-sm">No tokens available for administration.</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedToken ? (
          <div className="glass rounded-3xl p-8 space-y-8 h-full relative overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="font-bold text-lg animate-pulse">Broadcasting Instruction...</p>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold">{selectedToken.name}</h2>
                <p className="text-slate-500 mono text-sm flex items-center gap-2 mt-1">
                  {selectedToken.mintAddress}
                  <button onClick={() => navigator.clipboard.writeText(selectedToken.mintAddress)} className="hover:text-white transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </button>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${selectedToken.mintAuthority ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  MINT: {selectedToken.mintAuthority ? 'ACTIVE' : 'REVOKED'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${selectedToken.freezeAuthority ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  FREEZE: {selectedToken.freezeAuthority ? 'ACTIVE' : 'REVOKED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Current Supply</p>
                <p className="text-2xl font-bold mono tracking-tight">{selectedToken.supply.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Your Balance</p>
                <p className="text-2xl font-bold mono tracking-tight text-emerald-400">{selectedToken.balance.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Transaction Amount</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold mono text-lg"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  disabled={!selectedToken.mintAuthority || isProcessing}
                  onClick={() => handleAction('Mint')}
                  className="p-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                   Mint New Supply
                </button>
                <button 
                  disabled={isProcessing || selectedToken.balance <= 0}
                  onClick={() => handleAction('Burn')}
                  className="p-5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 rounded-2xl font-bold transition-all shadow-lg shadow-orange-600/10 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.98 7.98 0 01-2.343 5.657z"/></svg>
                  Burn From Balance
                </button>
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-400">Target Holder Address (for Freeze/Thaw)</label>
                    <input 
                      type="text"
                      value={targetAddress}
                      onChange={e => setTargetAddress(e.target.value)}
                      placeholder="Enter Solana wallet or token account address..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      disabled={!selectedToken.freezeAuthority || !targetAddress || isProcessing}
                      onClick={() => handleAction('Freeze Account')}
                      className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl font-bold transition-all text-xs"
                    >
                      Freeze Account
                    </button>
                    <button 
                      disabled={!selectedToken.freezeAuthority || !targetAddress || isProcessing}
                      onClick={() => handleAction('Thaw Account')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl font-bold transition-all text-xs"
                    >
                      Thaw Account
                    </button>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    disabled={!selectedToken.mintAuthority || isProcessing}
                    onClick={() => handleAction('Revoke Mint Authority')}
                    className="p-4 bg-slate-900 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900 border border-slate-800 disabled:opacity-20 rounded-2xl font-semibold transition-all text-xs"
                  >
                    Permanently Revoke Mint Authority
                  </button>
                  <button 
                    disabled={!selectedToken.freezeAuthority || isProcessing}
                    onClick={() => handleAction('Revoke Freeze Authority')}
                    className="p-4 bg-slate-900 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900 border border-slate-800 disabled:opacity-20 rounded-2xl font-semibold transition-all text-xs"
                  >
                    Permanently Revoke Freeze Authority
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center glass rounded-3xl p-8 border-dashed border-slate-800 opacity-50">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <p className="text-slate-500 font-medium">Select a token to unlock administrative powers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenManager;
