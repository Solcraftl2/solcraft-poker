// Mock data for development and testing

export interface Launch {
  id: string;
  name: string;
  symbol: string;
  description: string;
  totalSupply: number;
  price: number;
  raised: number;
  target: number;
  status: 'active' | 'completed' | 'upcoming';
  creator: string;
  createdAt: Date;
  endDate: Date;
  image?: string;
}

// Mock launch data
const mockLaunches: Launch[] = [
  {
    id: '1',
    name: 'SolCraft Token',
    symbol: 'SCT',
    description: 'The native token for SolCraft gaming ecosystem',
    totalSupply: 1000000,
    price: 0.1,
    raised: 50000,
    target: 100000,
    status: 'active',
    creator: '0x123...abc',
    createdAt: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    image: '/images/solcraft-token.png'
  },
  {
    id: '2',
    name: 'Poker Chip',
    symbol: 'CHIP',
    description: 'Gaming token for poker tournaments',
    totalSupply: 500000,
    price: 0.05,
    raised: 25000,
    target: 50000,
    status: 'active',
    creator: '0x456...def',
    createdAt: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    image: '/images/poker-chip.png'
  }
];

// Export functions
export const getLaunch = (id: string): Launch | undefined => {
  return mockLaunches.find(launch => launch.id === id);
};

export const getAllLaunches = (): Launch[] => {
  return mockLaunches;
};

export const getActiveLaunches = (): Launch[] => {
  return mockLaunches.filter(launch => launch.status === 'active');
};

export const getCompletedLaunches = (): Launch[] => {
  return mockLaunches.filter(launch => launch.status === 'completed');
};

export const getUpcomingLaunches = (): Launch[] => {
  return mockLaunches.filter(launch => launch.status === 'upcoming');
};

