use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use std::cmp;

declare_id!("STAKINGSolCraftPokerProgramId11111111111");

#[program]
pub mod solcraft_staking {
    use super::*;

    /// Initialize a new staking pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        pool_id: u64,
        reward_rate: u64, // Rewards per second per token staked
        lock_duration: i64, // Lock duration in seconds
        max_stake_per_user: u64,
        early_withdrawal_fee: u16, // Fee percentage (basis points)
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        require!(reward_rate > 0, StakingError::InvalidRewardRate);
        require!(lock_duration >= 0, StakingError::InvalidLockDuration);
        require!(early_withdrawal_fee <= 10000, StakingError::InvalidFee); // Max 100%
        
        pool.pool_id = pool_id;
        pool.authority = ctx.accounts.authority.key();
        pool.stake_token_mint = ctx.accounts.stake_token_mint.key();
        pool.reward_token_mint = ctx.accounts.reward_token_mint.key();
        pool.reward_rate = reward_rate;
        pool.lock_duration = lock_duration;
        pool.max_stake_per_user = max_stake_per_user;
        pool.early_withdrawal_fee = early_withdrawal_fee;
        pool.total_staked = 0;
        pool.total_rewards_distributed = 0;
        pool.last_update_time = Clock::get()?.unix_timestamp;
        pool.reward_per_token_stored = 0;
        pool.is_active = true;
        pool.compound_frequency = 86400; // Daily compound by default
        pool.auto_compound_enabled = true;
        
        emit!(PoolCreated {
            pool_id,
            authority: ctx.accounts.authority.key(),
            stake_token_mint: ctx.accounts.stake_token_mint.key(),
            reward_token_mint: ctx.accounts.reward_token_mint.key(),
            reward_rate,
            lock_duration,
        });
        
        Ok(())
    }

    /// Stake tokens in a pool
    pub fn stake(
        ctx: Context<Stake>,
        pool_id: u64,
        amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(pool.is_active, StakingError::PoolNotActive);
        require!(amount > 0, StakingError::InvalidAmount);
        
        // Update pool rewards
        update_pool_rewards(pool)?;
        
        // Check max stake limit
        let new_user_total = user_stake.amount + amount;
        if pool.max_stake_per_user > 0 {
            require!(new_user_total <= pool.max_stake_per_user, StakingError::ExceedsMaxStake);
        }
        
        // Update user rewards before changing stake
        update_user_rewards(pool, user_stake)?;
        
        // Transfer tokens from user to pool
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.pool_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Update user stake info
        if user_stake.amount == 0 {
            user_stake.user = ctx.accounts.user.key();
            user_stake.pool_id = pool_id;
            user_stake.stake_time = Clock::get()?.unix_timestamp;
        }
        
        user_stake.amount += amount;
        user_stake.last_update_time = Clock::get()?.unix_timestamp;
        user_stake.reward_per_token_paid = pool.reward_per_token_stored;
        
        // Update pool totals
        pool.total_staked += amount;
        
        emit!(TokensStaked {
            pool_id,
            user: ctx.accounts.user.key(),
            amount,
            total_staked: user_stake.amount,
        });
        
        Ok(())
    }

    /// Unstake tokens from a pool
    pub fn unstake(
        ctx: Context<Unstake>,
        pool_id: u64,
        amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(amount > 0, StakingError::InvalidAmount);
        require!(user_stake.amount >= amount, StakingError::InsufficientStake);
        
        // Update pool and user rewards
        update_pool_rewards(pool)?;
        update_user_rewards(pool, user_stake)?;
        
        let current_time = Clock::get()?.unix_timestamp;
        let time_staked = current_time - user_stake.stake_time;
        
        // Calculate withdrawal fee if early withdrawal
        let mut withdrawal_amount = amount;
        let mut fee_amount = 0;
        
        if time_staked < pool.lock_duration && pool.early_withdrawal_fee > 0 {
            fee_amount = (amount * pool.early_withdrawal_fee as u64) / 10000;
            withdrawal_amount = amount - fee_amount;
            
            emit!(EarlyWithdrawalFee {
                pool_id,
                user: ctx.accounts.user.key(),
                fee_amount,
                withdrawal_amount,
            });
        }
        
        // Transfer tokens back to user
        let pool_seeds = &[
            b"pool",
            pool_id.to_le_bytes().as_ref(),
            &[ctx.bumps.pool],
        ];
        let pool_signer = &[&pool_seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: pool.to_account_info(),
            },
            pool_signer,
        );
        token::transfer(transfer_ctx, withdrawal_amount)?;
        
        // Update user stake
        user_stake.amount -= amount;
        user_stake.last_update_time = current_time;
        
        // Update pool totals
        pool.total_staked -= amount;
        
        emit!(TokensUnstaked {
            pool_id,
            user: ctx.accounts.user.key(),
            amount: withdrawal_amount,
            fee: fee_amount,
            remaining_stake: user_stake.amount,
        });
        
        Ok(())
    }

    /// Claim accumulated rewards
    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
        pool_id: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        // Update pool and user rewards
        update_pool_rewards(pool)?;
        update_user_rewards(pool, user_stake)?;
        
        let rewards_to_claim = user_stake.pending_rewards;
        require!(rewards_to_claim > 0, StakingError::NoRewardsToClaim);
        
        // Transfer rewards to user
        let pool_seeds = &[
            b"pool",
            pool_id.to_le_bytes().as_ref(),
            &[ctx.bumps.pool],
        ];
        let pool_signer = &[&pool_seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_reward_account.to_account_info(),
                to: ctx.accounts.user_reward_account.to_account_info(),
                authority: pool.to_account_info(),
            },
            pool_signer,
        );
        token::transfer(transfer_ctx, rewards_to_claim)?;
        
        // Update user and pool state
        user_stake.pending_rewards = 0;
        user_stake.total_rewards_claimed += rewards_to_claim;
        pool.total_rewards_distributed += rewards_to_claim;
        
        emit!(RewardsClaimed {
            pool_id,
            user: ctx.accounts.user.key(),
            amount: rewards_to_claim,
            total_claimed: user_stake.total_rewards_claimed,
        });
        
        Ok(())
    }

    /// Compound rewards (restake them)
    pub fn compound_rewards(
        ctx: Context<CompoundRewards>,
        pool_id: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(pool.auto_compound_enabled, StakingError::CompoundingDisabled);
        
        // Update pool and user rewards
        update_pool_rewards(pool)?;
        update_user_rewards(pool, user_stake)?;
        
        let rewards_to_compound = user_stake.pending_rewards;
        require!(rewards_to_compound > 0, StakingError::NoRewardsToCompound);
        
        // Add rewards to staked amount (compound)
        user_stake.amount += rewards_to_compound;
        user_stake.pending_rewards = 0;
        user_stake.total_compounded += rewards_to_compound;
        user_stake.last_compound_time = Clock::get()?.unix_timestamp;
        
        // Update pool totals
        pool.total_staked += rewards_to_compound;
        
        emit!(RewardsCompounded {
            pool_id,
            user: ctx.accounts.user.key(),
            amount: rewards_to_compound,
            new_stake_amount: user_stake.amount,
        });
        
        Ok(())
    }

    /// Emergency withdraw (with penalty)
    pub fn emergency_withdraw(
        ctx: Context<EmergencyWithdraw>,
        pool_id: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        let stake_amount = user_stake.amount;
        require!(stake_amount > 0, StakingError::NoStakeToWithdraw);
        
        // Calculate emergency withdrawal penalty (50% of stake)
        let penalty_amount = stake_amount / 2;
        let withdrawal_amount = stake_amount - penalty_amount;
        
        // Transfer remaining tokens to user
        let pool_seeds = &[
            b"pool",
            pool_id.to_le_bytes().as_ref(),
            &[ctx.bumps.pool],
        ];
        let pool_signer = &[&pool_seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: pool.to_account_info(),
            },
            pool_signer,
        );
        token::transfer(transfer_ctx, withdrawal_amount)?;
        
        // Reset user stake
        user_stake.amount = 0;
        user_stake.pending_rewards = 0;
        user_stake.last_update_time = Clock::get()?.unix_timestamp;
        
        // Update pool totals
        pool.total_staked -= stake_amount;
        
        emit!(EmergencyWithdrawal {
            pool_id,
            user: ctx.accounts.user.key(),
            stake_amount,
            penalty_amount,
            withdrawal_amount,
        });
        
        Ok(())
    }

    /// Update pool configuration (admin only)
    pub fn update_pool_config(
        ctx: Context<UpdatePoolConfig>,
        pool_id: u64,
        new_reward_rate: Option<u64>,
        new_lock_duration: Option<i64>,
        new_early_withdrawal_fee: Option<u16>,
        new_auto_compound_enabled: Option<bool>,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        require!(pool.authority == ctx.accounts.authority.key(), StakingError::UnauthorizedAuthority);
        
        // Update pool rewards before changing parameters
        update_pool_rewards(pool)?;
        
        if let Some(reward_rate) = new_reward_rate {
            require!(reward_rate > 0, StakingError::InvalidRewardRate);
            pool.reward_rate = reward_rate;
        }
        
        if let Some(lock_duration) = new_lock_duration {
            require!(lock_duration >= 0, StakingError::InvalidLockDuration);
            pool.lock_duration = lock_duration;
        }
        
        if let Some(fee) = new_early_withdrawal_fee {
            require!(fee <= 10000, StakingError::InvalidFee);
            pool.early_withdrawal_fee = fee;
        }
        
        if let Some(auto_compound) = new_auto_compound_enabled {
            pool.auto_compound_enabled = auto_compound;
        }
        
        emit!(PoolConfigUpdated {
            pool_id,
            authority: ctx.accounts.authority.key(),
        });
        
        Ok(())
    }
}

// Helper Functions
fn update_pool_rewards(pool: &mut Account<StakingPool>) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;
    let time_elapsed = current_time - pool.last_update_time;
    
    if time_elapsed > 0 && pool.total_staked > 0 {
        let rewards_per_token = (pool.reward_rate * time_elapsed as u64) / pool.total_staked;
        pool.reward_per_token_stored += rewards_per_token;
    }
    
    pool.last_update_time = current_time;
    Ok(())
}

fn update_user_rewards(pool: &Account<StakingPool>, user_stake: &mut Account<UserStake>) -> Result<()> {
    let rewards_per_token_delta = pool.reward_per_token_stored - user_stake.reward_per_token_paid;
    let new_rewards = (user_stake.amount * rewards_per_token_delta) / 1_000_000; // Scale factor
    
    user_stake.pending_rewards += new_rewards;
    user_stake.reward_per_token_paid = pool.reward_per_token_stored;
    user_stake.last_update_time = Clock::get()?.unix_timestamp;
    
    Ok(())
}

// Account Structures
#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + StakingPool::INIT_SPACE,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub stake_token_mint: Account<'info, Mint>,
    pub reward_token_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct Stake<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStake::INIT_SPACE,
        seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct Unstake<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_reward_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_reward_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct CompoundRewards<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct EmergencyWithdraw<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct UpdatePoolConfig<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    
    pub authority: Signer<'info>,
}

// Data Structures
#[account]
pub struct StakingPool {
    pub pool_id: u64,
    pub authority: Pubkey,
    pub stake_token_mint: Pubkey,
    pub reward_token_mint: Pubkey,
    pub reward_rate: u64, // Rewards per second per token
    pub lock_duration: i64, // Lock duration in seconds
    pub max_stake_per_user: u64,
    pub early_withdrawal_fee: u16, // Basis points
    pub total_staked: u64,
    pub total_rewards_distributed: u64,
    pub last_update_time: i64,
    pub reward_per_token_stored: u64,
    pub is_active: bool,
    pub compound_frequency: i64, // Seconds between auto-compounds
    pub auto_compound_enabled: bool,
}

impl StakingPool {
    pub const INIT_SPACE: usize = 8 + // discriminator
        8 + // pool_id
        32 + // authority
        32 + // stake_token_mint
        32 + // reward_token_mint
        8 + // reward_rate
        8 + // lock_duration
        8 + // max_stake_per_user
        2 + // early_withdrawal_fee
        8 + // total_staked
        8 + // total_rewards_distributed
        8 + // last_update_time
        8 + // reward_per_token_stored
        1 + // is_active
        8 + // compound_frequency
        1; // auto_compound_enabled
}

#[account]
pub struct UserStake {
    pub user: Pubkey,
    pub pool_id: u64,
    pub amount: u64,
    pub stake_time: i64,
    pub last_update_time: i64,
    pub pending_rewards: u64,
    pub total_rewards_claimed: u64,
    pub total_compounded: u64,
    pub last_compound_time: i64,
    pub reward_per_token_paid: u64,
}

impl UserStake {
    pub const INIT_SPACE: usize = 32 + // user
        8 + // pool_id
        8 + // amount
        8 + // stake_time
        8 + // last_update_time
        8 + // pending_rewards
        8 + // total_rewards_claimed
        8 + // total_compounded
        8 + // last_compound_time
        8; // reward_per_token_paid
}

// Events
#[event]
pub struct PoolCreated {
    pub pool_id: u64,
    pub authority: Pubkey,
    pub stake_token_mint: Pubkey,
    pub reward_token_mint: Pubkey,
    pub reward_rate: u64,
    pub lock_duration: i64,
}

#[event]
pub struct TokensStaked {
    pub pool_id: u64,
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
}

#[event]
pub struct TokensUnstaked {
    pub pool_id: u64,
    pub user: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub remaining_stake: u64,
}

#[event]
pub struct RewardsClaimed {
    pub pool_id: u64,
    pub user: Pubkey,
    pub amount: u64,
    pub total_claimed: u64,
}

#[event]
pub struct RewardsCompounded {
    pub pool_id: u64,
    pub user: Pubkey,
    pub amount: u64,
    pub new_stake_amount: u64,
}

#[event]
pub struct EarlyWithdrawalFee {
    pub pool_id: u64,
    pub user: Pubkey,
    pub fee_amount: u64,
    pub withdrawal_amount: u64,
}

#[event]
pub struct EmergencyWithdrawal {
    pub pool_id: u64,
    pub user: Pubkey,
    pub stake_amount: u64,
    pub penalty_amount: u64,
    pub withdrawal_amount: u64,
}

#[event]
pub struct PoolConfigUpdated {
    pub pool_id: u64,
    pub authority: Pubkey,
}

// Error Codes
#[error_code]
pub enum StakingError {
    #[msg("Invalid reward rate")]
    InvalidRewardRate,
    #[msg("Invalid lock duration")]
    InvalidLockDuration,
    #[msg("Invalid fee percentage")]
    InvalidFee,
    #[msg("Pool is not active")]
    PoolNotActive,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Exceeds maximum stake per user")]
    ExceedsMaxStake,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("No rewards to compound")]
    NoRewardsToCompound,
    #[msg("Compounding is disabled")]
    CompoundingDisabled,
    #[msg("No stake to withdraw")]
    NoStakeToWithdraw,
    #[msg("Unauthorized authority")]
    UnauthorizedAuthority,
}

