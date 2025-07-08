import { PublicKey, Connection, Commitment } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { SEEDS } from './constants';
import type { Address, Amount } from './types';

/**
 * Convert various address formats to PublicKey
 */
export function toPublicKey(address: Address): PublicKey {
  if (typeof address === 'string') {
    return new PublicKey(address);
  }
  return address;
}

/**
 * Convert various amount formats to BN
 */
export function toBN(amount: Amount): BN {
  if (BN.isBN(amount)) {
    return amount;
  }
  if (typeof amount === 'number') {
    return new BN(amount);
  }
  return new BN(amount.toString());
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number | BN): number {
  const bn = BN.isBN(lamports) ? lamports : new BN(lamports);
  return bn.toNumber() / 1e9;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): BN {
  return new BN(Math.floor(sol * 1e9));
}

/**
 * Convert tokens to smallest unit (considering decimals)
 */
export function tokensToSmallestUnit(tokens: number, decimals: number): BN {
  return new BN(Math.floor(tokens * Math.pow(10, decimals)));
}

/**
 * Convert smallest unit to tokens (considering decimals)
 */
export function smallestUnitToTokens(amount: BN, decimals: number): number {
  return amount.toNumber() / Math.pow(10, decimals);
}

/**
 * Find Program Derived Address (PDA)
 */
export async function findPDA(
  seeds: (string | Buffer | Uint8Array)[],
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const seedBuffers = seeds.map(seed => {
    if (typeof seed === 'string') {
      return Buffer.from(seed, 'utf8');
    }
    return Buffer.from(seed);
  });
  
  return PublicKey.findProgramAddressSync(seedBuffers, programId);
}

/**
 * Get game state PDA
 */
export async function getGameStatePDA(programId: PublicKey): Promise<[PublicKey, number]> {
  return findPDA([SEEDS.GAME_STATE], programId);
}

/**
 * Get table PDA
 */
export async function getTablePDA(
  tableId: BN,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return findPDA([SEEDS.TABLE, tableId.toArrayLike(Buffer, 'le', 8)], programId);
}

/**
 * Get player account PDA
 */
export async function getPlayerAccountPDA(
  player: PublicKey,
  table: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return findPDA([SEEDS.PLAYER, player.toBuffer(), table.toBuffer()], programId);
}

/**
 * Get token state PDA
 */
export async function getTokenStatePDA(programId: PublicKey): Promise<[PublicKey, number]> {
  return findPDA([SEEDS.TOKEN_STATE], programId);
}

/**
 * Get stake account PDA
 */
export async function getStakeAccountPDA(
  user: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return findPDA([SEEDS.STAKE, user.toBuffer()], programId);
}

/**
 * Get staking pool PDA
 */
export async function getStakingPoolPDA(programId: PublicKey): Promise<[PublicKey, number]> {
  return findPDA([SEEDS.STAKING_POOL], programId);
}

/**
 * Get tournament PDA
 */
export async function getTournamentPDA(
  tournamentId: BN,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return findPDA([SEEDS.TOURNAMENT, tournamentId.toArrayLike(Buffer, 'le', 8)], programId);
}

/**
 * Get escrow PDA
 */
export async function getEscrowPDA(
  depositor: PublicKey,
  beneficiary: PublicKey,
  mint: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return findPDA([
    SEEDS.ESCROW,
    depositor.toBuffer(),
    beneficiary.toBuffer(),
    mint.toBuffer()
  ], programId);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Check if account exists
 */
export async function accountExists(
  connection: Connection,
  address: PublicKey,
  commitment: Commitment = 'confirmed'
): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(address, commitment);
    return accountInfo !== null;
  } catch {
    return false;
  }
}

/**
 * Get account balance in SOL
 */
export async function getBalance(
  connection: Connection,
  address: PublicKey,
  commitment: Commitment = 'confirmed'
): Promise<number> {
  const balance = await connection.getBalance(address, commitment);
  return lamportsToSol(balance);
}

/**
 * Format address for display (truncate middle)
 */
export function formatAddress(address: Address, chars: number = 4): string {
  const addr = toPublicKey(address).toString();
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

/**
 * Format amount for display
 */
export function formatAmount(
  amount: Amount,
  decimals: number = 9,
  precision: number = 4
): string {
  const bn = toBN(amount);
  const tokens = smallestUnitToTokens(bn, decimals);
  return tokens.toFixed(precision);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, precision: number = 2): string {
  return `${(value * 100).toFixed(precision)}%`;
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Validate Solana address
 */
export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate random table ID
 */
export function generateTableId(): BN {
  return new BN(Math.floor(Math.random() * 1000000));
}

/**
 * Calculate poker hand strength (simplified)
 */
export function calculateHandStrength(cards: string[]): number {
  // Simplified hand strength calculation
  // In a real implementation, this would be much more complex
  return Math.random(); // Placeholder
}

/**
 * Calculate pot odds
 */
export function calculatePotOdds(potSize: number, betSize: number): number {
  return betSize / (potSize + betSize);
}

/**
 * Calculate expected value
 */
export function calculateExpectedValue(
  winProbability: number,
  potSize: number,
  betSize: number
): number {
  const potOdds = calculatePotOdds(potSize, betSize);
  return winProbability * potSize - (1 - winProbability) * betSize;
}

/**
 * Validate bet amount
 */
export function validateBetAmount(
  amount: number,
  playerChips: number,
  minBet: number,
  maxBet: number
): { valid: boolean; error?: string } {
  if (amount < minBet) {
    return { valid: false, error: `Minimum bet is ${minBet}` };
  }
  
  if (amount > maxBet) {
    return { valid: false, error: `Maximum bet is ${maxBet}` };
  }
  
  if (amount > playerChips) {
    return { valid: false, error: 'Insufficient chips' };
  }
  
  return { valid: true };
}

/**
 * Calculate tournament payout structure
 */
export function calculateTournamentPayouts(
  totalPrizePool: number,
  playerCount: number
): number[] {
  const payoutPercentages = [0.5, 0.3, 0.2]; // Top 3 get paid
  const payoutCount = Math.min(3, Math.floor(playerCount / 3));
  
  return payoutPercentages
    .slice(0, payoutCount)
    .map(percentage => totalPrizePool * percentage);
}

/**
 * Generate secure random seed
 */
export function generateSecureRandomSeed(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Hash data using SHA-256
 */
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

