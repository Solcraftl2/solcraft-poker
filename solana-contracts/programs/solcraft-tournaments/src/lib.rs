use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::collections::BTreeMap;

declare_id!("ToURNAMENTSolCraftPokerProgramId11111111111");

#[program]
pub mod solcraft_tournaments {
    use super::*;

    /// Initialize a new tournament
    pub fn initialize_tournament(
        ctx: Context<InitializeTournament>,
        tournament_id: u64,
        buy_in: u64,
        max_players: u16,
        start_time: i64,
        blind_structure: Vec<BlindLevel>,
        prize_structure: Vec<u8>, // Percentage distribution
    ) -> Result<()> {
        let tournament = &mut ctx.accounts.tournament;
        
        require!(max_players > 1, TournamentError::InvalidMaxPlayers);
        require!(buy_in > 0, TournamentError::InvalidBuyIn);
        require!(prize_structure.iter().sum::<u8>() == 100, TournamentError::InvalidPrizeStructure);
        
        tournament.tournament_id = tournament_id;
        tournament.organizer = ctx.accounts.organizer.key();
        tournament.buy_in = buy_in;
        tournament.max_players = max_players;
        tournament.current_players = 0;
        tournament.start_time = start_time;
        tournament.status = TournamentStatus::Registration;
        tournament.blind_structure = blind_structure;
        tournament.prize_structure = prize_structure;
        tournament.prize_pool = 0;
        tournament.current_blind_level = 0;
        tournament.last_blind_increase = 0;
        tournament.players = Vec::new();
        tournament.eliminated_players = Vec::new();
        tournament.final_table = Vec::new();
        
        emit!(TournamentCreated {
            tournament_id,
            organizer: ctx.accounts.organizer.key(),
            buy_in,
            max_players,
            start_time,
        });
        
        Ok(())
    }

    /// Register a player for the tournament
    pub fn register_player(
        ctx: Context<RegisterPlayer>,
        tournament_id: u64,
    ) -> Result<()> {
        let tournament = &mut ctx.accounts.tournament;
        let player = ctx.accounts.player.key();
        
        require!(tournament.status == TournamentStatus::Registration, TournamentError::RegistrationClosed);
        require!(tournament.current_players < tournament.max_players, TournamentError::TournamentFull);
        require!(!tournament.players.iter().any(|p| p.player == player), TournamentError::AlreadyRegistered);
        
        // Transfer buy-in from player to tournament prize pool
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player_token_account.to_account_info(),
                to: ctx.accounts.tournament_prize_pool.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, tournament.buy_in)?;
        
        // Add player to tournament
        let player_info = PlayerInfo {
            player,
            chips: 10000, // Starting chips
            position: tournament.current_players + 1,
            is_active: true,
            elimination_time: 0,
            final_position: 0,
        };
        
        tournament.players.push(player_info);
        tournament.current_players += 1;
        tournament.prize_pool += tournament.buy_in;
        
        emit!(PlayerRegistered {
            tournament_id,
            player,
            position: tournament.current_players,
        });
        
        Ok(())
    }

    /// Start the tournament
    pub fn start_tournament(
        ctx: Context<StartTournament>,
        tournament_id: u64,
    ) -> Result<()> {
        let tournament = &mut ctx.accounts.tournament;
        
        require!(tournament.organizer == ctx.accounts.organizer.key(), TournamentError::UnauthorizedOrganizer);
        require!(tournament.status == TournamentStatus::Registration, TournamentError::InvalidStatus);
        require!(tournament.current_players >= 2, TournamentError::InsufficientPlayers);
        
        tournament.status = TournamentStatus::InProgress;
        tournament.last_blind_increase = Clock::get()?.unix_timestamp;
        
        emit!(TournamentStarted {
            tournament_id,
            players_count: tournament.current_players,
            prize_pool: tournament.prize_pool,
        });
        
        Ok(())
    }

    /// Eliminate a player from the tournament
    pub fn eliminate_player(
        ctx: Context<EliminatePlayer>,
        tournament_id: u64,
        eliminated_player: Pubkey,
    ) -> Result<()> {
        let tournament = &mut ctx.accounts.tournament;
        
        require!(tournament.organizer == ctx.accounts.organizer.key(), TournamentError::UnauthorizedOrganizer);
        require!(tournament.status == TournamentStatus::InProgress, TournamentError::InvalidStatus);
        
        // Find and eliminate player
        if let Some(player_index) = tournament.players.iter().position(|p| p.player == eliminated_player && p.is_active) {
            tournament.players[player_index].is_active = false;
            tournament.players[player_index].elimination_time = Clock::get()?.unix_timestamp;
            tournament.players[player_index].final_position = tournament.current_players;
            
            let eliminated_player_info = tournament.players[player_index].clone();
            tournament.eliminated_players.push(eliminated_player_info);
            tournament.current_players -= 1;
            
            emit!(PlayerEliminated {
                tournament_id,
                player: eliminated_player,
                final_position: tournament.current_players + 1,
            });
            
            // Check if tournament is finished
            if tournament.current_players == 1 {
                tournament.status = TournamentStatus::Finished;
                self.distribute_prizes(ctx, tournament_id)?;
            }
        }
        
        Ok(())
    }

    /// Distribute prizes to winners
    pub fn distribute_prizes(
        ctx: Context<DistributePrizes>,
        tournament_id: u64,
    ) -> Result<()> {
        let tournament = &mut ctx.accounts.tournament;
        
        require!(tournament.status == TournamentStatus::Finished, TournamentError::TournamentNotFinished);
        require!(tournament.organizer == ctx.accounts.organizer.key(), TournamentError::UnauthorizedOrganizer);
        
        // Sort players by final position
        let mut winners: Vec<_> = tournament.players.iter()
            .filter(|p| !p.is_active || tournament.current_players == 1)
            .collect();
        winners.sort_by(|a, b| a.final_position.cmp(&b.final_position));
        
        // Distribute prizes according to prize structure
        for (index, percentage) in tournament.prize_structure.iter().enumerate() {
            if index < winners.len() && *percentage > 0 {
                let prize_amount = (tournament.prize_pool * (*percentage as u64)) / 100;
                
                // Transfer prize to winner
                // Note: In a real implementation, you would need to handle the token transfer here
                
                emit!(PrizeDistributed {
                    tournament_id,
                    winner: winners[index].player,
                    position: index as u16 + 1,
                    prize_amount,
                });
            }
        }
        
        tournament.status = TournamentStatus::Completed;
        
        Ok(())
    }

    /// Update blind levels
    pub fn update_blind_level(
        ctx: Context<UpdateBlindLevel>,
        tournament_id: u64,
    ) -> Result<()> {
        let tournament = &mut ctx.accounts.tournament;
        
        require!(tournament.organizer == ctx.accounts.organizer.key(), TournamentError::UnauthorizedOrganizer);
        require!(tournament.status == TournamentStatus::InProgress, TournamentError::InvalidStatus);
        
        let current_time = Clock::get()?.unix_timestamp;
        let time_since_last_increase = current_time - tournament.last_blind_increase;
        
        if let Some(current_blind) = tournament.blind_structure.get(tournament.current_blind_level as usize) {
            if time_since_last_increase >= current_blind.duration {
                tournament.current_blind_level += 1;
                tournament.last_blind_increase = current_time;
                
                emit!(BlindLevelUpdated {
                    tournament_id,
                    new_level: tournament.current_blind_level,
                    small_blind: tournament.blind_structure.get(tournament.current_blind_level as usize)
                        .map(|b| b.small_blind).unwrap_or(0),
                    big_blind: tournament.blind_structure.get(tournament.current_blind_level as usize)
                        .map(|b| b.big_blind).unwrap_or(0),
                });
            }
        }
        
        Ok(())
    }
}

// Account Structures
#[derive(Accounts)]
#[instruction(tournament_id: u64)]
pub struct InitializeTournament<'info> {
    #[account(
        init,
        payer = organizer,
        space = 8 + Tournament::INIT_SPACE,
        seeds = [b"tournament", tournament_id.to_le_bytes().as_ref()],
        bump
    )]
    pub tournament: Account<'info, Tournament>,
    
    #[account(mut)]
    pub organizer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tournament_id: u64)]
pub struct RegisterPlayer<'info> {
    #[account(
        mut,
        seeds = [b"tournament", tournament_id.to_le_bytes().as_ref()],
        bump
    )]
    pub tournament: Account<'info, Tournament>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub tournament_prize_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(tournament_id: u64)]
pub struct StartTournament<'info> {
    #[account(
        mut,
        seeds = [b"tournament", tournament_id.to_le_bytes().as_ref()],
        bump
    )]
    pub tournament: Account<'info, Tournament>,
    
    pub organizer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(tournament_id: u64)]
pub struct EliminatePlayer<'info> {
    #[account(
        mut,
        seeds = [b"tournament", tournament_id.to_le_bytes().as_ref()],
        bump
    )]
    pub tournament: Account<'info, Tournament>,
    
    pub organizer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(tournament_id: u64)]
pub struct DistributePrizes<'info> {
    #[account(
        mut,
        seeds = [b"tournament", tournament_id.to_le_bytes().as_ref()],
        bump
    )]
    pub tournament: Account<'info, Tournament>,
    
    pub organizer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(tournament_id: u64)]
pub struct UpdateBlindLevel<'info> {
    #[account(
        mut,
        seeds = [b"tournament", tournament_id.to_le_bytes().as_ref()],
        bump
    )]
    pub tournament: Account<'info, Tournament>,
    
    pub organizer: Signer<'info>,
}

// Data Structures
#[account]
pub struct Tournament {
    pub tournament_id: u64,
    pub organizer: Pubkey,
    pub buy_in: u64,
    pub max_players: u16,
    pub current_players: u16,
    pub start_time: i64,
    pub status: TournamentStatus,
    pub blind_structure: Vec<BlindLevel>,
    pub prize_structure: Vec<u8>,
    pub prize_pool: u64,
    pub current_blind_level: u16,
    pub last_blind_increase: i64,
    pub players: Vec<PlayerInfo>,
    pub eliminated_players: Vec<PlayerInfo>,
    pub final_table: Vec<Pubkey>,
}

impl Tournament {
    pub const INIT_SPACE: usize = 8 + // discriminator
        8 + // tournament_id
        32 + // organizer
        8 + // buy_in
        2 + // max_players
        2 + // current_players
        8 + // start_time
        1 + // status
        4 + (10 * BlindLevel::INIT_SPACE) + // blind_structure (max 10 levels)
        4 + (10 * 1) + // prize_structure (max 10 positions)
        8 + // prize_pool
        2 + // current_blind_level
        8 + // last_blind_increase
        4 + (100 * PlayerInfo::INIT_SPACE) + // players (max 100)
        4 + (100 * PlayerInfo::INIT_SPACE) + // eliminated_players
        4 + (10 * 32); // final_table (max 10 players)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TournamentStatus {
    Registration,
    InProgress,
    Finished,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BlindLevel {
    pub small_blind: u64,
    pub big_blind: u64,
    pub duration: i64, // Duration in seconds
}

impl BlindLevel {
    pub const INIT_SPACE: usize = 8 + 8 + 8; // small_blind + big_blind + duration
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlayerInfo {
    pub player: Pubkey,
    pub chips: u64,
    pub position: u16,
    pub is_active: bool,
    pub elimination_time: i64,
    pub final_position: u16,
}

impl PlayerInfo {
    pub const INIT_SPACE: usize = 32 + 8 + 2 + 1 + 8 + 2; // player + chips + position + is_active + elimination_time + final_position
}

// Events
#[event]
pub struct TournamentCreated {
    pub tournament_id: u64,
    pub organizer: Pubkey,
    pub buy_in: u64,
    pub max_players: u16,
    pub start_time: i64,
}

#[event]
pub struct PlayerRegistered {
    pub tournament_id: u64,
    pub player: Pubkey,
    pub position: u16,
}

#[event]
pub struct TournamentStarted {
    pub tournament_id: u64,
    pub players_count: u16,
    pub prize_pool: u64,
}

#[event]
pub struct PlayerEliminated {
    pub tournament_id: u64,
    pub player: Pubkey,
    pub final_position: u16,
}

#[event]
pub struct PrizeDistributed {
    pub tournament_id: u64,
    pub winner: Pubkey,
    pub position: u16,
    pub prize_amount: u64,
}

#[event]
pub struct BlindLevelUpdated {
    pub tournament_id: u64,
    pub new_level: u16,
    pub small_blind: u64,
    pub big_blind: u64,
}

// Error Codes
#[error_code]
pub enum TournamentError {
    #[msg("Invalid maximum players count")]
    InvalidMaxPlayers,
    #[msg("Invalid buy-in amount")]
    InvalidBuyIn,
    #[msg("Invalid prize structure")]
    InvalidPrizeStructure,
    #[msg("Registration is closed")]
    RegistrationClosed,
    #[msg("Tournament is full")]
    TournamentFull,
    #[msg("Player already registered")]
    AlreadyRegistered,
    #[msg("Unauthorized organizer")]
    UnauthorizedOrganizer,
    #[msg("Invalid tournament status")]
    InvalidStatus,
    #[msg("Insufficient players to start")]
    InsufficientPlayers,
    #[msg("Tournament not finished")]
    TournamentNotFinished,
}

