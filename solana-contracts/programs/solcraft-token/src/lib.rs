use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo, Transfer, Burn};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::instruction::{create_metadata_accounts_v3, update_metadata_accounts_v2};

declare_id!("SoLCraftToken1111111111111111111111111111");

#[program]
pub mod solcraft_token {
    use super::*;

    /// Initialize the SOLP token
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        name: String,
        symbol: String,
        uri: String,
        decimals: u8,
    ) -> Result<()> {
        let token_state = &mut ctx.accounts.token_state;
        token_state.authority = ctx.accounts.authority.key();
        token_state.mint = ctx.accounts.mint.key();
        token_state.total_supply = 0;
        token_state.max_supply = 1_000_000_000 * 10_u64.pow(decimals as u32); // 1B tokens
        token_state.is_minting_enabled = true;
        token_state.transfer_fee_rate = 0; // No transfer fees initially
        token_state.staking_rewards_pool = 0;
        
        Ok(())
    }

    /// Mint new SOLP tokens
    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let token_state = &ctx.accounts.token_state;
        
        require!(token_state.is_minting_enabled, TokenError::MintingDisabled);
        require!(
            token_state.total_supply + amount <= token_state.max_supply,
            TokenError::ExceedsMaxSupply
        );

        // Mint tokens
        let seeds = &[b"token_state".as_ref(), &[ctx.bumps.token_state]];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.token_state.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::mint_to(cpi_ctx, amount)?;

        // Update total supply
        let token_state = &mut ctx.accounts.token_state;
        token_state.total_supply += amount;

        Ok(())
    }

    /// Burn SOLP tokens
    pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.source.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::burn(cpi_ctx, amount)?;

        // Update total supply
        let token_state = &mut ctx.accounts.token_state;
        token_state.total_supply -= amount;

        Ok(())
    }

    /// Transfer tokens with optional fee
    pub fn transfer_with_fee(ctx: Context<TransferWithFee>, amount: u64) -> Result<()> {
        let token_state = &ctx.accounts.token_state;
        let fee_amount = (amount * token_state.transfer_fee_rate as u64) / 10000;
        let transfer_amount = amount - fee_amount;

        // Transfer main amount
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, transfer_amount)?;

        // Transfer fee to treasury if applicable
        if fee_amount > 0 {
            let fee_cpi_accounts = Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.fee_destination.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };
            let fee_cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), fee_cpi_accounts);
            token::transfer(fee_cpi_ctx, fee_amount)?;
        }

        Ok(())
    }

    /// Stake tokens for rewards
    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64, lock_period: u64) -> Result<()> {
        require!(amount > 0, TokenError::InvalidAmount);
        require!(lock_period >= 7 * 24 * 3600, TokenError::LockPeriodTooShort); // Min 7 days

        let stake_account = &mut ctx.accounts.stake_account;
        let current_time = Clock::get()?.unix_timestamp as u64;

        // Transfer tokens to staking pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.staking_pool.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;

        // Update stake account
        stake_account.user = ctx.accounts.user.key();
        stake_account.amount = amount;
        stake_account.start_time = current_time;
        stake_account.lock_period = lock_period;
        stake_account.last_claim_time = current_time;
        stake_account.is_active = true;

        Ok(())
    }

    /// Claim staking rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let token_state = &ctx.accounts.token_state;
        let current_time = Clock::get()?.unix_timestamp as u64;

        require!(stake_account.is_active, TokenError::StakeNotActive);

        // Calculate rewards (simplified APY calculation)
        let time_staked = current_time - stake_account.last_claim_time;
        let apy_rate = 1000; // 10% APY in basis points
        let rewards = (stake_account.amount * apy_rate as u64 * time_staked) / (10000 * 365 * 24 * 3600);

        if rewards > 0 && rewards <= token_state.staking_rewards_pool {
            // Mint rewards to user
            let seeds = &[b"token_state".as_ref(), &[ctx.bumps.token_state]];
            let signer = &[&seeds[..]];
            
            let cpi_accounts = MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.token_state.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            
            token::mint_to(cpi_ctx, rewards)?;

            // Update state
            stake_account.last_claim_time = current_time;
            let token_state = &mut ctx.accounts.token_state;
            token_state.staking_rewards_pool -= rewards;
            token_state.total_supply += rewards;
        }

        Ok(())
    }

    /// Unstake tokens
    pub fn unstake_tokens(ctx: Context<UnstakeTokens>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let current_time = Clock::get()?.unix_timestamp as u64;

        require!(stake_account.is_active, TokenError::StakeNotActive);
        require!(
            current_time >= stake_account.start_time + stake_account.lock_period,
            TokenError::StillLocked
        );

        // Transfer tokens back to user
        let seeds = &[b"staking_pool".as_ref(), &[ctx.bumps.staking_pool]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.staking_pool.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::transfer(cpi_ctx, stake_account.amount)?;

        // Deactivate stake
        stake_account.is_active = false;

        Ok(())
    }

    /// Update token parameters (governance only)
    pub fn update_parameters(
        ctx: Context<UpdateParameters>,
        transfer_fee_rate: u16,
        is_minting_enabled: bool,
    ) -> Result<()> {
        require!(transfer_fee_rate <= 1000, TokenError::FeeTooHigh); // Max 10%
        
        let token_state = &mut ctx.accounts.token_state;
        token_state.transfer_fee_rate = transfer_fee_rate;
        token_state.is_minting_enabled = is_minting_enabled;

        Ok(())
    }
}

// Account structs
#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TokenState::INIT_SPACE,
        seeds = [b"token_state"],
        bump
    )]
    pub token_state: Account<'info, TokenState>,
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = token_state,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut, seeds = [b"token_state"], bump)]
    pub token_state: Account<'info, TokenState>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    #[account(constraint = authority.key() == token_state.authority)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut, seeds = [b"token_state"], bump)]
    pub token_state: Account<'info, TokenState>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferWithFee<'info> {
    #[account(seeds = [b"token_state"], bump)]
    pub token_state: Account<'info, TokenState>,
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub fee_destination: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [b"stake", user.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut, seeds = [b"token_state"], bump)]
    pub token_state: Account<'info, TokenState>,
    #[account(
        mut,
        seeds = [b"stake", user.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(
        mut,
        seeds = [b"stake", user.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateParameters<'info> {
    #[account(mut, seeds = [b"token_state"], bump)]
    pub token_state: Account<'info, TokenState>,
    #[account(constraint = authority.key() == token_state.authority)]
    pub authority: Signer<'info>,
}

// Data structs
#[account]
#[derive(InitSpace)]
pub struct TokenState {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_supply: u64,
    pub max_supply: u64,
    pub is_minting_enabled: bool,
    pub transfer_fee_rate: u16, // in basis points
    pub staking_rewards_pool: u64,
}

#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    pub user: Pubkey,
    pub amount: u64,
    pub start_time: u64,
    pub lock_period: u64,
    pub last_claim_time: u64,
    pub is_active: bool,
}

#[error_code]
pub enum TokenError {
    #[msg("Minting is disabled")]
    MintingDisabled,
    #[msg("Amount exceeds max supply")]
    ExceedsMaxSupply,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Lock period too short")]
    LockPeriodTooShort,
    #[msg("Stake is not active")]
    StakeNotActive,
    #[msg("Tokens are still locked")]
    StillLocked,
    #[msg("Fee rate too high")]
    FeeTooHigh,
}

