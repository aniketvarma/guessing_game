'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletContextProvider } from './components/WalletContextProvider';
import { CreateGame } from './components/CreateGame';
import { MakeGuess } from './components/MakeGuess';
import { GameStatus } from './components/GameStatus';
import { useGuessingGame } from './hooks/useGuessingGame';

function GuessingGameApp() {
  const wallet = useWallet();
  const { gameState, loading, createGame, makeGuess, closeGame } = useGuessingGame();

  const isCreator = gameState && wallet.publicKey 
    ? gameState.creator.toString() === wallet.publicKey.toString()
    : false;

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">🎮 Solana Guessing Game</h1>
        <WalletMultiButton />
      </header>

      {!wallet.connected ? (
        <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2>Welcome to Solana Guessing Game!</h2>
          <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
            A decentralized guessing game built on Solana. Create a game with a secret number (1-100), 
            and challenge other players to guess it! All game state is stored on-chain.
          </p>
          <div className="message message-info" style={{ marginTop: '2rem' }}>
            Connect your wallet to start playing!
          </div>
        </div>
      ) : (
        <>
          <div className="main-content">
            <div>
              <CreateGame onCreateGame={createGame} loading={loading} />
              <div style={{ marginTop: '2rem' }}>
                <GameStatus 
                  gameState={gameState} 
                  isCreator={isCreator}
                  onCloseGame={closeGame}
                  loading={loading}
                />
              </div>
            </div>
            <div>
              <MakeGuess 
                onMakeGuess={makeGuess} 
                loading={loading}
                gameActive={gameState?.isActive || false}
              />
            </div>
          </div>

          <div style={{ marginTop: '3rem', maxWidth: '1200px', width: '100%' }}>
            <div className="card">
              <h2>How to Play</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div>
                  <h3 style={{ color: '#14f195', marginBottom: '0.5rem' }}>1. Create a Game</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Set a secret number between 1-100. Share your wallet address with players.
                  </p>
                </div>
                <div>
                  <h3 style={{ color: '#14f195', marginBottom: '0.5rem' }}>2. Make Guesses</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Enter a creator's address and your guess. Get hints: too high, too low, or correct!
                  </p>
                </div>
                <div>
                  <h3 style={{ color: '#14f195', marginBottom: '0.5rem' }}>3. Win & Close</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    First correct guess wins! Creators can close completed games to reclaim rent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <footer style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <p>Built with ❤️ using Anchor Framework on Solana</p>
        {wallet.connected && wallet.publicKey && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Your Wallet: {wallet.publicKey.toString().slice(0, 4)}...{wallet.publicKey.toString().slice(-4)}
          </p>
        )}
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <WalletContextProvider>
      <GuessingGameApp />
    </WalletContextProvider>
  );
}
