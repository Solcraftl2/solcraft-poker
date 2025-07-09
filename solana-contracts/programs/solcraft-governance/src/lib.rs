use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::collections::BTreeMap;

declare_id!("GOVERNANCESolCraftPokerProgramId1111111111");

#[program]
pub mod solcraft_governance {
    use super::*;

    /// Initialize governance system
    pub fn initialize_governance(
        ctx: Context<InitializeGovernance>,
        voting_delay: i64, // Delay before voting starts (seconds)
        voting_period: i64, // Duration of voting period (seconds)
        proposal_threshold: u64, // Min tokens needed to create proposal
        quorum_threshold: u64, // Min votes needed for quorum (basis points)
        execution_delay: i64, // Delay before execution after passing (seconds)
    ) -> Result<()> {
        let governance = &mut ctx.accounts.governance;
        
        require!(voting_delay >= 0, GovernanceError::InvalidVotingDelay);
        require!(voting_period > 0, GovernanceError::InvalidVotingPeriod);
        require!(proposal_threshold > 0, GovernanceError::InvalidProposalThreshold);
        require!(quorum_threshold <= 10000, GovernanceError::InvalidQuorumThreshold);
        require!(execution_delay >= 0, GovernanceError::InvalidExecutionDelay);
        
        governance.admin = ctx.accounts.admin.key();
        governance.governance_token = ctx.accounts.governance_token.key();
        governance.voting_delay = voting_delay;
        governance.voting_period = voting_period;
        governance.proposal_threshold = proposal_threshold;
        governance.quorum_threshold = quorum_threshold;
        governance.execution_delay = execution_delay;
        governance.proposal_count = 0;
        governance.is_active = true;
        
        emit!(GovernanceInitialized {
            admin: ctx.accounts.admin.key(),
            governance_token: ctx.accounts.governance_token.key(),
            voting_delay,
            voting_period,
            proposal_threshold,
            quorum_threshold,
        });
        
        Ok(())
    }

    /// Create a new proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType,
        execution_data: Vec<u8>,
    ) -> Result<()> {
        let governance = &mut ctx.accounts.governance;
        let proposal = &mut ctx.accounts.proposal;
        let proposer_balance = ctx.accounts.proposer_token_account.amount;
        
        require!(governance.is_active, GovernanceError::GovernanceNotActive);
        require!(proposer_balance >= governance.proposal_threshold, GovernanceError::InsufficientTokens);
        require!(title.len() <= 100, GovernanceError::TitleTooLong);
        require!(description.len() <= 1000, GovernanceError::DescriptionTooLong);
        
        let current_time = Clock::get()?.unix_timestamp;
        let proposal_id = governance.proposal_count + 1;
        
        proposal.proposal_id = proposal_id;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.proposal_type = proposal_type;
        proposal.execution_data = execution_data;
        proposal.creation_time = current_time;
        proposal.voting_start_time = current_time + governance.voting_delay;
        proposal.voting_end_time = current_time + governance.voting_delay + governance.voting_period;
        proposal.execution_time = 0;
        proposal.status = ProposalStatus::Pending;
        proposal.for_votes = 0;
        proposal.against_votes = 0;
        proposal.abstain_votes = 0;
        proposal.total_votes = 0;
        proposal.executed = false;
        proposal.cancelled = false;
        
        governance.proposal_count = proposal_id;
        
        emit!(ProposalCreated {
            proposal_id,
            proposer: ctx.accounts.proposer.key(),
            title: proposal.title.clone(),
            proposal_type,
            voting_start_time: proposal.voting_start_time,
            voting_end_time: proposal.voting_end_time,
        });
        
        Ok(())
    }

    /// Cast a vote on a proposal
    pub fn cast_vote(
        ctx: Context<CastVote>,
        proposal_id: u64,
        vote_type: VoteType,
        voting_power: u64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;
        let voter_balance = ctx.accounts.voter_token_account.amount;
        
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(current_time >= proposal.voting_start_time, GovernanceError::VotingNotStarted);
        require!(current_time <= proposal.voting_end_time, GovernanceError::VotingEnded);
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);
        require!(voting_power <= voter_balance, GovernanceError::InsufficientVotingPower);
        require!(voting_power > 0, GovernanceError::InvalidVotingPower);
        
        // Check if user already voted
        require!(vote_record.voting_power == 0, GovernanceError::AlreadyVoted);
        
        // Record the vote
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.proposal_id = proposal_id;
        vote_record.vote_type = vote_type;
        vote_record.voting_power = voting_power;
        vote_record.vote_time = current_time;
        
        // Update proposal vote counts
        match vote_type {
            VoteType::For => proposal.for_votes += voting_power,
            VoteType::Against => proposal.against_votes += voting_power,
            VoteType::Abstain => proposal.abstain_votes += voting_power,
        }
        proposal.total_votes += voting_power;
        
        // Update proposal status if this is the first vote
        if proposal.status == ProposalStatus::Pending {
            proposal.status = ProposalStatus::Active;
        }
        
        emit!(VoteCast {
            proposal_id,
            voter: ctx.accounts.voter.key(),
            vote_type,
            voting_power,
            total_for: proposal.for_votes,
            total_against: proposal.against_votes,
        });
        
        Ok(())
    }

    /// Queue a proposal for execution (after voting ends)
    pub fn queue_proposal(
        ctx: Context<QueueProposal>,
        proposal_id: u64,
    ) -> Result<()> {
        let governance = &ctx.accounts.governance;
        let proposal = &mut ctx.accounts.proposal;
        
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(current_time > proposal.voting_end_time, GovernanceError::VotingNotEnded);
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);
        require!(!proposal.executed, GovernanceError::ProposalAlreadyExecuted);
        require!(!proposal.cancelled, GovernanceError::ProposalCancelled);
        
        // Check if proposal passed
        let total_supply = 1_000_000_000; // This should be fetched from token mint
        let quorum_required = (total_supply * governance.quorum_threshold) / 10000;
        let proposal_passed = proposal.for_votes > proposal.against_votes && 
                             proposal.total_votes >= quorum_required;
        
        if proposal_passed {
            proposal.status = ProposalStatus::Queued;
            proposal.execution_time = current_time + governance.execution_delay;
            
            emit!(ProposalQueued {
                proposal_id,
                execution_time: proposal.execution_time,
                for_votes: proposal.for_votes,
                against_votes: proposal.against_votes,
                total_votes: proposal.total_votes,
            });
        } else {
            proposal.status = ProposalStatus::Defeated;
            
            emit!(ProposalDefeated {
                proposal_id,
                for_votes: proposal.for_votes,
                against_votes: proposal.against_votes,
                total_votes: proposal.total_votes,
                quorum_required,
            });
        }
        
        Ok(())
    }

    /// Execute a queued proposal
    pub fn execute_proposal(
        ctx: Context<ExecuteProposal>,
        proposal_id: u64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(proposal.status == ProposalStatus::Queued, GovernanceError::ProposalNotQueued);
        require!(current_time >= proposal.execution_time, GovernanceError::ExecutionDelayNotMet);
        require!(!proposal.executed, GovernanceError::ProposalAlreadyExecuted);
        require!(!proposal.cancelled, GovernanceError::ProposalCancelled);
        
        // Execute the proposal based on its type
        match proposal.proposal_type {
            ProposalType::ParameterChange => {
                // Handle parameter changes
                self.execute_parameter_change(ctx, proposal)?;
            },
            ProposalType::TreasurySpend => {
                // Handle treasury spending
                self.execute_treasury_spend(ctx, proposal)?;
            },
            ProposalType::UpgradeContract => {
                // Handle contract upgrades
                self.execute_contract_upgrade(ctx, proposal)?;
            },
            ProposalType::Emergency => {
                // Handle emergency actions
                self.execute_emergency_action(ctx, proposal)?;
            },
            ProposalType::General => {
                // Handle general proposals (no automatic execution)
                // These require manual implementation
            },
        }
        
        proposal.executed = true;
        proposal.status = ProposalStatus::Executed;
        
        emit!(ProposalExecuted {
            proposal_id,
            execution_time: current_time,
            proposal_type: proposal.proposal_type,
        });
        
        Ok(())
    }

    /// Cancel a proposal (admin only or proposer)
    pub fn cancel_proposal(
        ctx: Context<CancelProposal>,
        proposal_id: u64,
    ) -> Result<()> {
        let governance = &ctx.accounts.governance;
        let proposal = &mut ctx.accounts.proposal;
        let canceller = ctx.accounts.canceller.key();
        
        require!(!proposal.executed, GovernanceError::ProposalAlreadyExecuted);
        require!(!proposal.cancelled, GovernanceError::ProposalAlreadyCancelled);
        
        // Only admin or proposer can cancel
        require!(
            canceller == governance.admin || canceller == proposal.proposer,
            GovernanceError::UnauthorizedCancellation
        );
        
        proposal.cancelled = true;
        proposal.status = ProposalStatus::Cancelled;
        
        emit!(ProposalCancelled {
            proposal_id,
            canceller,
            cancellation_time: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update governance parameters (via governance)
    pub fn update_governance_params(
        ctx: Context<UpdateGovernanceParams>,
        new_voting_delay: Option<i64>,
        new_voting_period: Option<i64>,
        new_proposal_threshold: Option<u64>,
        new_quorum_threshold: Option<u64>,
        new_execution_delay: Option<i64>,
    ) -> Result<()> {
        let governance = &mut ctx.accounts.governance;
        
        // This should only be callable via governance proposal execution
        require!(
            ctx.accounts.authority.key() == governance.admin,
            GovernanceError::UnauthorizedUpdate
        );
        
        if let Some(voting_delay) = new_voting_delay {
            require!(voting_delay >= 0, GovernanceError::InvalidVotingDelay);
            governance.voting_delay = voting_delay;
        }
        
        if let Some(voting_period) = new_voting_period {
            require!(voting_period > 0, GovernanceError::InvalidVotingPeriod);
            governance.voting_period = voting_period;
        }
        
        if let Some(proposal_threshold) = new_proposal_threshold {
            require!(proposal_threshold > 0, GovernanceError::InvalidProposalThreshold);
            governance.proposal_threshold = proposal_threshold;
        }
        
        if let Some(quorum_threshold) = new_quorum_threshold {
            require!(quorum_threshold <= 10000, GovernanceError::InvalidQuorumThreshold);
            governance.quorum_threshold = quorum_threshold;
        }
        
        if let Some(execution_delay) = new_execution_delay {
            require!(execution_delay >= 0, GovernanceError::InvalidExecutionDelay);
            governance.execution_delay = execution_delay;
        }
        
        emit!(GovernanceParamsUpdated {
            admin: governance.admin,
            voting_delay: governance.voting_delay,
            voting_period: governance.voting_period,
            proposal_threshold: governance.proposal_threshold,
            quorum_threshold: governance.quorum_threshold,
        });
        
        Ok(())
    }

    // Helper functions for proposal execution
    fn execute_parameter_change(
        &self,
        ctx: Context<ExecuteProposal>,
        proposal: &Account<Proposal>,
    ) -> Result<()> {
        // Decode execution data and apply parameter changes
        // This would contain specific parameter change logic
        msg!("Executing parameter change proposal");
        Ok(())
    }

    fn execute_treasury_spend(
        &self,
        ctx: Context<ExecuteProposal>,
        proposal: &Account<Proposal>,
    ) -> Result<()> {
        // Execute treasury spending
        msg!("Executing treasury spend proposal");
        Ok(())
    }

    fn execute_contract_upgrade(
        &self,
        ctx: Context<ExecuteProposal>,
        proposal: &Account<Proposal>,
    ) -> Result<()> {
        // Execute contract upgrade
        msg!("Executing contract upgrade proposal");
        Ok(())
    }

    fn execute_emergency_action(
        &self,
        ctx: Context<ExecuteProposal>,
        proposal: &Account<Proposal>,
    ) -> Result<()> {
        // Execute emergency action
        msg!("Executing emergency action proposal");
        Ok(())
    }
}

// Account Structures
#[derive(Accounts)]
pub struct InitializeGovernance<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Governance::INIT_SPACE,
        seeds = [b"governance"],
        bump
    )]
    pub governance: Account<'info, Governance>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// CHECK: This is the governance token mint
    pub governance_token: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub governance: Account<'info, Governance>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    #[account(
        constraint = proposer_token_account.owner == proposer.key(),
        constraint = proposer_token_account.mint == governance.governance_token
    )]
    pub proposer_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(
        constraint = voter_token_account.owner == voter.key()
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct QueueProposal<'info> {
    pub governance: Account<'info, Governance>,
    
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct ExecuteProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    pub executor: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CancelProposal<'info> {
    pub governance: Account<'info, Governance>,
    
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    pub canceller: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateGovernanceParams<'info> {
    #[account(
        mut,
        seeds = [b"governance"],
        bump
    )]
    pub governance: Account<'info, Governance>,
    
    pub authority: Signer<'info>,
}

// Data Structures
#[account]
pub struct Governance {
    pub admin: Pubkey,
    pub governance_token: Pubkey,
    pub voting_delay: i64,
    pub voting_period: i64,
    pub proposal_threshold: u64,
    pub quorum_threshold: u64, // Basis points
    pub execution_delay: i64,
    pub proposal_count: u64,
    pub is_active: bool,
}

impl Governance {
    pub const INIT_SPACE: usize = 32 + // admin
        32 + // governance_token
        8 + // voting_delay
        8 + // voting_period
        8 + // proposal_threshold
        8 + // quorum_threshold
        8 + // execution_delay
        8 + // proposal_count
        1; // is_active
}

#[account]
pub struct Proposal {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub execution_data: Vec<u8>,
    pub creation_time: i64,
    pub voting_start_time: i64,
    pub voting_end_time: i64,
    pub execution_time: i64,
    pub status: ProposalStatus,
    pub for_votes: u64,
    pub against_votes: u64,
    pub abstain_votes: u64,
    pub total_votes: u64,
    pub executed: bool,
    pub cancelled: bool,
}

impl Proposal {
    pub const INIT_SPACE: usize = 8 + // proposal_id
        32 + // proposer
        4 + 100 + // title (max 100 chars)
        4 + 1000 + // description (max 1000 chars)
        1 + // proposal_type
        4 + 256 + // execution_data (max 256 bytes)
        8 + // creation_time
        8 + // voting_start_time
        8 + // voting_end_time
        8 + // execution_time
        1 + // status
        8 + // for_votes
        8 + // against_votes
        8 + // abstain_votes
        8 + // total_votes
        1 + // executed
        1; // cancelled
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub proposal_id: u64,
    pub vote_type: VoteType,
    pub voting_power: u64,
    pub vote_time: i64,
}

impl VoteRecord {
    pub const INIT_SPACE: usize = 32 + // voter
        8 + // proposal_id
        1 + // vote_type
        8 + // voting_power
        8; // vote_time
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalType {
    General,
    ParameterChange,
    TreasurySpend,
    UpgradeContract,
    Emergency,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Pending,
    Active,
    Queued,
    Executed,
    Defeated,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoteType {
    For,
    Against,
    Abstain,
}

// Events
#[event]
pub struct GovernanceInitialized {
    pub admin: Pubkey,
    pub governance_token: Pubkey,
    pub voting_delay: i64,
    pub voting_period: i64,
    pub proposal_threshold: u64,
    pub quorum_threshold: u64,
}

#[event]
pub struct ProposalCreated {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub proposal_type: ProposalType,
    pub voting_start_time: i64,
    pub voting_end_time: i64,
}

#[event]
pub struct VoteCast {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub vote_type: VoteType,
    pub voting_power: u64,
    pub total_for: u64,
    pub total_against: u64,
}

#[event]
pub struct ProposalQueued {
    pub proposal_id: u64,
    pub execution_time: i64,
    pub for_votes: u64,
    pub against_votes: u64,
    pub total_votes: u64,
}

#[event]
pub struct ProposalExecuted {
    pub proposal_id: u64,
    pub execution_time: i64,
    pub proposal_type: ProposalType,
}

#[event]
pub struct ProposalDefeated {
    pub proposal_id: u64,
    pub for_votes: u64,
    pub against_votes: u64,
    pub total_votes: u64,
    pub quorum_required: u64,
}

#[event]
pub struct ProposalCancelled {
    pub proposal_id: u64,
    pub canceller: Pubkey,
    pub cancellation_time: i64,
}

#[event]
pub struct GovernanceParamsUpdated {
    pub admin: Pubkey,
    pub voting_delay: i64,
    pub voting_period: i64,
    pub proposal_threshold: u64,
    pub quorum_threshold: u64,
}

// Error Codes
#[error_code]
pub enum GovernanceError {
    #[msg("Invalid voting delay")]
    InvalidVotingDelay,
    #[msg("Invalid voting period")]
    InvalidVotingPeriod,
    #[msg("Invalid proposal threshold")]
    InvalidProposalThreshold,
    #[msg("Invalid quorum threshold")]
    InvalidQuorumThreshold,
    #[msg("Invalid execution delay")]
    InvalidExecutionDelay,
    #[msg("Governance is not active")]
    GovernanceNotActive,
    #[msg("Insufficient tokens to create proposal")]
    InsufficientTokens,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Voting has not started")]
    VotingNotStarted,
    #[msg("Voting has ended")]
    VotingEnded,
    #[msg("Proposal is not active")]
    ProposalNotActive,
    #[msg("Insufficient voting power")]
    InsufficientVotingPower,
    #[msg("Invalid voting power")]
    InvalidVotingPower,
    #[msg("Already voted")]
    AlreadyVoted,
    #[msg("Voting has not ended")]
    VotingNotEnded,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
    #[msg("Proposal is cancelled")]
    ProposalCancelled,
    #[msg("Proposal is not queued")]
    ProposalNotQueued,
    #[msg("Execution delay not met")]
    ExecutionDelayNotMet,
    #[msg("Proposal already cancelled")]
    ProposalAlreadyCancelled,
    #[msg("Unauthorized cancellation")]
    UnauthorizedCancellation,
    #[msg("Unauthorized update")]
    UnauthorizedUpdate,
}

