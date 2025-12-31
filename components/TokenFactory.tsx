
import React, { useState } from 'react';
import { WalletCredentials, ManagedToken } from '../types';
import { SolanaService } from '../services/solanaService';

interface TokenFactoryProps {
  wallet: WalletCredentials;
  setTokens: React.Dispatch<React.SetStateAction<ManagedToken[]>>;
  solana: SolanaService;
}

const TokenFactory: React.FC<TokenFactoryProps> = ({ wallet, setTokens, solana }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    supply: 1000000,
    description: '',
    mintAuth: true,
    freezeAuth: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await solana.createToken(wallet.publicKey, formData);
      const newToken: ManagedToken = {
        mintAddress: result.mintAddress,
        name: formData.name,
        symbol: formData.symbol,
        balance: formData.supply,
        supply: formData.supply,
        mintAuthority: formData.mintAuth,
        freezeAuthority: formData.freezeAuth
      };
      setTokens(prev => [...prev, newToken]);
      alert("Token created successfully on Solana!");
      setFormData({ name: '', symbol: '', decimals: 9, supply: 1000000, description: '', mintAuth: true, freezeAuth: true });
    } catch (err) {
      alert("Failed to create token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-2xl font-bold mb-2">Create New SPL Token</h2>
          <p className="text-slate-400">Launch your own currency on the Solana network instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Token Name</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. My Awesome Token"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Symbol</label>
              <input 
                type="text" required
                value={formData.symbol}
                onChange={e => setFormData({...formData, symbol: e.target.value})}
                placeholder="e.g. MAT"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Decimals</label>
              <input 
                type="number" min="0" max="12" required
                value={formData.decimals}
                onChange={e => setFormData({...formData, decimals: parseInt(e.target.value)})}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400">Initial Supply</label>
              <input 
                type="number" required
                value={formData.supply}
                onChange={e => setFormData({...formData, supply: parseInt(e.target.value)})}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Tell the world about your token..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <div className="flex-1 flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
              <input 
                type="checkbox" id="mintAuth"
                checked={formData.mintAuth}
                onChange={e => setFormData({...formData, mintAuth: e.target.checked})}
                className="w-5 h-5 accent-emerald-500"
              />
              <div>
                <label htmlFor="mintAuth" className="font-semibold block cursor-pointer">Mint Authority</label>
                <p className="text-xs text-slate-500">Allow minting more tokens later</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
              <input 
                type="checkbox" id="freezeAuth"
                checked={formData.freezeAuth}
                onChange={e => setFormData({...formData, freezeAuth: e.target.checked})}
                className="w-5 h-5 accent-blue-500"
              />
              <div>
                <label htmlFor="freezeAuth" className="font-semibold block cursor-pointer">Freeze Authority</label>
                <p className="text-xs text-slate-500">Allow freezing holder accounts</p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Deploying to Network...
              </span>
            ) : "Confirm & Create Token"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TokenFactory;
