import { render, screen } from '@testing-library/react';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import type { Tournament } from '@/lib/types';

const tournament: Tournament = {
  id: '1',
  name: 'Test Open',
  buyIn: 100,
  guaranteedPrizePool: 5000,
  startTime: new Date('2023-01-01T10:00:00Z').toISOString(),
  status: 'Upcoming',
};

describe('TournamentCard', () => {
  it('renders tournament information', () => {
    render(<TournamentCard tournament={tournament} />);
    expect(screen.getByText('Test Open')).toBeInTheDocument();
    expect(screen.getByText(/Buy-in:/)).toHaveTextContent('Buy-in: $100');
    expect(screen.getByText(/Prize:/)).toHaveTextContent('Prize: $5,000 GTD');
  });
});
