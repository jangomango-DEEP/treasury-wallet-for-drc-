
import React from 'react';
import { ManagedToken, SolanaCluster } from '../types';

interface DashboardProps {
  tokens: ManagedToken[];
  cluster: SolanaCluster;
}

const Dashboard: React.FC<DashboardProps> = ({ tokens, cluster }) => {
  const getNetworkLabel = () => {
    switch (cluster) {
      case SolanaCluster.MAINNET: return 'Solana Mainnet';
      case SolanaCluster.DEVNET: return 'Solana Devnet';
      case SolanaCluster.TESTNET: return 'Solana Testnet';
      default: return 'Unknown Network';
    }
  };

  const getStatusColor = () => {
    switch (cluster) {
      case SolanaCluster.MAINNET: return 'bg-emerald-500';
      case SolanaCluster.DEVNET: return 'bg-purple-500';
      case SolanaCluster.TESTNET: return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border-emerald-500/20">
          <p className="text-slate-400 text-sm font-medium mb-1">Network Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${getStatusColor()} rounded-full animate-pulse`}></div>
            <p className="text-xl font-bold">{getNetworkLabel()}</p>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border-purple-500/20">
          <p className="text-slate-400 text-sm font-medium mb-1">Managed Tokens</p>
          <p className="text-3xl font-bold mono">{tokens.length}</p>
        </div>
        <div className="glass p-6 rounded-3xl border-blue-500/20">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Minted Value</p>
          <p className="text-3xl font-bold mono">$0.00</p>
        </div>
      </div>

      <section>
        <h3 className="text-xl font-bold mb-6">Recent Token Activities</h3>
        {tokens.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center border-dashed border-slate-700">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
            </div>
            <p className="text-slate-400 mb-6">No tokens found in your administration.</p>
            <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors">Start Building</button>
          </div>
        ) : (
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Token</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Address</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Supply</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Authorities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tokens.map((token) => (
                  <tr key={token.mintAddress} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xs font-bold uppercase">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold">{token.name}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-widest">{token.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="mono text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">{token.mintAddress.slice(0, 6)}...{token.mintAddress.slice(-6)}</span>
                    </td>
                    <td className="px-6 py-4 font-bold mono">
                      {token.supply.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex gap-2">
                        {token.mintAuthority && <span className="w-2 h-2 bg-emerald-500 rounded-full" title="Mint Authority Enabled"></span>}
                        {token.freezeAuthority && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Freeze Authority Enabled"></span>}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
