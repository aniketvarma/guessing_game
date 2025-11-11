# Solana Guessing Game 🎮

A decentralized guessing game built on Solana using the Anchor framework. Players try to guess a secret number set by the game creator, with all game state stored on-chain.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Program Architecture](#program-architecture)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Program Instructions](#program-instructions)
- [Account Structure](#account-structure)
- [Error Codes](#error-codes)
- [Deployment](#deployed-program)
- [Development](#development)

## 🎯 Overview

This Solana program implements a simple guessing game where:
- A creator initializes a game with a secret number (1-100)
- Players make guesses to find the secret number
- The game tracks attempts and determines winners
- Only completed games can be closed by their creators

## ✨ Features

- **On-chain Game State**: All game data stored securely on Solana blockchain
- **PDA-based Accounts**: Uses Program Derived Addresses for deterministic account creation
- **Fair Play**: Prevents creators from guessing their own games
- **Attempt Tracking**: Counts the number of guesses made
- **Winner Recording**: Stores the public key of the winning player
- **Game Closure**: Allows creators to close completed games and reclaim rent

## 🏗️ Program Architecture

### Instructions

1. **`new_game`**: Create a new game with a secret number
2. **`make_guess`**: Make a guess at the secret number
3. **`close_game`**: Close a completed game (only inactive games)

### Account Structure

```rust
pub struct GameState {
    pub secret_number: u8,      // The secret number to guess (1-100)
    pub attempts: u8,            // Number of guesses made
    pub creator: Pubkey,         // Public key of the game creator
    pub is_active: bool,         // Whether the game is still active
    pub winner: Option<Pubkey>,  // Public key of the winner (if any)
    pub bump: u8,                // PDA bump seed
}
```

## 🚀 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.18+)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.32+)
- [Node.js](https://nodejs.org/) (v18+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aniketvarma/guessing_game.git
   cd guessing_game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the program**
   ```bash
   anchor build
   ```

4. **Deploy to local validator**
   ```bash
   # Start local validator in a separate terminal
   solana-test-validator

   # Deploy the program
   anchor deploy
   ```

## 🧪 Testing

Run the test suite:

```bash
anchor test
```

### Test Coverage

The test suite includes:

1. **Game Creation Test**
   - Creates a new game with secret number 42
   - Verifies initial game state (attempts=0, active=true, no winner)

2. **Wrong Guess Test**
   - Makes a wrong guess (30) and verifies game remains active
   - Checks attempts counter increments

3. **Winning Guess and Game Closure Test**
   - Makes a correct guess (42) and verifies game ends
   - Closes the game and verifies account is deleted
   - Checks attempts counter and winner assignment

### Sample Test Output

```
guessing_game
  ✓ Creates a new game with a secret number (251ms)
  ✓ GGuessing the secret number (814ms)
  ✓ closing the game (456ms)

3 passing (1s)
```

## 📚 Program Instructions

### 1. New Game

**Instruction**: `new_game`

**Parameters**:
- `secret_number: u8` - The secret number to guess (1-100)

**Accounts**:
- `game_state` - PDA account to store game state (created)
- `creator` - Signer and payer for the account
- `system_program` - System program for account creation

**Example**:
```typescript
await program.methods.newGame(42).accounts({
  gameState: gameStatePda,
  creator: creatorPublicKey,
  systemProgram: SystemProgram.programId,
}).rpc();
```

**Constraints**:
- Secret number must be between 1-100
- Creates a PDA with seeds: `["game", creator.pubkey]`

---

### 2. Make Guess

**Instruction**: `make_guess`

**Parameters**:
- `guess: u8` - The player's guess (1-100)

**Accounts**:
- `game_state` - PDA account with the game state (mutable)
- `guesser` - Signer making the guess

**Example**:
```typescript
await program.methods.makeGuess(42).accounts({
  gameState: gameStatePda,
  guesser: guesserPublicKey,
}).signers([guesserKeypair]).rpc();
```

**Game Logic**:
- Increments attempt counter
- If guess matches secret number:
  - Sets `is_active = false`
  - Records winner's public key
  - Logs success message
- If guess is too low:
  - Logs "Your guess is too low!"
- If guess is too high:
  - Logs "Your guess is too high!"

**Constraints**:
- Game must be active (`is_active = true`)
- Guesser cannot be the creator
- Guess must be between 1-100

---

### 3. Close Game

**Instruction**: `close_game`

**Accounts**:
- `game_state` - PDA account to close (mutable)
- `creator` - Game creator (mutable, receives rent refund)

**Example**:
```typescript
await program.methods.closeGame().accounts({
  gameState: gameStatePda,
  creator: creatorPublicKey,
}).rpc();
```

**Constraints**:
- Game must be inactive (`is_active = false`)
- Only the creator can close the game
- Rent is refunded to the creator

## 🗂️ Account Structure

### GameState PDA

**Seeds**: `["game", creator.pubkey]`

**Space Calculation**: `8 + 1 + 1 + 32 + 1 + 33 + 1 = 77 bytes`
- Anchor discriminator: 8 bytes
- `secret_number`: 1 byte (u8)
- `attempts`: 1 byte (u8)
- `creator`: 32 bytes (Pubkey)
- `is_active`: 1 byte (bool)
- `winner`: 33 bytes (Option<Pubkey>: 1 byte discriminant + 32 bytes)
- `bump`: 1 byte (u8)

## ⚠️ Error Codes

```rust
pub enum GameError {
    #[msg("Secret number must be between 1 and 100")]
    InvalidNumber,          // 6000
    
    #[msg("The creator of the game cannot make guesses")]
    CannotGuessOwnGame,     // 6001
    
    #[msg("The game is not active")]
    GameNotActive,          // 6002
    
    #[msg("The game is still active")]
    GameStillActive,        // 6003
    
    #[msg("Only the creator can close this game")]
    UnAuthorized,           // 6004
}
```

## 🌐 Deployed Program

**Network:** Solana Devnet

**Program ID:** `CgmYL5KARiCGFXP1bpWh8xuX9B2anwoW3Ygj4GTScRud`

**IDL Account:** `Diac2KyyCSyeiPJJx3toa3DGQ8RMS3RWNpNDwdkyo7Ph`

**Explorer:** [View on Solana Explorer](https://explorer.solana.com/address/CgmYL5KARiCGFXP1bpWh8xuX9B2anwoW3Ygj4GTScRud?cluster=devnet)

### How to Interact

```bash
# Connect to the deployed program
solana config set --url devnet

# View program info
solana program show CgmYL5KARiCGFXP1bpWh8xuX9B2anwoW3Ygj4GTScRud
```

## 🛠️ Development

### Project Structure

```
guessing_game/
├── programs/
│   └── guessing_game/
│       └── src/
│           └── lib.rs          # Main program logic
├── tests/
│   └── guessing_game.ts        # TypeScript tests
├── target/
│   ├── idl/                    # Generated IDL
│   └── types/                  # Generated TypeScript types
├── Anchor.toml                 # Anchor configuration
├── Cargo.toml                  # Rust dependencies
└── package.json                # Node.js dependencies
```

### Local Development

1. **Start local validator**
   ```bash
   solana-test-validator
   ```

2. **Watch for changes and rebuild**
   ```bash
   anchor build
   ```

3. **Run tests**
   ```bash
   anchor test
   ```

### Deploying to Devnet

1. **Configure Solana CLI for devnet**
   ```bash
   solana config set --url devnet
   ```

2. **Airdrop SOL for deployment**
   ```bash
   solana airdrop 2
   ```

3. **Deploy**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

## 🔐 Security Considerations

- ✅ Creator cannot guess their own game
- ✅ Only inactive games can be closed
- ✅ Only the creator can close their game
- ✅ PDA ensures unique game per creator
- ✅ Input validation for guess ranges (1-100)
- ✅ Proper error handling with custom error codes

## 🎮 Game Rules

1. Creator sets a secret number between 1 and 100
2. Other players can make guesses
3. Each guess increments the attempt counter
4. Players receive feedback: "too high", "too low", or "correct"
5. First player to guess correctly wins
6. Winner's public key is recorded on-chain
7. Creator can close the game after someone wins

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- GitHub: [@aniketvarma](https://github.com/aniketvarma)
- Repository: [guessing_game](https://github.com/aniketvarma/guessing_game)

---

**Built with ❤️ using Anchor Framework on Solana**
