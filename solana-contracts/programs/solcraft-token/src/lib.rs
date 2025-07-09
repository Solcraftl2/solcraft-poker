use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo, Burn};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("TOKENSolCraftPokerProgramId111111111111");

#[program]
pub mod solcraft_token {
    use super::*;

    /// Initialize the SOLP token
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        name: String,
        symbol: String,
        decimals: u8,
        initial_supply: u64,
        max_supply: Option<u64>,
        mint_authority_transferable: bool,
    ) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        
        require!(name.len() <= 32, TokenError::NameTooLong);
        require!(symbol.len() <= 10, TokenError::SymbolTooLong);
        require!(decimals <= 9, TokenError::InvalidDecimals);
        require!(initial_supply > 0, TokenError::InvalidInitialSupply);
        
        if let Some(max_supply) = max_supply {
            require!(initial_supply <= max_supply, TokenError::InitialSupplyExceedsMax);
        }
        
        token_config.name = name;
        token_config.symbol = symbol;
        token_config.decimals = decimals;
        token_config.total_supply = initial_supply;
        token_config.max_supply = max_supply;
        token_config.mint_authority = ctx.accounts.mint_authority.key();
        token_config.mint_authority_transferable = mint_authority_transferable;
        token_config.freeze_authority = Some(ctx.accounts.mint_authority.key());
        token_config.is_minting_enabled = true;
        token_config.is_burning_enabled = true;
        token_config.transfer_fee_enabled = false;
        token_config.transfer_fee_basis_points = 0;
        token_config.max_transfer_fee = 0;
        token_config.creation_time = Clock::get()?.unix_timestamp;
        token_config.last_mint_time = Clock::get()?.unix_timestamp;
        token_config.total_minted = initial_supply;
        token_config.total_burned = 0;
        token_config.holders_count = 0;
        
        // Mint initial supply to mint authority
        let mint_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.mint_authority_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
        );
        token::mint_to(mint_ctx, initial_supply)?;
        
        emit!(TokenInitialized {
            mint: ctx.accounts.mint.key(),
            name: token_config.name.clone(),
            symbol: token_config.symbol.clone(),
            decimals,
            initial_supply,
            max_supply,
            mint_authority: ctx.accounts.mint_authority.key(),
        });
        
        Ok(())
    }

    /// Mint new tokens (mint authority only)
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
        recipient: Pubkey,
    ) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        
        require!(token_config.is_minting_enabled, TokenError::MintingDisabled);
        require!(amount > 0, TokenError::InvalidAmount);
        require!(
            ctx.accounts.mint_authority.key() == token_config.mint_authority,
            TokenError::UnauthorizedMintAuthority
        );
        
        // Check max supply limit
        if let Some(max_supply) = token_config.max_supply {
            require!(
                token_config.total_supply + amount <= max_supply,
                TokenError::ExceedsMaxSupply
            );
        }
        
        // Mint tokens
        let mint_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
        );
        token::mint_to(mint_ctx, amount)?;
        
        // Update token config
        token_config.total_supply += amount;
        token_config.total_minted += amount;
        token_config.last_mint_time = Clock::get()?.unix_timestamp;
        
        emit!(TokensMinted {
            mint: ctx.accounts.mint.key(),
            recipient,
            amount,
            total_supply: token_config.total_supply,
            minter: ctx.accounts.mint_authority.key(),
        });
        
        Ok(())
    }

    /// Burn tokens
    pub fn burn_tokens(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        
        require!(token_config.is_burning_enabled, TokenError::BurningDisabled);
        require!(amount > 0, TokenError::InvalidAmount);
        require!(
            ctx.accounts.token_account.amount >= amount,
            TokenError::InsufficientBalance
        );
        
        // Burn tokens
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::burn(burn_ctx, amount)?;
        
        // Update token config
        token_config.total_supply -= amount;
        token_config.total_burned += amount;
        
        emit!(TokensBurned {
            mint: ctx.accounts.mint.key(),
            owner: ctx.accounts.owner.key(),
            amount,
            total_supply: token_config.total_supply,
            total_burned: token_config.total_burned,
        });
        
        Ok(())
    }

    /// Transfer tokens with optional fee
    pub fn transfer_with_fee(
        ctx: Context<TransferWithFee>,
        amount: u64,
    ) -> Result<()> {
        let token_config = &ctx.accounts.token_config;
        
        require!(amount > 0, TokenError::InvalidAmount);
        require!(
            ctx.accounts.from_token_account.amount >= amount,
            TokenError::InsufficientBalance
        );
        
        let mut transfer_amount = amount;
        let mut fee_amount = 0;
        
        // Calculate transfer fee if enabled
        if token_config.transfer_fee_enabled {
            fee_amount = (amount * token_config.transfer_fee_basis_points as u64) / 10000;
            if fee_amount > token_config.max_transfer_fee {
                fee_amount = token_config.max_transfer_fee;
            }
            transfer_amount = amount - fee_amount;
        }
        
        // Transfer tokens to recipient
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from_token_account.to_account_info(),
                to: ctx.accounts.to_token_account.to_account_info(),
                authority: ctx.accounts.from_authority.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, transfer_amount)?;
        
        // Transfer fee to fee collector if applicable
        if fee_amount > 0 && ctx.accounts.fee_collector_token_account.is_some() {
            let fee_transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.from_token_account.to_account_info(),
                    to: ctx.accounts.fee_collector_token_account.as_ref().unwrap().to_account_info(),
                    authority: ctx.accounts.from_authority.to_account_info(),
                },
            );
            token::transfer(fee_transfer_ctx, fee_amount)?;
        }
        
        emit!(TokensTransferred {
            mint: ctx.accounts.mint.key(),
            from: ctx.accounts.from_authority.key(),
            to: ctx.accounts.to_token_account.owner,
            amount: transfer_amount,
            fee: fee_amount,
        });
        
        Ok(())
    }

    /// Stake tokens for rewards
    pub fn stake_tokens(
        ctx: Context<StakeTokens>,
        amount: u64,
        lock_duration: i64, // Seconds
    ) -> Result<()> {
        let token_config = &ctx.accounts.token_config;
        let stake_account = &mut ctx.accounts.stake_account;
        
        require!(amount > 0, TokenError::InvalidAmount);
        require!(lock_duration >= 0, TokenError::InvalidLockDuration);
        require!(
            ctx.accounts.user_token_account.amount >= amount,
            TokenError::InsufficientBalance
        );
        
        let current_time = Clock::get()?.unix_timestamp;
        
        // Initialize stake account if first time
        if stake_account.amount == 0 {
            stake_account.owner = ctx.accounts.user.key();
            stake_account.mint = ctx.accounts.mint.key();
            stake_account.stake_time = current_time;
            stake_account.last_reward_time = current_time;
        }
        
        // Transfer tokens to stake account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.stake_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Update stake account
        stake_account.amount += amount;
        stake_account.lock_end_time = current_time + lock_duration;
        stake_account.total_staked += amount;
        
        emit!(TokensStaked {
            mint: ctx.accounts.mint.key(),
            user: ctx.accounts.user.key(),
            amount,
            lock_end_time: stake_account.lock_end_time,
            total_staked: stake_account.amount,
        });
        
        Ok(())
    }

    /// Unstake tokens
    pub fn unstake_tokens(
        ctx: Context<UnstakeTokens>,
        amount: u64,
    ) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(amount > 0, TokenError::InvalidAmount);
        require!(stake_account.amount >= amount, TokenError::InsufficientStakedBalance);
        require!(
            current_time >= stake_account.lock_end_time,
            TokenError::StillLocked
        );
        
        // Calculate and distribute rewards before unstaking
        let time_staked = current_time - stake_account.last_reward_time;
        let reward_rate = 100; // 1% per day (basis points per second)
        let rewards = (stake_account.amount * reward_rate * time_staked as u64) / (86400 * 10000);
        
        // Transfer staked tokens back to user
        let stake_seeds = &[
            b"stake",
            ctx.accounts.user.key().as_ref(),
            ctx.accounts.mint.key().as_ref(),
            &[ctx.bumps.stake_account],
        ];
        let stake_signer = &[&stake_seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.stake_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: stake_account.to_account_info(),
            },
            stake_signer,
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Mint rewards if any
        if rewards > 0 {
            // This would require mint authority delegation or separate reward pool
            // For now, just emit the reward amount
        }
        
        // Update stake account
        stake_account.amount -= amount;
        stake_account.total_rewards_earned += rewards;
        stake_account.last_reward_time = current_time;
        
        emit!(TokensUnstaked {
            mint: ctx.accounts.mint.key(),
            user: ctx.accounts.user.key(),
            amount,
            rewards,
            remaining_staked: stake_account.amount,
        });
        
        Ok(())
    }

    /// Update token configuration (mint authority only)
    pub fn update_token_config(
        ctx: Context<UpdateTokenConfig>,
        new_transfer_fee_enabled: Option<bool>,
        new_transfer_fee_basis_points: Option<u16>,
        new_max_transfer_fee: Option<u64>,
        new_minting_enabled: Option<bool>,
        new_burning_enabled: Option<bool>,
    ) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        
        require!(
            ctx.accounts.authority.key() == token_config.mint_authority,
            TokenError::UnauthorizedMintAuthority
        );
        
        if let Some(transfer_fee_enabled) = new_transfer_fee_enabled {
            token_config.transfer_fee_enabled = transfer_fee_enabled;
        }
        
        if let Some(fee_basis_points) = new_transfer_fee_basis_points {
            require!(fee_basis_points <= 1000, TokenError::InvalidTransferFee); // Max 10%
            token_config.transfer_fee_basis_points = fee_basis_points;
        }
        
        if let Some(max_fee) = new_max_transfer_fee {
            token_config.max_transfer_fee = max_fee;
        }
        
        if let Some(minting_enabled) = new_minting_enabled {
            token_config.is_minting_enabled = minting_enabled;
        }
        
        if let Some(burning_enabled) = new_burning_enabled {
            token_config.is_burning_enabled = burning_enabled;
        }
        
        emit!(TokenConfigUpdated {
            mint: ctx.accounts.mint.key(),
            authority: ctx.accounts.authority.key(),
            update_time: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Transfer mint authority (if transferable)
    pub fn transfer_mint_authority(
        ctx: Context<TransferMintAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        
        require!(
            ctx.accounts.current_authority.key() == token_config.mint_authority,
            TokenError::UnauthorizedMintAuthority
        );
        require!(
            token_config.mint_authority_transferable,
            TokenError::MintAuthorityNotTransferable
        );
        
        token_config.mint_authority = new_authority;
        
        emit!(MintAuthorityTransferred {
            mint: ctx.accounts.mint.key(),
            old_authority: ctx.accounts.current_authority.key(),
            new_authority,
            transfer_time: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Create token vesting schedule
    pub fn create_vesting(
        ctx: Context<CreateVesting>,
        beneficiary: Pubkey,
        amount: u64,
        start_time: i64,
        cliff_duration: i64,
        vesting_duration: i64,
    ) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting;
        
        require!(amount > 0, TokenError::InvalidAmount);
        require!(vesting_duration > 0, TokenError::InvalidVestingDuration);
        require!(cliff_duration <= vesting_duration, TokenError::InvalidCliffDuration);
        require!(
            ctx.accounts.grantor_token_account.amount >= amount,
            TokenError::InsufficientBalance
        );
        
        // Transfer tokens to vesting account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.grantor_token_account.to_account_info(),
                to: ctx.accounts.vesting_token_account.to_account_info(),
                authority: ctx.accounts.grantor.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Initialize vesting schedule
        vesting.grantor = ctx.accounts.grantor.key();
        vesting.beneficiary = beneficiary;
        vesting.mint = ctx.accounts.mint.key();
        vesting.total_amount = amount;
        vesting.released_amount = 0;
        vesting.start_time = start_time;
        vesting.cliff_time = start_time + cliff_duration;
        vesting.end_time = start_time + vesting_duration;
        vesting.is_revocable = true;
        vesting.is_revoked = false;
        
        emit!(VestingCreated {
            vesting_id: vesting.key(),
            grantor: ctx.accounts.grantor.key(),
            beneficiary,
            amount,
            start_time,
            cliff_time: vesting.cliff_time,
            end_time: vesting.end_time,
        });
        
        Ok(())
    }

    /// Release vested tokens
    pub fn release_vested_tokens(
        ctx: Context<ReleaseVestedTokens>,
    ) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting;
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(!vesting.is_revoked, TokenError::VestingRevoked);
        require!(current_time >= vesting.cliff_time, TokenError::CliffNotReached);
        
        // Calculate vested amount
        let vested_amount = if current_time >= vesting.end_time {
            vesting.total_amount
        } else {
            let vesting_duration = vesting.end_time - vesting.start_time;
            let elapsed_time = current_time - vesting.start_time;
            (vesting.total_amount * elapsed_time as u64) / vesting_duration as u64
        };
        
        let releasable_amount = vested_amount - vesting.released_amount;
        require!(releasable_amount > 0, TokenError::NoTokensToRelease);
        
        // Transfer vested tokens to beneficiary
        let vesting_seeds = &[
            b"vesting",
            vesting.grantor.as_ref(),
            vesting.beneficiary.as_ref(),
            &[ctx.bumps.vesting],
        ];
        let vesting_signer = &[&vesting_seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vesting_token_account.to_account_info(),
                to: ctx.accounts.beneficiary_token_account.to_account_info(),
                authority: vesting.to_account_info(),
            },
            vesting_signer,
        );
        token::transfer(transfer_ctx, releasable_amount)?;
        
        vesting.released_amount += releasable_amount;
        
        emit!(VestedTokensReleased {
            vesting_id: vesting.key(),
            beneficiary: vesting.beneficiary,
            amount: releasable_amount,
            total_released: vesting.released_amount,
            release_time: current_time,
        });
        
        Ok(())
    }
}

// Account Structures
#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(
        init,
        payer = mint_authority,
        space = 8 + TokenConfig::INIT_SPACE,
        seeds = [b"token_config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(mut)]
    pub mint_authority_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(
        mut,
        seeds = [b"token_config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    pub mint_authority: Signer<'info>,
    
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(
        mut,
        seeds = [b"token_config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferWithFee<'info> {
    #[account(
        seeds = [b"token_config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    
    pub from_authority: Signer<'info>,
    
    #[account(mut)]
    pub fee_collector_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(
        seeds = [b"token_config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [b"stake", user.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub stake_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(
        mut,
        seeds = [b"stake", user.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub stake_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateTokenConfig<'info> {
    #[account(
        mut,
        seeds = [b"token_config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub mint: Account<'info, Mint>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferMintAuthority<'info> {
    #[account(
        mut,
        seeds = [b"token_config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub mint: Account<'info, Mint>,
    
    pub current_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateVesting<'info> {
    #[account(
        init,
        payer = grantor,
        space = 8 + VestingSchedule::INIT_SPACE,
        seeds = [b"vesting", grantor.key().as_ref(), beneficiary.as_ref()],
        bump
    )]
    pub vesting: Account<'info, VestingSchedule>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub grantor: Signer<'info>,
    
    /// CHECK: This is the beneficiary pubkey
    pub beneficiary: AccountInfo<'info>,
    
    #[account(mut)]
    pub grantor_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vesting_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseVestedTokens<'info> {
    #[account(
        mut,
        seeds = [b"vesting", vesting.grantor.as_ref(), vesting.beneficiary.as_ref()],
        bump
    )]
    pub vesting: Account<'info, VestingSchedule>,
    
    #[account(mut)]
    pub vesting_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub beneficiary_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

// Data Structures
#[account]
pub struct TokenConfig {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u64,
    pub max_supply: Option<u64>,
    pub mint_authority: Pubkey,
    pub mint_authority_transferable: bool,
    pub freeze_authority: Option<Pubkey>,
    pub is_minting_enabled: bool,
    pub is_burning_enabled: bool,
    pub transfer_fee_enabled: bool,
    pub transfer_fee_basis_points: u16,
    pub max_transfer_fee: u64,
    pub creation_time: i64,
    pub last_mint_time: i64,
    pub total_minted: u64,
    pub total_burned: u64,
    pub holders_count: u64,
}

impl TokenConfig {
    pub const INIT_SPACE: usize = 4 + 32 + // name
        4 + 10 + // symbol
        1 + // decimals
        8 + // total_supply
        1 + 8 + // max_supply (Option<u64>)
        32 + // mint_authority
        1 + // mint_authority_transferable
        1 + 32 + // freeze_authority (Option<Pubkey>)
        1 + // is_minting_enabled
        1 + // is_burning_enabled
        1 + // transfer_fee_enabled
        2 + // transfer_fee_basis_points
        8 + // max_transfer_fee
        8 + // creation_time
        8 + // last_mint_time
        8 + // total_minted
        8 + // total_burned
        8; // holders_count
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub stake_time: i64,
    pub lock_end_time: i64,
    pub last_reward_time: i64,
    pub total_staked: u64,
    pub total_rewards_earned: u64,
}

impl StakeAccount {
    pub const INIT_SPACE: usize = 32 + // owner
        32 + // mint
        8 + // amount
        8 + // stake_time
        8 + // lock_end_time
        8 + // last_reward_time
        8 + // total_staked
        8; // total_rewards_earned
}

#[account]
pub struct VestingSchedule {
    pub grantor: Pubkey,
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub start_time: i64,
    pub cliff_time: i64,
    pub end_time: i64,
    pub is_revocable: bool,
    pub is_revoked: bool,
}

impl VestingSchedule {
    pub const INIT_SPACE: usize = 32 + // grantor
        32 + // beneficiary
        32 + // mint
        8 + // total_amount
        8 + // released_amount
        8 + // start_time
        8 + // cliff_time
        8 + // end_time
        1 + // is_revocable
        1; // is_revoked
}

// Events
#[event]
pub struct TokenInitialized {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub initial_supply: u64,
    pub max_supply: Option<u64>,
    pub mint_authority: Pubkey,
}

#[event]
pub struct TokensMinted {
    pub mint: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub total_supply: u64,
    pub minter: Pubkey,
}

#[event]
pub struct TokensBurned {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub total_supply: u64,
    pub total_burned: u64,
}

#[event]
pub struct TokensTransferred {
    pub mint: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub fee: u64,
}

#[event]
pub struct TokensStaked {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub lock_end_time: i64,
    pub total_staked: u64,
}

#[event]
pub struct TokensUnstaked {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub rewards: u64,
    pub remaining_staked: u64,
}

#[event]
pub struct TokenConfigUpdated {
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub update_time: i64,
}

#[event]
pub struct MintAuthorityTransferred {
    pub mint: Pubkey,
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
    pub transfer_time: i64,
}

#[event]
pub struct VestingCreated {
    pub vesting_id: Pubkey,
    pub grantor: Pubkey,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub start_time: i64,
    pub cliff_time: i64,
    pub end_time: i64,
}

#[event]
pub struct VestedTokensReleased {
    pub vesting_id: Pubkey,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub total_released: u64,
    pub release_time: i64,
}

// Error Codes
#[error_code]
pub enum TokenError {
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Symbol too long")]
    SymbolTooLong,
    #[msg("Invalid decimals")]
    InvalidDecimals,
    #[msg("Invalid initial supply")]
    InvalidInitialSupply,
    #[msg("Initial supply exceeds maximum supply")]
    InitialSupplyExceedsMax,
    #[msg("Minting is disabled")]
    MintingDisabled,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Unauthorized mint authority")]
    UnauthorizedMintAuthority,
    #[msg("Exceeds maximum supply")]
    ExceedsMaxSupply,
    #[msg("Burning is disabled")]
    BurningDisabled,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Invalid lock duration")]
    InvalidLockDuration,
    #[msg("Insufficient staked balance")]
    InsufficientStakedBalance,
    #[msg("Tokens are still locked")]
    StillLocked,
    #[msg("Invalid transfer fee")]
    InvalidTransferFee,
    #[msg("Mint authority is not transferable")]
    MintAuthorityNotTransferable,
    #[msg("Invalid vesting duration")]
    InvalidVestingDuration,
    #[msg("Invalid cliff duration")]
    InvalidCliffDuration,
    #[msg("Vesting is revoked")]
    VestingRevoked,
    #[msg("Cliff period not reached")]
    CliffNotReached,
    #[msg("No tokens to release")]
    NoTokensToRelease,
}

