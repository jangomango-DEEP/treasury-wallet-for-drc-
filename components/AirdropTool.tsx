
import React, { useState } from 'react';
import { ManagedToken } from '../types';

interface AirdropToolProps {
  tokens: ManagedToken[];
}

const AirdropTool: React.FC<AirdropToolProps> = ({ tokens }) => {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [recipients, setRecipients] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAirdrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) return alert("Select a token first");
    
    setIsProcessing(true);
    // Simulation of multi-transfer transaction
    await new Promise(r => setTimeout(r, 3000));
    setIsProcessing(false);
    alert("Airdrop completed successfully!");
    setRecipients('');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-2xl font-bold mb-2">Multi-Transfer Engine</h2>
          <p className="text-slate-400">Distribute your tokens to thousands of addresses efficiently.</p>
        </div>

        <form onSubmit={handleAirdrop} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400">Select Token to Distribute</label>
            <select 
              value={selectedToken}
              onChange={e => setSelectedToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Choose Token --</option>
              {tokens.map(t => (
                <option key={t.mintAddress} value={t.mintAddress}>{t.name} ({t.symbol})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-slate-400">Recipients List</label>
              <span className="text-xs text-slate-500">Format: address, amount (one per line)</span>
            </div>
            <textarea 
              rows={10}
              value={recipients}
              onChange={e => setRecipients(e.target.value)}
              placeholder={`GvY8...H9zK, 100\nF2aD...P2mX, 50.5\n...`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-4 flex gap-4 items-start">
             <div className="text-purple-400 pt-1">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <div>
               <p className="font-bold text-sm text-purple-200">Processing Efficiency</p>
               <p className="text-xs text-slate-400">Our engine automatically batches up to 20 transfers per transaction to minimize gas fees and maximize speed.</p>
             </div>
          </div>

          <button 
            type="submit"
            disabled={isProcessing || !recipients}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? "Broadcasting Transactions..." : "Initiate Bulk Distribution"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AirdropTool;
