use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("ESCROWSolCraftPokerProgramId11111111111");

#[program]
pub mod solcraft_escrow {
    use super::*;

    /// Initialize a new escrow account
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        escrow_id: u64,
        amount: u64,
        release_conditions: ReleaseConditions,
        timeout_duration: i64, // Seconds until timeout
        dispute_resolver: Option<Pubkey>,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(amount > 0, EscrowError::InvalidAmount);
        require!(timeout_duration > 0, EscrowError::InvalidTimeout);
        
        escrow.escrow_id = escrow_id;
        escrow.depositor = ctx.accounts.depositor.key();
        escrow.beneficiary = ctx.accounts.beneficiary.key();
        escrow.token_mint = ctx.accounts.token_mint.key();
        escrow.amount = amount;
        escrow.deposited_amount = 0;
        escrow.release_conditions = release_conditions;
        escrow.status = EscrowStatus::Initialized;
        escrow.creation_time = Clock::get()?.unix_timestamp;
        escrow.timeout_time = Clock::get()?.unix_timestamp + timeout_duration;
        escrow.dispute_resolver = dispute_resolver;
        escrow.dispute_active = false;
        escrow.partial_releases_enabled = false;
        escrow.released_amount = 0;
        escrow.fee_percentage = 250; // 2.5% default fee
        escrow.auto_release_enabled = true;
        
        emit!(EscrowInitialized {
            escrow_id,
            depositor: ctx.accounts.depositor.key(),
            beneficiary: ctx.accounts.beneficiary.key(),
            amount,
            timeout_time: escrow.timeout_time,
        });
        
        Ok(())
    }

    /// Deposit tokens into escrow
    pub fn deposit(
        ctx: Context<Deposit>,
        escrow_id: u64,
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(escrow.status == EscrowStatus::Initialized, EscrowError::InvalidEscrowStatus);
        require!(amount > 0, EscrowError::InvalidAmount);
        require!(escrow.deposited_amount + amount <= escrow.amount, EscrowError::ExceedsEscrowAmount);
        require!(ctx.accounts.depositor.key() == escrow.depositor, EscrowError::UnauthorizedDepositor);
        
        // Transfer tokens from depositor to escrow account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.depositor_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.depositor.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
        
        escrow.deposited_amount += amount;
        
        // If fully funded, change status to Active
        if escrow.deposited_amount == escrow.amount {
            escrow.status = EscrowStatus::Active;
            
            emit!(EscrowFullyFunded {
                escrow_id,
                total_amount: escrow.amount,
                funding_time: Clock::get()?.unix_timestamp,
            });
        }
        
        emit!(TokensDeposited {
            escrow_id,
            depositor: ctx.accounts.depositor.key(),
            amount,
            total_deposited: escrow.deposited_amount,
        });
        
        Ok(())
    }

    /// Release tokens to beneficiary
    pub fn release(
        ctx: Context<Release>,
        escrow_id: u64,
        amount: Option<u64>, // None for full release
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(escrow.status == EscrowStatus::Active, EscrowError::InvalidEscrowStatus);
        require!(!escrow.dispute_active, EscrowError::DisputeActive);
        
        // Check release conditions
        let can_release = match escrow.release_conditions {
            ReleaseConditions::Immediate => true,
            ReleaseConditions::TimeDelay(delay) => {
                current_time >= escrow.creation_time + delay
            },
            ReleaseConditions::BothPartiesApprove => {
                // This would require additional approval tracking
                // For now, assume depositor can release
                ctx.accounts.releaser.key() == escrow.depositor
            },
            ReleaseConditions::BeneficiaryOnly => {
                ctx.accounts.releaser.key() == escrow.beneficiary
            },
            ReleaseConditions::DepositorOnly => {
                ctx.accounts.releaser.key() == escrow.depositor
            },
            ReleaseConditions::External => {
                // External oracle or condition check
                true // Placeholder
            },
        };
        
        require!(can_release, EscrowError::ReleaseConditionsNotMet);
        
        let release_amount = amount.unwrap_or(escrow.deposited_amount - escrow.released_amount);
        require!(release_amount > 0, EscrowError::InvalidAmount);
        require!(escrow.released_amount + release_amount <= escrow.deposited_amount, EscrowError::InsufficientEscrowBalance);
        
        // Calculate fee
        let fee_amount = (release_amount * escrow.fee_percentage as u64) / 10000;
        let net_release_amount = release_amount - fee_amount;
        
        // Transfer tokens to beneficiary
        let escrow_seeds = &[
            b"escrow",
            escrow_id.to_le_bytes().as_ref(),
            &[ctx.bumps.escrow],
        ];
        let escrow_signer = &[&escrow_seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.beneficiary_token_account.to_account_info(),
                authority: escrow.to_account_info(),
            },
            escrow_signer,
        );
        token::transfer(transfer_ctx, net_release_amount)?;
        
        // Transfer fee to fee collector (if any)
        if fee_amount > 0 && ctx.accounts.fee_collector_token_account.is_some() {
            let fee_transfer_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.fee_collector_token_account.as_ref().unwrap().to_account_info(),
                    authority: escrow.to_account_info(),
                },
                escrow_signer,
            );
            token::transfer(fee_transfer_ctx, fee_amount)?;
        }
        
        escrow.released_amount += release_amount;
        
        // If fully released, mark as completed
        if escrow.released_amount == escrow.deposited_amount {
            escrow.status = EscrowStatus::Completed;
        }
        
        emit!(TokensReleased {
            escrow_id,
            beneficiary: escrow.beneficiary,
            amount: net_release_amount,
            fee: fee_amount,
            total_released: escrow.released_amount,
            releaser: ctx.accounts.releaser.key(),
        });
        
        Ok(())
    }

    /// Refund tokens to depositor (in case of timeout or cancellation)
    pub fn refund(
        ctx: Context<Refund>,
        escrow_id: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(
            escrow.status == EscrowStatus::Active || escrow.status == EscrowStatus::Initialized,
            EscrowError::InvalidEscrowStatus
        );
        
        // Check if refund is allowed
        let can_refund = current_time > escrow.timeout_time || 
                        ctx.accounts.refunder.key() == escrow.depositor ||
                        escrow.dispute_active;
        
        require!(can_refund, EscrowError::RefundNotAllowed);
        
        let refund_amount = escrow.deposited_amount - escrow.released_amount;
        require!(refund_amount > 0, EscrowError::NoFundsToRefund);
        
        // Transfer tokens back to depositor
        let escrow_seeds = &[
            b"escrow",
            escrow_id.to_le_bytes().as_ref(),
            &[ctx.bumps.escrow],
        ];
        let escrow_signer = &[&escrow_seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.depositor_token_account.to_account_info(),
                authority: escrow.to_account_info(),
            },
            escrow_signer,
        );
        token::transfer(transfer_ctx, refund_amount)?;
        
        escrow.status = EscrowStatus::Refunded;
        
        emit!(TokensRefunded {
            escrow_id,
            depositor: escrow.depositor,
            amount: refund_amount,
            refund_time: current_time,
            refunder: ctx.accounts.refunder.key(),
        });
        
        Ok(())
    }

    /// Initiate a dispute
    pub fn initiate_dispute(
        ctx: Context<InitiateDispute>,
        escrow_id: u64,
        dispute_reason: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(escrow.status == EscrowStatus::Active, EscrowError::InvalidEscrowStatus);
        require!(!escrow.dispute_active, EscrowError::DisputeAlreadyActive);
        require!(dispute_reason.len() <= 500, EscrowError::DisputeReasonTooLong);
        
        // Only depositor or beneficiary can initiate dispute
        let initiator = ctx.accounts.initiator.key();
        require!(
            initiator == escrow.depositor || initiator == escrow.beneficiary,
            EscrowError::UnauthorizedDisputeInitiator
        );
        
        escrow.dispute_active = true;
        escrow.status = EscrowStatus::Disputed;
        
        emit!(DisputeInitiated {
            escrow_id,
            initiator,
            dispute_reason,
            dispute_time: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Resolve a dispute (dispute resolver only)
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        escrow_id: u64,
        resolution: DisputeResolution,
        depositor_amount: u64,
        beneficiary_amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(escrow.status == EscrowStatus::Disputed, EscrowError::InvalidEscrowStatus);
        require!(escrow.dispute_active, EscrowError::NoActiveDispute);
        
        // Check if resolver is authorized
        if let Some(resolver) = escrow.dispute_resolver {
            require!(ctx.accounts.resolver.key() == resolver, EscrowError::UnauthorizedResolver);
        } else {
            // If no specific resolver, allow admin or governance
            return Err(EscrowError::NoDisputeResolver.into());
        }
        
        let total_available = escrow.deposited_amount - escrow.released_amount;
        require!(depositor_amount + beneficiary_amount <= total_available, EscrowError::InvalidResolutionAmounts);
        
        let escrow_seeds = &[
            b"escrow",
            escrow_id.to_le_bytes().as_ref(),
            &[ctx.bumps.escrow],
        ];
        let escrow_signer = &[&escrow_seeds[..]];
        
        // Transfer to depositor if amount > 0
        if depositor_amount > 0 {
            let transfer_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.depositor_token_account.to_account_info(),
                    authority: escrow.to_account_info(),
                },
                escrow_signer,
            );
            token::transfer(transfer_ctx, depositor_amount)?;
        }
        
        // Transfer to beneficiary if amount > 0
        if beneficiary_amount > 0 {
            let transfer_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.beneficiary_token_account.to_account_info(),
                    authority: escrow.to_account_info(),
                },
                escrow_signer,
            );
            token::transfer(transfer_ctx, beneficiary_amount)?;
        }
        
        escrow.dispute_active = false;
        escrow.status = EscrowStatus::Resolved;
        escrow.released_amount += depositor_amount + beneficiary_amount;
        
        emit!(DisputeResolved {
            escrow_id,
            resolver: ctx.accounts.resolver.key(),
            resolution,
            depositor_amount,
            beneficiary_amount,
            resolution_time: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update escrow configuration (before activation)
    pub fn update_escrow_config(
        ctx: Context<UpdateEscrowConfig>,
        escrow_id: u64,
        new_timeout_duration: Option<i64>,
        new_fee_percentage: Option<u16>,
        new_partial_releases_enabled: Option<bool>,
        new_auto_release_enabled: Option<bool>,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(escrow.status == EscrowStatus::Initialized, EscrowError::CannotUpdateActiveEscrow);
        require!(ctx.accounts.authority.key() == escrow.depositor, EscrowError::UnauthorizedUpdate);
        
        if let Some(timeout_duration) = new_timeout_duration {
            require!(timeout_duration > 0, EscrowError::InvalidTimeout);
            escrow.timeout_time = escrow.creation_time + timeout_duration;
        }
        
        if let Some(fee_percentage) = new_fee_percentage {
            require!(fee_percentage <= 1000, EscrowError::InvalidFeePercentage); // Max 10%
            escrow.fee_percentage = fee_percentage;
        }
        
        if let Some(partial_releases) = new_partial_releases_enabled {
            escrow.partial_releases_enabled = partial_releases;
        }
        
        if let Some(auto_release) = new_auto_release_enabled {
            escrow.auto_release_enabled = auto_release;
        }
        
        emit!(EscrowConfigUpdated {
            escrow_id,
            authority: ctx.accounts.authority.key(),
            update_time: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Emergency pause (admin only)
    pub fn emergency_pause(
        ctx: Context<EmergencyPause>,
        escrow_id: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // This should be restricted to admin/governance
        require!(
            ctx.accounts.admin.key() == escrow.depositor, // Placeholder check
            EscrowError::UnauthorizedAdmin
        );
        
        escrow.status = EscrowStatus::Paused;
        
        emit!(EscrowPaused {
            escrow_id,
            admin: ctx.accounts.admin.key(),
            pause_time: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

// Account Structures
#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct InitializeEscrow<'info> {
    #[account(
        init,
        payer = depositor,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    /// CHECK: This is the beneficiary pubkey
    pub beneficiary: AccountInfo<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    #[account(mut)]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct Release<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub releaser: Signer<'info>,
    
    #[account(mut)]
    pub beneficiary_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub fee_collector_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct Refund<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub refunder: Signer<'info>,
    
    #[account(mut)]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct InitiateDispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub initiator: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct ResolveDispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub resolver: Signer<'info>,
    
    #[account(mut)]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub beneficiary_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct UpdateEscrowConfig<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct EmergencyPause<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub admin: Signer<'info>,
}

// Data Structures
#[account]
pub struct Escrow {
    pub escrow_id: u64,
    pub depositor: Pubkey,
    pub beneficiary: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub deposited_amount: u64,
    pub released_amount: u64,
    pub release_conditions: ReleaseConditions,
    pub status: EscrowStatus,
    pub creation_time: i64,
    pub timeout_time: i64,
    pub dispute_resolver: Option<Pubkey>,
    pub dispute_active: bool,
    pub partial_releases_enabled: bool,
    pub fee_percentage: u16, // Basis points
    pub auto_release_enabled: bool,
}

impl Escrow {
    pub const INIT_SPACE: usize = 8 + // escrow_id
        32 + // depositor
        32 + // beneficiary
        32 + // token_mint
        8 + // amount
        8 + // deposited_amount
        8 + // released_amount
        1 + 8 + // release_conditions (enum + data)
        1 + // status
        8 + // creation_time
        8 + // timeout_time
        1 + 32 + // dispute_resolver (Option<Pubkey>)
        1 + // dispute_active
        1 + // partial_releases_enabled
        2 + // fee_percentage
        1; // auto_release_enabled
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ReleaseConditions {
    Immediate,
    TimeDelay(i64), // Seconds
    BothPartiesApprove,
    BeneficiaryOnly,
    DepositorOnly,
    External, // External oracle or condition
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Initialized,
    Active,
    Completed,
    Refunded,
    Disputed,
    Resolved,
    Paused,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DisputeResolution {
    FavorDepositor,
    FavorBeneficiary,
    Split,
    Custom,
}

// Events
#[event]
pub struct EscrowInitialized {
    pub escrow_id: u64,
    pub depositor: Pubkey,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub timeout_time: i64,
}

#[event]
pub struct TokensDeposited {
    pub escrow_id: u64,
    pub depositor: Pubkey,
    pub amount: u64,
    pub total_deposited: u64,
}

#[event]
pub struct EscrowFullyFunded {
    pub escrow_id: u64,
    pub total_amount: u64,
    pub funding_time: i64,
}

#[event]
pub struct TokensReleased {
    pub escrow_id: u64,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub total_released: u64,
    pub releaser: Pubkey,
}

#[event]
pub struct TokensRefunded {
    pub escrow_id: u64,
    pub depositor: Pubkey,
    pub amount: u64,
    pub refund_time: i64,
    pub refunder: Pubkey,
}

#[event]
pub struct DisputeInitiated {
    pub escrow_id: u64,
    pub initiator: Pubkey,
    pub dispute_reason: String,
    pub dispute_time: i64,
}

#[event]
pub struct DisputeResolved {
    pub escrow_id: u64,
    pub resolver: Pubkey,
    pub resolution: DisputeResolution,
    pub depositor_amount: u64,
    pub beneficiary_amount: u64,
    pub resolution_time: i64,
}

#[event]
pub struct EscrowConfigUpdated {
    pub escrow_id: u64,
    pub authority: Pubkey,
    pub update_time: i64,
}

#[event]
pub struct EscrowPaused {
    pub escrow_id: u64,
    pub admin: Pubkey,
    pub pause_time: i64,
}

// Error Codes
#[error_code]
pub enum EscrowError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid timeout duration")]
    InvalidTimeout,
    #[msg("Invalid escrow status")]
    InvalidEscrowStatus,
    #[msg("Exceeds escrow amount")]
    ExceedsEscrowAmount,
    #[msg("Unauthorized depositor")]
    UnauthorizedDepositor,
    #[msg("Release conditions not met")]
    ReleaseConditionsNotMet,
    #[msg("Insufficient escrow balance")]
    InsufficientEscrowBalance,
    #[msg("Refund not allowed")]
    RefundNotAllowed,
    #[msg("No funds to refund")]
    NoFundsToRefund,
    #[msg("Dispute already active")]
    DisputeAlreadyActive,
    #[msg("Dispute reason too long")]
    DisputeReasonTooLong,
    #[msg("Unauthorized dispute initiator")]
    UnauthorizedDisputeInitiator,
    #[msg("No active dispute")]
    NoActiveDispute,
    #[msg("Unauthorized resolver")]
    UnauthorizedResolver,
    #[msg("No dispute resolver")]
    NoDisputeResolver,
    #[msg("Invalid resolution amounts")]
    InvalidResolutionAmounts,
    #[msg("Cannot update active escrow")]
    CannotUpdateActiveEscrow,
    #[msg("Unauthorized update")]
    UnauthorizedUpdate,
    #[msg("Invalid fee percentage")]
    InvalidFeePercentage,
    #[msg("Unauthorized admin")]
    UnauthorizedAdmin,
    #[msg("Dispute is active")]
    DisputeActive,
}

