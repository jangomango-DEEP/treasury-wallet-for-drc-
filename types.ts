
export interface TokenMetadata { name: string; symbol: string; decimals: number; description: string; logoUrl?: string; supply: number; }
export interface WalletCredentials { publicKey: string; privateKey: string; mnemonic: string; email?: string; phoneNumber?: string; }
export interface ManagedToken { mintAddress: string; name: string; symbol: string; balance: number; supply: number; mintAuthority: boolean; freezeAuthority: boolean; }
export enum AppTab { DASHBOARD = 'dashboard', FACTORY = 'factory', MANAGER = 'manager', AIRDROP = 'airdrop', SECURITY = 'security', DEPLOYMENT = 'deployment' }
export enum SolanaCluster { MAINNET = 'mainnet-beta', DEVNET = 'devnet', TESTNET = 'testnet' }