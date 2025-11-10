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

   pub fn make_guess(ctx: Context<MakeGuess>, guess: u8) -> Result<()> {
    let game = &mut ctx.accounts.game_state;
    let guesser_key = ctx.accounts.guesser.key();

    require!(game.is_active, GameError::GameNotActive);
    require!(guess > 0 && guess <= 100, GameError::InvalidNumber);
    require!(game.creator != guesser_key, GameError::CannotGuessOwnGame);

    game.attempts += 1;

    use std::cmp::Ordering;
    match guess.cmp(&game.secret_number) {
        Ordering::Equal => {
            game.is_active = false;
            game.winner = Some(guesser_key);
            msg!("{} guessed the correct number {} in {} attempts!", guesser_key, guess, game.attempts);
        }
        Ordering::Less => {
            msg!("Your guess of {} is too low!", guess);
        }
        Ordering::Greater => {
            msg!("Your guess of {} is too high!", guess);
        }
    }

    Ok(())
   }


   pub fn close_game(ctx: Context<CloseGame>)-> Result<()>{
    msg!("Game has been closed. {} retrieves the funds.", ctx.accounts.creator.key());
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
         constraint = game_state.creator == creator.key() @ GameError::UnAuthorized,
        constraint = game_state.is_active == false @ GameError::GameStillActive,
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
    #[msg("Only the creator can close this game")]
    UnAuthorized,
}
