# Database Schema

This document describes the main tables required by the backend service. The database is PostgreSQL (or Supabase) and uses UUIDs as primary keys.

## Tables

### `players`
Stores profile information for each registered poker player.

| Column                     | Type                          | Notes                                   |
|----------------------------|-------------------------------|-----------------------------------------|
| `id`                       | `uuid` PK                     | Generated with `uuid_generate_v4()`     |
| `user_id`                  | `uuid` UNIQUE NOT NULL        | Maps to the auth user                   |
| `name`                     | `text` NOT NULL               | Player display name                     |
| `avatar_url`               | `text`                        | Optional avatar image                   |
| `bio`                      | `text`                        | Optional description                    |
| `ranking`                  | `text` NOT NULL DEFAULT 'BRONZE' | Current ranking tier                |
| `tournaments_played`       | `integer` NOT NULL DEFAULT 0  | Number of tournaments played            |
| `tournaments_won`          | `integer` NOT NULL DEFAULT 0  | Number of tournaments won               |
| `win_rate`                 | `numeric` NOT NULL DEFAULT 0  | Percentage of tournaments won           |
| `created_at`               | `timestamptz` DEFAULT `now()` |                                        |
| `updated_at`               | `timestamptz` DEFAULT `now()` |                                        |

### `tournaments`
Represents a funding round for a single poker event.

| Column                          | Type                            | Notes                                         |
|---------------------------------|---------------------------------|-----------------------------------------------|
| `id`                             | `uuid` PK                       | Generated with `uuid_generate_v4()`           |
| `name`                           | `text` NOT NULL                 | Tournament name                               |
| `description`                    | `text`                          |                                               |
| `game_type`                      | `text` NOT NULL DEFAULT 'Poker' |                                               |
| `creator_user_id`                | `uuid` NOT NULL                 | Owner of the tournament                       |
| `target_pool_amount`             | `numeric` NOT NULL              | Amount to be raised                           |
| `tournament_buy_in`              | `numeric`                       | Optional buy‑in value                         |
| `external_tournament_url`        | `text`                          | Link to the external event                    |
| `player_ranking_at_creation`     | `text` NOT NULL                 | Ranking used to calculate fees                |
| `status`                         | `text` NOT NULL                 | Current state (e.g. `funding_open`)           |
| `initial_platform_fee_pct`       | `numeric` NOT NULL              | Percentage fee paid upfront                   |
| `initial_platform_fee_amount`    | `numeric` NOT NULL              | Calculated from `target_pool_amount`          |
| `initial_platform_fee_paid`      | `boolean` NOT NULL DEFAULT false | Fee settled flag                             |
| `player_guarantee_pct`           | `numeric` NOT NULL              | Percentage guarantee required from player     |
| `player_guarantee_amount_required`| `numeric` NOT NULL              | Calculated guarantee amount                   |
| `player_guarantee_paid`          | `boolean` NOT NULL DEFAULT false | Guarantee settled flag                       |
| `winnings_platform_fee_pct`      | `numeric` NOT NULL              | Platform fee on winnings                      |
| `current_pool_amount`            | `numeric` NOT NULL DEFAULT 0    | Funds collected so far                        |
| `total_winnings_from_tournament` | `numeric`                       | Reported winnings if event finished           |
| `platform_winnings_fee_amount`   | `numeric`                       | Fee charged on winnings                       |
| `net_winnings_for_investors`     | `numeric`                       | Net distribution to investors                 |
| `funding_start_time`             | `timestamptz`                   | Set when guarantee is paid                    |
| `funding_end_time`               | `timestamptz`                   | Optional deadline for funding                 |
| `guarantee_transaction_hash`     | `text`                          | Optional blockchain reference                 |
| `created_at`                     | `timestamptz` DEFAULT `now()`   |                                               |
| `updated_at`                     | `timestamptz` DEFAULT `now()`   |                                               |

### `tournament_investments`
Records investor contributions for a tournament.

| Column                | Type                          | Notes                                                   |
|-----------------------|-------------------------------|---------------------------------------------------------|
| `id`                  | `uuid` PK                     | Generated with `uuid_generate_v4()`                     |
| `tournament_id`       | `uuid` NOT NULL               | References `tournaments(id)`                           |
| `investor_id`         | `uuid` NOT NULL               | User who invested                                      |
| `amount`              | `numeric` NOT NULL            | Amount invested                                        |
| `percentage_of_pool`  | `numeric` NOT NULL            | Portion of total pool this investment represents       |
| `status`              | `text` NOT NULL DEFAULT 'active' | `active`, `refunded`, or `paid_out`                |
| `winnings_amount`     | `numeric`                     | Paid out winnings if applicable                        |
| `created_at`          | `timestamptz` DEFAULT `now()` |                                                        |
| `updated_at`          | `timestamptz` DEFAULT `now()` |                                                        |

## SQL Initialization
Below are SQL statements that can be executed via the Supabase SQL editor or `psql`.

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- players
CREATE TABLE IF NOT EXISTS players (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid UNIQUE NOT NULL,
    name text NOT NULL,
    avatar_url text,
    bio text,
    ranking text NOT NULL DEFAULT 'BRONZE',
    tournaments_played integer NOT NULL DEFAULT 0,
    tournaments_won integer NOT NULL DEFAULT 0,
    win_rate numeric NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- tournaments
CREATE TABLE IF NOT EXISTS tournaments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    game_type text NOT NULL DEFAULT 'Poker',
    creator_user_id uuid NOT NULL,
    target_pool_amount numeric NOT NULL,
    tournament_buy_in numeric,
    external_tournament_url text,
    player_ranking_at_creation text NOT NULL,
    status text NOT NULL,
    initial_platform_fee_pct numeric NOT NULL,
    initial_platform_fee_amount numeric NOT NULL,
    initial_platform_fee_paid boolean NOT NULL DEFAULT false,
    player_guarantee_pct numeric NOT NULL,
    player_guarantee_amount_required numeric NOT NULL,
    player_guarantee_paid boolean NOT NULL DEFAULT false,
    winnings_platform_fee_pct numeric NOT NULL,
    current_pool_amount numeric NOT NULL DEFAULT 0,
    total_winnings_from_tournament numeric,
    platform_winnings_fee_amount numeric,
    net_winnings_for_investors numeric,
    funding_start_time timestamptz,
    funding_end_time timestamptz,
    guarantee_transaction_hash text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- tournament_investments
CREATE TABLE IF NOT EXISTS tournament_investments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
    investor_id uuid NOT NULL,
    amount numeric NOT NULL,
    percentage_of_pool numeric NOT NULL,
    status text NOT NULL DEFAULT 'active',
    winnings_amount numeric,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

## Supabase CLI
If using the Supabase CLI, you can create a migration with:

```bash
supabase migration new init-db
# Place the SQL above inside the generated migration file
supabase db push
```
