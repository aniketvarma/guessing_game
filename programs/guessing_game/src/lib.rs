use anchor_lang::prelude::*;

declare_id!("CgmYL5KARiCGFXP1bpWh8xuX9B2anwoW3Ygj4GTScRud");

#[program]
pub mod guessing_game {
    use super::*;

    pub fn new_game(ctx: Context<NewGame>, secret_number: u8) -> Result<()> {
        require!(secret_number > 0 && secret_number <= 100, GameError::InvalidNumber);
        let game_state = &mut ctx.accounts.game_state;
        game_state.secret_number = secret_number;
        game_state.attempts = 0;
        game_state.creator = ctx.accounts.creator.key();
        game_state.is_active = true;
        game_state.winner = None;
        game_state.bump = ctx.bumps.game_state;

        msg!("New game created by {}", ctx.accounts.creator.key());

        Ok(())
    }

   pub fn make_guess(ctx: Context<MakeGuess>, guess:u8) -> Result<()> {

    require!(ctx.accounts.game_state.is_active, GameError::GameNotActive);
    require!(guess > 0 && guess <= 100, GameError::InvalidNumber);
    require!(ctx.accounts.game_state.creator != ctx.accounts.guesser.key(), GameError::CannotGuessOwnGame);

    ctx.accounts.game_state.attempts +=1;

    if guess == ctx.accounts.game_state.secret_number{
         ctx.accounts.game_state.is_active = false;
         ctx.accounts.game_state.winner = Some(ctx.accounts.guesser.key());
         msg!("{} guessed the correct number {} in {} attempts!", ctx.accounts.guesser.key(), guess, ctx.accounts.game_state.attempts);

    } else if guess < ctx.accounts.game_state.secret_number{
        msg!("Your guess of {} is too low!", guess);
    } else {
        msg!("Your guess of {} is too high!", guess);
        
    }
    

       Ok(())
   }


   pub fn close_game(ctx: Context<CloseGame>)-> Result<()>{
    msg!("Game has been closed.");
    Ok(())
   }

}



#[derive(Accounts)]
pub struct NewGame<'info> {

   #[account(init, payer = creator, space =  8 + 1 + 1 + 32 + 1 + 33 + 1, seeds = [b"game", creator.key().as_ref()] , bump)]
   pub game_state: Account<'info, GameState>,

   #[account(mut)]
   pub creator: Signer<'info>,

   pub system_program: Program<'info, System>,



}


#[derive(Accounts)]
 pub struct MakeGuess<'info> {

    #[account(mut, seeds =[b"game", game_state.creator.as_ref()], bump = game_state.bump)]
    pub game_state: Account<'info, GameState>,

    pub guesser: Signer<'info>,
 }


 #[derive(Accounts)]
 pub struct CloseGame<'info> {
    #[account(
        mut,
         close = creator, 
         seeds =[b"game", creator.key().as_ref()], bump = game_state.bump,
         constraint = game_state.creator == creator.key() @ GameError::CannotGuessOwnGame,
        constraint = game_state.is_active == false @ GameError::UnAuthorized
          )]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub creator: Signer<'info>,
 }


#[account]
pub struct GameState {
    pub secret_number: u8,
    pub attempts: u8,
    pub creator: Pubkey,
    pub is_active: bool,
    pub winner: Option<Pubkey>,
    pub bump: u8,
    
}

#[error_code]
pub enum GameError {
    #[msg("Secret number must be between 1 and 100")]
    InvalidNumber,
    #[msg("The creator of the game cannot make guesses")]
    CannotGuessOwnGame,
    #[msg("The game is not active")]
    GameNotActive,
    #[msg("The game is still active")]
    GameStillActive,

    UnAuthorized,
}
