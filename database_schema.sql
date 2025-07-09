-- SolCraft Poker Database Schema
-- Firebase Firestore Collections Structure

-- Users Collection
-- Document ID: user_id (auto-generated)
/*
users: {
  user_id: string,
  wallet_address: string,
  email: string (optional),
  username: string,
  created_at: timestamp,
  last_login: timestamp,
  profile: {
    avatar_url: string,
    bio: string,
    tier: string, // Bronze, Silver, Gold, Platinum
    total_invested: number,
    lifetime_roi: number,
    active_investments: number
  },
  preferences: {
    notifications: boolean,
    email_updates: boolean,
    privacy_mode: boolean
  },
  stats: {
    tournaments_joined: number,
    tournaments_won: number,
    total_winnings: number,
    current_streak: number
  }
}
*/

-- Tournaments Collection
-- Document ID: tournament_id (auto-generated)
/*
tournaments: {
  tournament_id: string,
  organizer: string,
  name: string,
  description: string,
  buy_in: number,
  max_players: number,
  current_players: number,
  start_time: timestamp,
  end_time: timestamp,
  status: string, // registration_open, in_progress, completed_won, completed_lost, cancelled
  prize_pool: number,
  prize_distribution: array,
  created_at: timestamp,
  updated_at: timestamp,
  metadata: {
    game_type: string, // Texas Hold'em, Omaha, etc.
    structure: string, // Tournament, Sit & Go, Cash Game
    speed: string, // Regular, Turbo, Hyper-Turbo
    ai_risk_level: string, // Low, Medium, High
    min_age: number,
    max_age: number
  },
  blockchain: {
    smart_contract_address: string,
    transaction_hash: string,
    block_number: number
  }
}
*/

-- Tournament Participants Collection
-- Document ID: participation_id (auto-generated)
/*
tournament_participants: {
  participation_id: string,
  tournament_id: string,
  user_id: string,
  wallet_address: string,
  joined_at: timestamp,
  investment_amount: number,
  status: string, // registered, playing, eliminated, winner
  final_position: number,
  winnings: number,
  roi: number
}
*/

-- Investments Collection
-- Document ID: investment_id (auto-generated)
/*
investments: {
  investment_id: string,
  user_id: string,
  tournament_id: string,
  amount: number,
  currency: string, // SOL, USDC, SOLP
  investment_type: string, // direct, pool, syndicate
  status: string, // pending, active, completed, cancelled
  created_at: timestamp,
  completed_at: timestamp,
  returns: {
    amount: number,
    roi_percentage: number,
    fees_paid: number
  },
  blockchain: {
    transaction_hash: string,
    block_number: number,
    gas_used: number
  }
}
*/

-- Staking Pools Collection
-- Document ID: pool_id (auto-generated)
/*
staking_pools: {
  pool_id: string,
  name: string,
  description: string,
  token_symbol: string, // SOLP
  apy: number,
  total_staked: number,
  total_stakers: number,
  min_stake: number,
  max_stake: number,
  lock_period: number, // in days
  status: string, // active, paused, closed
  created_at: timestamp,
  updated_at: timestamp,
  rewards: {
    total_distributed: number,
    pending_rewards: number,
    last_distribution: timestamp
  }
}
*/

-- User Stakes Collection
-- Document ID: stake_id (auto-generated)
/*
user_stakes: {
  stake_id: string,
  user_id: string,
  pool_id: string,
  amount: number,
  staked_at: timestamp,
  unlock_at: timestamp,
  status: string, // active, unlocked, withdrawn
  rewards_earned: number,
  last_reward_claim: timestamp,
  blockchain: {
    stake_transaction_hash: string,
    unstake_transaction_hash: string
  }
}
*/

-- Governance Proposals Collection
-- Document ID: proposal_id (auto-generated)
/*
governance_proposals: {
  proposal_id: string,
  title: string,
  description: string,
  proposer: string, // user_id
  proposal_type: string, // parameter_change, treasury_spend, feature_request
  status: string, // draft, active, passed, rejected, executed
  created_at: timestamp,
  voting_start: timestamp,
  voting_end: timestamp,
  execution_date: timestamp,
  votes: {
    total_votes: number,
    yes_votes: number,
    no_votes: number,
    abstain_votes: number,
    quorum_required: number,
    quorum_reached: boolean
  },
  blockchain: {
    proposal_transaction_hash: string,
    execution_transaction_hash: string
  }
}
*/

-- User Votes Collection
-- Document ID: vote_id (auto-generated)
/*
user_votes: {
  vote_id: string,
  proposal_id: string,
  user_id: string,
  vote: string, // yes, no, abstain
  voting_power: number,
  voted_at: timestamp,
  blockchain: {
    transaction_hash: string
  }
}
*/

-- Transactions Collection
-- Document ID: transaction_id (auto-generated)
/*
transactions: {
  transaction_id: string,
  user_id: string,
  type: string, // deposit, withdrawal, investment, payout, stake, unstake, vote
  amount: number,
  currency: string,
  status: string, // pending, confirmed, failed, cancelled
  created_at: timestamp,
  confirmed_at: timestamp,
  blockchain: {
    transaction_hash: string,
    block_number: number,
    gas_used: number,
    gas_price: number
  },
  metadata: {
    related_tournament_id: string,
    related_investment_id: string,
    related_stake_id: string,
    notes: string
  }
}
*/

-- Platform Analytics Collection
-- Document ID: analytics_id (auto-generated)
/*
platform_analytics: {
  analytics_id: string,
  date: timestamp,
  metrics: {
    total_users: number,
    active_users_24h: number,
    active_users_7d: number,
    active_users_30d: number,
    total_tournaments: number,
    active_tournaments: number,
    total_prize_pool: number,
    total_investments: number,
    total_staked: number,
    total_governance_proposals: number
  },
  revenue: {
    platform_fees: number,
    staking_fees: number,
    tournament_fees: number
  },
  blockchain: {
    total_transactions: number,
    total_gas_used: number,
    average_gas_price: number
  }
}
*/

