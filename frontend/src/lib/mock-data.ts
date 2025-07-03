
import type { Tournament, InvestmentTier, UserProfile, Investment, PortfolioData, SocialPlayer, PortfolioAllocationItem, KeyMetric, Cryptocurrency, RecentActivity, RoadmapItemProps, TournamentTokenizationDetails, PoolState, TournamentAllocation, PlayerDeposit, SubPoolState, TokenLaunch, StakingSummary, StakingPool } from './types';
import { PlayerRank } from './types'; // Import PlayerRank
import { ShieldAlert, ShieldCheck, Shield, Award, Star, Zap, Gem, Crown, TrendingUp as TierTrendingUp, Activity, DollarSign, Users, CalendarDays, TrendingUp } from 'lucide-react';

const defaultTokenPrice = 1; // Assuming $1 per token for easy calculation

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Solana Summer Showdown',
    buyIn: 100,
    guaranteedPrizePool: 10000,
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: 'Upcoming',
    participants: { current: 50, max: 200 },
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Join the biggest Texas Hold\'em tournament on Solana this summer! Big prizes and even bigger glory.',
    platform: 'Solana Poker Club',
    averagePlayers: 150,
    historicalData: 'Previous similar tournaments had an average ROI of 25% for top 10% players. Payout structure is typically top 15% get paid.',
    raisedAmount: 5000,
    aiRiskAssessment: { 
      riskLevel: 'Medium',
      riskFactors: ['Highly competitive field', 'Standard payout structure means many won\'t cash'],
      investmentRecommendation: 'Consider for a small to medium portion of portfolio if comfortable with medium risk.',
      potentialReturn: '1.5x - 3x on cashing, potential for 10x+ on winning.',
    },
    tokenizationDetails: {
      isTokenized: true,
      tokenTicker: 'SSS',
      tokenPrice: defaultTokenPrice, 
      totalTokenSupply: 100 / defaultTokenPrice, 
      minInvestmentTokens: 10, 
      maxInvestmentTokens: 100 / defaultTokenPrice, 
    },
    isCompleted: false,
  },
  {
    id: '2',
    name: 'Crypto Poker Masters',
    buyIn: 500,
    guaranteedPrizePool: 50000,
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    status: 'Upcoming',
    participants: { current: 20, max: 100 },
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'High stakes, high rewards. Only for the serious poker players in the crypto space.',
    platform: 'Decentralized Poker Arena',
    averagePlayers: 80,
    historicalData: 'This is a new high-roller tournament. Similar buy-in events show high variance but potential for large payouts.',
    raisedAmount: 10000,
    aiRiskAssessment: {
        riskLevel: 'High',
        riskFactors: ['High buy-in concentrates risk', 'Smaller field can lead to unpredictable results', 'Professional players expected'],
        investmentRecommendation: 'Suitable for experienced investors with high risk tolerance. Limit exposure.',
        potentialReturn: '0.5x (loss of portion) to 20x+ for winning.',
    },
    tokenizationDetails: {
      isTokenized: true,
      tokenTicker: 'CPM',
      tokenPrice: defaultTokenPrice,
      totalTokenSupply: 500 / defaultTokenPrice,
      minInvestmentTokens: 50 / defaultTokenPrice,
      maxInvestmentTokens: 500 / defaultTokenPrice,
    },
    isCompleted: false,
  },
  {
    id: '3',
    name: 'Weekly Wednesday Freeroll',
    buyIn: 0,
    guaranteedPrizePool: 1000,
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    status: 'Finished',
    participants: { current: 300 },
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Our popular weekly freeroll. Great for practice and winning some starting capital.',
    platform: 'Community Poker Platform',
    averagePlayers: 250,
    historicalData: 'Freerolls attract a wide range of skill levels. Payouts are small but frequent for top finishers.',
    isCompleted: true,
    prizeWon: 1000,
    raisedAmount: 0,
  },
  {
    id: '4',
    name: 'Nightly Turbo Challenge',
    buyIn: 50,
    guaranteedPrizePool: 2000,
    startTime: new Date().toISOString(), // Happening now-ish
    status: 'Live',
    participants: { current: 80, max: 150 },
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Fast-paced turbo tournament. Quick games, quick wins!',
    platform: 'Speed Poker Online',
    averagePlayers: 100,
    historicalData: 'Turbo structures favor aggressive play. Player skill variance can be high.',
    raisedAmount: 4000,
    aiRiskAssessment: {
        riskLevel: 'Medium',
        riskFactors: ['Turbo format increases variance', 'Wide range of player skills usually present.'],
        investmentRecommendation: 'Moderate investment if familiar with turbo dynamics.',
        potentialReturn: '1x - 5x on cashing.',
    },
    tokenizationDetails: {
      isTokenized: false, 
      tokenTicker: 'NTC',
      tokenPrice: defaultTokenPrice,
      totalTokenSupply: 0,
      minInvestmentTokens: 0,
      maxInvestmentTokens: 0,
    },
    isCompleted: false,
  },
];

const TOKEN_PRICE_FOR_MOCK_TIERS = 1;

export const mockInvestmentTiers: InvestmentTier[] = [
  {
    id: 'tierBronze',
    name: 'Bronze Access',
    minInvestmentCurrency: 10,
    maxInvestmentCurrency: 250,
    minInvestmentTokens: 10 / TOKEN_PRICE_FOR_MOCK_TIERS,
    maxInvestmentTokens: 250 / TOKEN_PRICE_FOR_MOCK_TIERS,
    platformFeePercentage: 5,
    priorityDescription: 'Basic access to available tournaments.',
    potentialReturn: 'Est. 1.1x - 1.5x',
    riskLevel: 'Low',
    description: 'Standard entry-level investment tier.',
    benefits: ['Lowest capital requirement', 'Good for exploring tournament investments'],
  },
  {
    id: 'tierSilver',
    name: 'Silver Access',
    minInvestmentCurrency: 100,
    maxInvestmentCurrency: 500,
    minInvestmentTokens: 100 / TOKEN_PRICE_FOR_MOCK_TIERS,
    maxInvestmentTokens: 500 / TOKEN_PRICE_FOR_MOCK_TIERS,
    platformFeePercentage: 4,
    priorityDescription: 'Standard access to a wider range of tournaments.',
    potentialReturn: 'Est. 1.3x - 2.0x',
    riskLevel: 'Medium',
    description: 'A balanced option for growing your portfolio.',
    benefits: ['Access to more diverse tournaments', 'Moderate return potential'],
  },
  {
    id: 'tierGold',
    name: 'Gold Access',
    minInvestmentCurrency: 250,
    maxInvestmentCurrency: 750,
    minInvestmentTokens: 250 / TOKEN_PRICE_FOR_MOCK_TIERS,
    maxInvestmentTokens: 750 / TOKEN_PRICE_FOR_MOCK_TIERS,
    platformFeePercentage: 3,
    priorityDescription: 'Early access to select tournaments.',
    potentialReturn: 'Est. 1.5x - 3.0x',
    riskLevel: 'Medium',
    description: 'Preferred access and better fee structure for serious investors.',
    benefits: ['Early notification for new tournaments', 'Improved fee rates', 'Higher investment caps'],
  },
  {
    id: 'tierPlatinum',
    name: 'Platinum Access',
    minInvestmentCurrency: 500,
    maxInvestmentCurrency: 1000,
    minInvestmentTokens: 500 / TOKEN_PRICE_FOR_MOCK_TIERS,
    maxInvestmentTokens: 1000 / TOKEN_PRICE_FOR_MOCK_TIERS,
    platformFeePercentage: 2,
    priorityDescription: 'First access to high-value tournaments.',
    potentialReturn: 'Est. 2.0x - 5x+',
    riskLevel: 'High',
    description: 'Exclusive tier for top investors seeking maximum returns and benefits.',
    benefits: ['Priority access to all tournaments', 'Lowest platform fees', 'Exclusive insights & support'],
  },
];


export const mockUserProfile: UserProfile = {
  id: 'user123', // Usually matches uid
  uid: 'user123', // Firebase Auth UID
  email: 'stakeoshi@example.com',
  name: 'Satoshi Stakeoshi',
  username: 'Stakeoshi',
  avatarUrl: 'https://placehold.co/100x100.png',
  bio: 'Poker enthusiast & Solana believer. Investing in the future of cards.',
  joinedDate: new Date('2023-01-15').toISOString(),
  followersCount: 1250,
  followingCount: 300,
  totalInvested: 650, // Sum of inv1 (100) + inv3 (500) + inv4 (50)
  overallReturn: 25.5, // Example percentage
  ranking: 42,
  isWalletConnected: true,
  walletAddress: 'sol...4x2z',
  balance: { amount: 12345.67, currency: 'USD' },
  currentInvestmentTierName: 'Gold Access',
};

export const mockInvestments: Investment[] = [
  {
    id: 'inv1',
    investorId: mockUserProfile.id, // Link to the mock user
    tournamentId: '1',
    tournamentName: 'Solana Summer Showdown',
    tierName: 'Silver Access',
    investmentValueUSD: 100,
    tokenAmount: 100, 
    investmentDate: new Date('2024-07-10').toISOString(),
    status: 'Active',
    currentValue: 115,
  },
  {
    id: 'inv2',
    investorId: mockUserProfile.id, // Link to the mock user
    tournamentId: '3',
    tournamentName: 'Weekly Wednesday Freeroll',
    tierName: 'Bronze Access',
    investmentValueUSD: 0, // Freeroll
    tokenAmount: 0,
    investmentDate: new Date('2024-07-15').toISOString(),
    status: 'Cashed Out',
    returnOnInvestment: 20, // Won $20
  },
  {
    id: 'inv3',
    investorId: mockUserProfile.id, // Link to the mock user
    tournamentName: 'Old Crypto Challenge',
    tournamentId: 'old_tourney_123', // A made-up ID for an older tournament
    tierName: 'Gold Access',
    investmentValueUSD: 500,
    tokenAmount: 500,
    investmentDate: new Date('2024-06-01').toISOString(),
    status: 'Lost',
    returnOnInvestment: -500, // Lost the full amount
  },
   {
    id: 'inv4',
    investorId: mockUserProfile.id, // Link to the mock user
    tournamentId: '4',
    tournamentName: 'Nightly Turbo Challenge',
    tierName: 'Silver Access',
    investmentValueUSD: 50,
    tokenAmount: 50,
    investmentDate: new Date().toISOString(), // Today
    status: 'Active',
    currentValue: 50, // No change yet as it's live
  },
];

export const mockPortfolioData: PortfolioData = {
  totalValue: 18500,
  totalInvested: 15000,
  overallReturn: 23.33,
  bestPerformingInvestment: mockInvestments[0],
  worstPerformingInvestment: mockInvestments[2],
};


export const mockSocialPlayers: SocialPlayer[] = [
  {
    id: 'player1',
    uid: 'player1',
    email: 'ace@example.com',
    name: 'Ace High',
    username: 'AceHighRoller',
    avatarUrl: 'https://placehold.co/80x80.png',
    bio: 'Living life one hand at a time.',
    joinedDate: new Date('2022-05-20').toISOString(),
    followersCount: 5200,
    followingCount: 150,
    totalInvested: 150000,
    overallReturn: 45.2,
    ranking: 1,
    recentPerformance: 'Won the Monthly Major ($50k prize)',
    isFollowed: true,
    balance: { amount: 250000, currency: 'USD' },
    currentInvestmentTierName: 'Platinum Access',
  },
  {
    id: 'player2',
    uid: 'player2',
    email: 'bluff@example.com',
    name: 'Bluff Queen',
    username: 'TheBluffQueen',
    avatarUrl: 'https://placehold.co/80x80.png',
    bio: 'They never see it coming.',
    joinedDate: new Date('2023-08-10').toISOString(),
    followersCount: 3100,
    followingCount: 80,
    totalInvested: 75000,
    overallReturn: 30.8,
    ranking: 5,
    recentPerformance: 'Final tabled 3 events this month',
    isFollowed: false,
    balance: { amount: 120000, currency: 'USD' },
    currentInvestmentTierName: 'Gold Access',
  },
  {
    id: 'player3',
    uid: 'player3',
    email: 'grinder@example.com',
    name: 'Grind Master',
    username: 'SteadyGrinder',
    avatarUrl: 'https://placehold.co/80x80.png',
    bio: 'Slow and steady wins the race.',
    joinedDate: new Date('2021-11-01').toISOString(),
    followersCount: 2000,
    followingCount: 500,
    totalInvested: 50000,
    overallReturn: 15.5,
    ranking: 12,
    recentPerformance: 'Consistently in the money',
    isFollowed: true,
    balance: { amount: 80000, currency: 'USD' },
    currentInvestmentTierName: 'Silver Access',
  },
];

export const portfolioPerformanceData = [
  { date: 'Jan', value: 10000 },
  { date: 'Feb', value: 10500 },
  { date: 'Mar', value: 11500 },
  { date: 'Apr', value: 11000 },
  { date: 'May', value: 12500 },
  { date: 'Jun', value: 13000 },
  { date: 'Jul', value: 15000 },
];


export const riskLevelIconMap = {
  Low: ShieldCheck,
  Medium: Shield,
  High: ShieldAlert,
};

export const riskLevelColorMap = {
  Low: 'text-green-500',
  Medium: 'text-yellow-500',
  High: 'text-red-500',
};

export const priorityIconMap = {
    "First access to high-value tournaments.": Gem, 
    "Early access to select tournaments.": Star, 
    "Standard access to a wider range of tournaments.": Award, 
    "Basic access to available tournaments.": Zap, 
};

export const pageSpinnerStyle = "h-8 w-8 animate-spin text-primary";


export const mockPortfolioAllocation: PortfolioAllocationItem[] = [
  { name: 'Bitcoin', value: 40, color: 'hsl(var(--chart-1))' },
  { name: 'Tether', value: 20, color: 'hsl(var(--chart-2))' },
  { name: 'Ethereum', value: 25, color: 'hsl(var(--chart-3))' },
  { name: 'Cardano', value: 10, color: 'hsl(var(--chart-4))' },
  { name: 'Doge', value: 5, color: 'hsl(var(--chart-5))' },
];


// This is now a fallback/default structure. The dashboard page will generate its own metrics.
export const mockKeyMetrics: KeyMetric[] = [
  { 
    id: 'active-investments', 
    label: 'Active Investments:', 
    value: '0', // Default, will be updated dynamically
    icon: Activity 
  },
  { 
    id: 'total-invested', 
    label: 'Total Invested:', 
    value: '$0', // Default
    icon: Award // Changed from DollarSign to Award
  },
  { 
    id: 'lifetime-roi', 
    label: 'Lifetime ROI:', 
    value: '0.0%', // Default
    icon: TrendingUp, 
    valueClassName: "text-foreground" // Default color
  },
  { 
    id: 'current-tier', 
    label: 'Current Tier:', 
    value: "N/A", // Default
    icon: Crown 
  },
];


export const mockTopCryptocurrencies: Cryptocurrency[] = [
  { id: 'btc', rank: 1, name: 'Bitcoin', ticker: 'BTC', iconUrl: 'https://placehold.co/24x24/orange/white?text=B', price: 60344, change24h: -5.0, volume24h: 34040000000, marketCap: 1184940000000 },
  { id: 'eth', rank: 2, name: 'Ethereum', ticker: 'ETH', iconUrl: 'https://placehold.co/24x24/grey/white?text=E', price: 3350, change24h: -3.2, volume24h: 15000000000, marketCap: 400000000000 },
  { id: 'sol', rank: 3, name: 'Solana', ticker: 'SOL', iconUrl: 'https://placehold.co/24x24/purple/white?text=S', price: 135.50, change24h: 2.5, volume24h: 2500000000, marketCap: 60000000000 },
  { id: 'usdt', rank: 4, name: 'Tether', ticker: 'USDT', iconUrl: 'https://placehold.co/24x24/green/white?text=T', price: 1.00, change24h: 0.0, volume24h: 45000000000, marketCap: 110000000000 },
  { id: 'ada', rank: 5, name: 'Cardano', ticker: 'ADA', iconUrl: 'https://placehold.co/24x24/blue/white?text=A', price: 0.38, change24h: -1.1, volume24h: 300000000, marketCap: 13000000000 },
  { id: 'doge', rank: 6, name: 'Dogecoin', ticker: 'DOGE', iconUrl: 'https://placehold.co/24x24/yellow/black?text=D', price: 0.125, change24h: 0.5, volume24h: 1000000000, marketCap: 18000000000 },
];

export const mockRecentActivity: RecentActivity[] = [
  { id: 'act1', type: 'Investment', date: '07.28.2024', time: '10:15', tokenAmount: '100 SSS', status: 'Completed', viewLink: '/tournaments/1' },
  { id: 'act2', type: 'Investment', date: '07.25.2024', time: '14:30', tokenAmount: '50 NTC', status: 'Completed', viewLink: '/tournaments/4' },
  { id: 'act3', type: 'Payout', date: '07.16.2024', time: '09:00', tokenAmount: '$20.00 (Freeroll)', status: 'Completed', viewLink: '/tournaments/3' },
  { id: 'act4', type: 'Deposit', date: '07.10.2024', time: '11:00', tokenAmount: '0.5 SOL', status: 'Completed' },
  { id: 'act5', type: 'Withdrawal', date: '07.05.2024', time: '16:45', tokenAmount: '100 USDC', status: 'Pending' },
];

export const mockFigmaPortfolioPerformance = [
  { name: 'Day 1', value: 300 }, { name: 'Day 2', value: 450 }, { name: 'Day 3', value: 280 },
  { name: 'Day 4', value: 600 }, { name: 'Day 5', value: 400 }, { name: 'Day 6', value: 750 },
  { name: 'Day 7', value: 500 }, { name: 'Day 8', value: 550 }, { name: 'Day 9', value: 620 },
  { name: 'Day 10', value: 480 }, { name: 'Day 11', value: 700 }, { name: 'Day 12', value: 650 },
  { name: 'Day 13', value: 800 }, { name: 'Day 14', value: 720 }, { name: 'Day 15', value: 600 },
  { name: 'Day 16', value: 680 }, { name: 'Day 17', value: 750 }, { name: 'Day 18', value: 820 },
  { name: 'Day 19', value: 780 }, { name: 'Day 20', value: 850 }, { name: 'Day 21', value: 900 },
  { name: 'Day 22', value: 800 }, { name: 'Day 23', value: 880 }, { name: 'Day 24', value: 920 },
  { name: 'Day 25', value: 850 }, { name: 'Day 26', value: 950 }, { name: 'Day 27', value: 1000 },
  { name: 'Day 28', value: 930 }, { name: 'Day 29', value: 980 }, { name: 'Day 30', value: 1050 },
];

export const roadmapItems: RoadmapItemProps[] = [
  { quarter: 'Q2', year: '2025', milestones: ["Token Development + Deployment", "Cross Chain Bridge Launch", "Community Building", "Presale Launch"] },
  { quarter: 'Q3', year: '2025', milestones: ["Strategic Partnerships", "Layer 2 Core Infrastructure Deployment", "Web3 Interface Release", "Developer Documentation", "Initial Liquidity"], isOffset: true },
  { quarter: 'Q4', year: '2025', milestones: ["Anti-Rug System Display", "Bundle Engine Testnet", "Lock Liquidity Module (V1)", "Swap Optimizer Launch", "Security Dashboard"] },
  { quarter: 'Q1', year: '2026', milestones: ["Advanced DEX Integration", "Launchpad Platform", "Governance Implementation", "Mobile Application Release", "Ecosystem Grants Program"], isOffset: true },
  { quarter: 'Q2', year: '2026', milestones: ["Layer 2 Scaling Solutions", "Cross-Chain Interoperability", "Advanced DeFi Primitives", "Enterprise Solutions", "DAO Transition"], isLast: true }
];

mockTournaments.forEach(t => {
  if (!t.aiRiskAssessment && (t.status === 'Upcoming' || t.status === 'Live')) {
    t.aiRiskAssessment = {
      riskLevel: 'Medium',
      riskFactors: ['General market volatility', 'Player skill unknown'],
      investmentRecommendation: 'Standard due diligence recommended.',
      potentialReturn: 'Varies'
    };
  }
});


// ---- Mock Data for Pool Architecture ----

export const mockPoolState: PoolState = {
  totalDeposits: 500000,
  activeTournamentsFunded: 15,
  availableLiquidity: 150000,
  pendingWithdrawals: 5000,
  totalReturnsGenerated: 75000,
};

export const mockTournamentAllocations: TournamentAllocation[] = [
  {
    id: 'alloc1',
    tournamentId: mockTournaments[0].id, // Solana Summer Showdown
    tournamentName: mockTournaments[0].name,
    allocatedAmount: mockTournaments[0].buyIn * (mockTournaments[0].participants?.current || 0), // Example: current players fully funded
    status: 'Funding',
    expectedReturnRate: 25, // 25%
    numberOfInvestors: (mockTournaments[0].participants?.current || 0) / 2, // Example
  },
  {
    id: 'alloc2',
    tournamentId: mockTournaments[1].id, // Crypto Poker Masters
    tournamentName: mockTournaments[1].name,
    allocatedAmount: mockTournaments[1].buyIn * (mockTournaments[1].participants?.current || 0),
    status: 'Active',
    expectedReturnRate: 50, // 50%
    numberOfInvestors: (mockTournaments[1].participants?.current || 0) / 3, // Example
  },
  {
    id: 'alloc3',
    tournamentId: mockTournaments[2].id, // Weekly Wednesday Freeroll
    tournamentName: mockTournaments[2].name,
    allocatedAmount: 0, // Freeroll
    status: 'Completed',
    actualReturnAmount: 50, // Example net return to pool after distribution
    numberOfInvestors: (mockTournaments[2].participants?.current || 0),
  },
];

export const mockPlayerDeposits: PlayerDeposit[] = [
  {
    id: 'deposit1',
    playerId: mockSocialPlayers[0].uid, // Ace High
    playerName: mockSocialPlayers[0].name,
    playerRank: PlayerRank.PLATINUM,
    depositAmount: 500, // Platinum might deposit for a high-stakes game
    currency: 'USD',
    tournamentId: mockTournaments[1].id, // Crypto Poker Masters
    status: 'Locked',
    depositDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'deposit2',
    playerId: mockSocialPlayers[1].uid, // Bluff Queen
    playerName: mockSocialPlayers[1].name,
    playerRank: PlayerRank.GOLD,
    depositAmount: 100,
    currency: 'USD',
    tournamentId: mockTournaments[0].id, // Solana Summer Showdown
    status: 'Locked',
    depositDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'deposit3',
    playerId: mockSocialPlayers[2].uid, // Grind Master
    playerName: mockSocialPlayers[2].name,
    playerRank: PlayerRank.SILVER,
    depositAmount: 50,
    currency: 'USD',
    tournamentId: mockTournaments[3].id, // Nightly Turbo Challenge
    status: 'Locked',
    depositDate: new Date().toISOString(), // Today
  },
  {
    id: 'deposit4',
    playerId: 'newPlayerUID',
    playerName: 'New Player',
    playerRank: PlayerRank.UNVERIFIED,
    depositAmount: 75, // Unverified might have higher relative deposit
    currency: 'USD',
    tournamentId: mockTournaments[3].id,
    status: 'Pending', // Pending verification
    depositDate: new Date().toISOString(),
  },
];

export const mockSubPoolStates: SubPoolState[] = [
  {
    rankCategory: PlayerRank.PLATINUM,
    totalDeposits: 10000,
    totalLockedFunds: mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.PLATINUM && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    availableForWithdrawal: 10000 - mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.PLATINUM && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    totalPenaltyFundsCollected: 50,
    numberOfPlayers: mockSocialPlayers.filter(p => p.currentInvestmentTierName === "Platinum Access").length + 1, // Example
  },
  {
    rankCategory: PlayerRank.GOLD,
    totalDeposits: 25000,
    totalLockedFunds: mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.GOLD && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    availableForWithdrawal: 25000 - mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.GOLD && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    totalPenaltyFundsCollected: 200,
    numberOfPlayers: mockSocialPlayers.filter(p => p.currentInvestmentTierName === "Gold Access").length + 5, // Example
  },
  {
    rankCategory: PlayerRank.SILVER,
    totalDeposits: 50000,
    totalLockedFunds: mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.SILVER && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    availableForWithdrawal: 50000 - mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.SILVER && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    totalPenaltyFundsCollected: 500,
    numberOfPlayers: mockSocialPlayers.filter(p => p.currentInvestmentTierName === "Silver Access").length + 10, // Example
  },
  {
    rankCategory: PlayerRank.BRONZE,
    totalDeposits: 30000,
    totalLockedFunds: 0, // No mock deposits for Bronze yet
    availableForWithdrawal: 30000,
    totalPenaltyFundsCollected: 300,
    numberOfPlayers: 20, // Example
  },
  {
    rankCategory: PlayerRank.UNVERIFIED,
    totalDeposits: 5000,
    totalLockedFunds: mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.UNVERIFIED && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    availableForWithdrawal: 5000 - mockPlayerDeposits.filter(d => d.playerRank === PlayerRank.UNVERIFIED && d.status === 'Locked').reduce((sum, d) => sum + d.depositAmount, 0),
    totalPenaltyFundsCollected: 100,
    numberOfPlayers: 5, // Example
  },
];


// ---- New Mock Data for Launchtoken and Staking ----

export const mockTokenLaunches: TokenLaunch[] = [
  {
    id: 'launch1',
    name: 'NovaNet AI',
    ticker: 'NNAI',
    logoUrl: 'https://placehold.co/64x64/3498DB/FFFFFF.png?text=AI',
    description: 'Decentralized AI computation network built on Solana, leveraging community-driven data validation.',
    stage: 'Live',
    targetRaise: 500000,
    raisedAmount: 350000,
    tokenPrice: 0.10,
    currency: 'USDC',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    projectWebsite: '#',
    whitepaperLink: '#',
    detailsLink: '/launchtoken/launch1',
    category: 'AI / DePIN',
    isFeatured: true,
    tags: ["AI", "DePIN", "Solana"],
    vestingSchedule: "15% TGE, 6 months linear vesting",
    totalSupply: 1000000000,
    circulatingSupplyOnLaunch: 150000000,
  },
  {
    id: 'launch2',
    name: 'PixelPioneers',
    ticker: 'PIXO',
    logoUrl: 'https://placehold.co/64x64/E67E22/FFFFFF.png?text=PX',
    description: 'A community-driven pixel art NFT marketplace and collaborative metaverse experience.',
    stage: 'Upcoming',
    targetRaise: 200000,
    raisedAmount: 0,
    tokenPrice: 0.05,
    currency: 'USDC',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    projectWebsite: '#',
    whitepaperLink: '#',
    detailsLink: '/launchtoken/launch2',
    category: 'GameFi / NFT',
    tags: ["NFT", "Metaverse", "Gaming"],
    vestingSchedule: "10% TGE, 12 months cliff, then linear",
  },
  {
    id: 'launch3',
    name: 'DeFiGuard',
    ticker: 'DFG',
    logoUrl: 'https://placehold.co/64x64/2ECC71/FFFFFF.png?text=DG',
    description: 'Automated security and auditing solutions for DeFi protocols, ensuring safer investments.',
    stage: 'Ended',
    targetRaise: 300000,
    raisedAmount: 320000, // Slightly overfunded
    tokenPrice: 0.20,
    currency: 'USDC',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    projectWebsite: '#',
    whitepaperLink: '#',
    detailsLink: '/launchtoken/launch3',
    category: 'DeFi / Security',
    tags: ["Security", "Audit", "DeFi"],
  },
  {
    id: 'launch4',
    name: 'SolStream',
    ticker: 'STRM',
    logoUrl: 'https://placehold.co/64x64/9B59B6/FFFFFF.png?text=ST',
    description: 'Decentralized video streaming platform with tokenized content monetization and creator rewards.',
    stage: 'Upcoming',
    targetRaise: 1000000,
    raisedAmount: 10000, // Small amount already pledged
    tokenPrice: 0.02,
    currency: 'USDC',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    projectWebsite: '#',
    whitepaperLink: '#',
    detailsLink: '/launchtoken/launch4',
    category: 'Media / DePIN',
    isFeatured: true,
    tags: ["Streaming", "Web3", "Creator Economy"],
    vestingSchedule: "5% TGE, 3 month cliff, 24 months linear",
    totalSupply: 5000000000,
  },
];

export const mockStakingSummary: StakingSummary = {
  totalStakedUSD: 12500.75,
  totalRewardsEarnedUSD: 875.30,
  averageAPY: 8.25,
  activeStakesCount: 3,
};

export const mockStakingPools: StakingPool[] = [
  {
    id: 'pool1',
    assetName: 'Solana',
    assetTicker: 'SOL',
    assetLogoUrl: 'https://placehold.co/40x40/8A2BE2/FFFFFF.png?text=S', // Purple for Solana
    apy: 7.5,
    lockUpPeriod: 'Flexible',
    totalStakedInPoolUSD: 15000000,
    userStakedAmount: 50.25, // In SOL
    userRewardsEarned: 3.51, // In SOL
    platform: 'SolCraft Native',
    riskLevel: 'Low',
    detailsLink: '/staking/sol-native',
    type: 'Liquid',
    isFeatured: true,
    availableToStake: true,
  },
  {
    id: 'pool2',
    assetName: 'USDC',
    assetTicker: 'USDC',
    assetLogoUrl: 'https://placehold.co/40x40/2775CA/FFFFFF.png?text=U', // Blue for USDC
    apy: 5.2,
    lockUpPeriod: '30 Days',
    minStake: 100,
    totalStakedInPoolUSD: 25000000,
    platform: 'Yield Aggregator X',
    riskLevel: 'Low',
    detailsLink: '/staking/usdc-30d',
    type: 'Native',
    availableToStake: true,
  },
  {
    id: 'pool3',
    assetName: 'SolCraft Token',
    assetTicker: 'SCT',
    assetLogoUrl: 'https://placehold.co/40x40/E573A5/FFFFFF.png?text=SC', // Solcraft Pink
    apy: 15.0,
    lockUpPeriod: '90 Days',
    minStake: 1000, // In SCT
    totalStakedInPoolUSD: 5000000,
    userStakedAmount: 2500, // In SCT
    userRewardsEarned: 150.75, // In SCT
    platform: 'SolCraft Native',
    riskLevel: 'Medium',
    detailsLink: '/staking/sct-90d',
    type: 'Native',
    isFeatured: true,
    availableToStake: true,
  },
  {
    id: 'pool4',
    assetName: 'Jupiter Liquidity Pool',
    assetTicker: 'JUP-USDC LP',
    assetLogoUrl: 'https://placehold.co/40x40/FFA500/000000.png?text=LP',
    apy: 22.5, // APY for LP farming can be higher
    lockUpPeriod: 'Flexible (with unbonding)',
    totalStakedInPoolUSD: 8000000,
    platform: 'Jupiter Exchange',
    riskLevel: 'High', // LP farming has impermanent loss risk
    detailsLink: '/staking/jup-usdc-lp',
    type: 'LP Farming',
    availableToStake: true,
  },
  {
    id: 'pool5',
    assetName: 'mSOL (Marinade Staked SOL)',
    assetTicker: 'mSOL',
    assetLogoUrl: 'https://placehold.co/40x40/F26A3D/FFFFFF.png?text=mS', // Marinade Orange
    apy: 6.8,
    lockUpPeriod: 'Liquid',
    totalStakedInPoolUSD: 120000000,
    platform: 'Marinade Finance',
    riskLevel: 'Low',
    detailsLink: '/staking/msol-liquid',
    type: 'Liquid',
    availableToStake: false, // Example of a pool not currently open
  },
];
