use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("SoLCraftPoker11111111111111111111111111111");

#[program]
pub mod solcraft_poker {
    use super::*;

    /// Initialize the poker game program
    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.authority = authority;
        game_state.total_games = 0;
        game_state.total_volume = 0;
        game_state.fee_rate = 250; // 2.5% in basis points
        game_state.min_buy_in = 1_000_000; // 0.001 SOL in lamports
        game_state.max_buy_in = 1_000_000_000; // 1 SOL in lamports
        game_state.is_paused = false;
        Ok(())
    }

    /// Create a new poker table
    pub fn create_table(
        ctx: Context<CreateTable>,
        table_id: u64,
        max_players: u8,
        buy_in_amount: u64,
        blind_structure: BlindStructure,
    ) -> Result<()> {
        require!(max_players >= 2 && max_players <= 9, PokerError::InvalidPlayerCount);
        require!(buy_in_amount >= ctx.accounts.game_state.min_buy_in, PokerError::BuyInTooLow);
        require!(buy_in_amount <= ctx.accounts.game_state.max_buy_in, PokerError::BuyInTooHigh);

        let table = &mut ctx.accounts.table;
        table.table_id = table_id;
        table.authority = ctx.accounts.authority.key();
        table.max_players = max_players;
        table.current_players = 0;
        table.buy_in_amount = buy_in_amount;
        table.blind_structure = blind_structure;
        table.status = TableStatus::Waiting;
        table.pot_amount = 0;
        table.current_round = 0;
        table.dealer_position = 0;
        table.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /// Join a poker table
    pub fn join_table(ctx: Context<JoinTable>) -> Result<()> {
        let table = &mut ctx.accounts.table;
        let player_account = &mut ctx.accounts.player_account;

        require!(table.current_players < table.max_players, PokerError::TableFull);
        require!(table.status == TableStatus::Waiting, PokerError::GameInProgress);

        // Transfer buy-in amount to escrow
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, table.buy_in_amount)?;

        // Add player to table
        table.players[table.current_players as usize] = ctx.accounts.player.key();
        table.player_chips[table.current_players as usize] = table.buy_in_amount;
        table.current_players += 1;

        // Update player account
        player_account.player = ctx.accounts.player.key();
        player_account.table = table.key();
        player_account.chips = table.buy_in_amount;
        player_account.position = table.current_players - 1;
        player_account.is_active = true;
        player_account.last_action = PlayerAction::None;

        // Start game if minimum players reached
        if table.current_players >= 2 {
            table.status = TableStatus::Playing;
            table.current_round = 1;
        }

        Ok(())
    }

    /// Place a bet
    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64, action: PlayerAction) -> Result<()> {
        let table = &mut ctx.accounts.table;
        let player_account = &mut ctx.accounts.player_account;

        require!(table.status == TableStatus::Playing, PokerError::GameNotActive);
        require!(player_account.is_active, PokerError::PlayerNotActive);
        require!(amount <= player_account.chips, PokerError::InsufficientChips);

        match action {
            PlayerAction::Fold => {
                player_account.is_active = false;
            }
            PlayerAction::Call | PlayerAction::Bet | PlayerAction::Raise => {
                player_account.chips -= amount;
                table.pot_amount += amount;
            }
            PlayerAction::Check => {
                // No chips moved
            }
            _ => return Err(PokerError::InvalidAction.into()),
        }

        player_account.last_action = action;
        
        Ok(())
    }

    /// End game and distribute winnings
    pub fn end_game(ctx: Context<EndGame>, winners: Vec<Pubkey>, amounts: Vec<u64>) -> Result<()> {
        let table = &mut ctx.accounts.table;
        let game_state = &mut ctx.accounts.game_state;

        require!(table.status == TableStatus::Playing, PokerError::GameNotActive);
        require!(winners.len() == amounts.len(), PokerError::InvalidWinnerData);

        let total_winnings: u64 = amounts.iter().sum();
        let fee_amount = (table.pot_amount * game_state.fee_rate) / 10000;
        let net_pot = table.pot_amount - fee_amount;

        require!(total_winnings <= net_pot, PokerError::InvalidWinnerData);

        // Update game statistics
        game_state.total_games += 1;
        game_state.total_volume += table.pot_amount;

        // Reset table
        table.status = TableStatus::Waiting;
        table.current_players = 0;
        table.pot_amount = 0;
        table.current_round = 0;

        Ok(())
    }

    /// Emergency pause
    pub fn emergency_pause(ctx: Context<EmergencyPause>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.is_paused = true;
        Ok(())
    }

    /// Update fee rate (governance only)
    pub fn update_fee_rate(ctx: Context<UpdateFeeRate>, new_fee_rate: u16) -> Result<()> {
        require!(new_fee_rate <= 1000, PokerError::FeeTooHigh); // Max 10%
        let game_state = &mut ctx.accounts.game_state;
        game_state.fee_rate = new_fee_rate;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GameState::INIT_SPACE,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(table_id: u64)]
pub struct CreateTable<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PokerTable::INIT_SPACE,
        seeds = [b"table", table_id.to_le_bytes().as_ref()],
        bump
    )]
    pub table: Account<'info, PokerTable>,
    #[account(seeds = [b"game_state"], bump)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinTable<'info> {
    #[account(mut)]
    pub table: Account<'info, PokerTable>,
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + PlayerAccount::INIT_SPACE,
        seeds = [b"player", player.key().as_ref(), table.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub table: Account<'info, PokerTable>,
    #[account(
        mut,
        seeds = [b"player", player.key().as_ref(), table.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct EndGame<'info> {
    #[account(mut)]
    pub table: Account<'info, PokerTable>,
    #[account(mut, seeds = [b"game_state"], bump)]
    pub game_state: Account<'info, GameState>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct EmergencyPause<'info> {
    #[account(mut, seeds = [b"game_state"], bump)]
    pub game_state: Account<'info, GameState>,
    #[account(constraint = authority.key() == game_state.authority)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateFeeRate<'info> {
    #[account(mut, seeds = [b"game_state"], bump)]
    pub game_state: Account<'info, GameState>,
    #[account(constraint = authority.key() == game_state.authority)]
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct GameState {
    pub authority: Pubkey,
    pub total_games: u64,
    pub total_volume: u64,
    pub fee_rate: u16, // in basis points
    pub min_buy_in: u64,
    pub max_buy_in: u64,
    pub is_paused: bool,
}

#[account]
#[derive(InitSpace)]
pub struct PokerTable {
    pub table_id: u64,
    pub authority: Pubkey,
    pub max_players: u8,
    pub current_players: u8,
    pub buy_in_amount: u64,
    pub blind_structure: BlindStructure,
    pub status: TableStatus,
    pub pot_amount: u64,
    pub current_round: u32,
    pub dealer_position: u8,
    pub created_at: i64,
    #[max_len(9)]
    pub players: Vec<Pubkey>,
    #[max_len(9)]
    pub player_chips: Vec<u64>,
}

#[account]
#[derive(InitSpace)]
pub struct PlayerAccount {
    pub player: Pubkey,
    pub table: Pubkey,
    pub chips: u64,
    pub position: u8,
    pub is_active: bool,
    pub last_action: PlayerAction,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct BlindStructure {
    pub small_blind: u64,
    pub big_blind: u64,
    pub ante: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum TableStatus {
    Waiting,
    Playing,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PlayerAction {
    None,
    Fold,
    Check,
    Call,
    Bet,
    Raise,
    AllIn,
}

#[error_code]
pub enum PokerError {
    #[msg("Invalid player count")]
    InvalidPlayerCount,
    #[msg("Buy-in amount too low")]
    BuyInTooLow,
    #[msg("Buy-in amount too high")]
    BuyInTooHigh,
    #[msg("Table is full")]
    TableFull,
    #[msg("Game is in progress")]
    GameInProgress,
    #[msg("Game is not active")]
    GameNotActive,
    #[msg("Player is not active")]
    PlayerNotActive,
    #[msg("Insufficient chips")]
    InsufficientChips,
    #[msg("Invalid action")]
    InvalidAction,
    #[msg("Invalid winner data")]
    InvalidWinnerData,
    #[msg("Fee rate too high")]
    FeeTooHigh,
}

