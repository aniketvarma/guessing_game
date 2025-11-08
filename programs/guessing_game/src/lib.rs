use anchor_lang::prelude::*;

declare_id!("CgmYL5KARiCGFXP1bpWh8xuX9B2anwoW3Ygj4GTScRud");

#[program]
pub mod guessing_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
