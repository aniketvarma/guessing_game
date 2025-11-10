'use client';

import { FC } from 'react';
import { PublicKey } from '@solana/web3.js';

interface GameState {
  secretNumber: number;
  attempts: number;
  creator: PublicKey;
  isActive: boolean;
  winner: PublicKey | null;
  bump: number;
}

interface GameStatusProps {
  gameState: GameState | null;
  isCreator: boolean;
  onCloseGame: () => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

export const GameStatus: FC<GameStatusProps> = ({ gameState, isCreator, onCloseGame, loading }) => {
  if (!gameState) {
    return (
      <div className="card">
        <h2>Game Status</h2>
        <div className="message message-info">
          No active game found. Create a new game to start!
        </div>
      </div>
    );
  }

  const shortenAddress = (address: PublicKey) => {
    const str = address.toString();
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  };

  return (
    <div className="card">
      <h2>Game Status</h2>
      
      <div className="status-item">
        <span className="status-label">Game Status:</span>
        <span className="status-value">
          {gameState.isActive ? (
            <span style={{ color: '#14f195' }}>● Active</span>
          ) : (
            <span style={{ color: '#ff6b6b' }}>● Completed</span>
          )}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">Creator:</span>
        <span className="status-value">{shortenAddress(gameState.creator)}</span>
      </div>

      <div className="status-item">
        <span className="status-label">Attempts:</span>
        <span className="status-value">{gameState.attempts}</span>
      </div>

      {isCreator && (
        <div className="status-item">
          <span className="status-label">Secret Number:</span>
          <span className="status-value" style={{ color: '#9945ff' }}>
            {gameState.secretNumber}
          </span>
        </div>
      )}

      {gameState.winner && (
        <div className="status-item">
          <span className="status-label">Winner:</span>
          <span className="status-value">
            {shortenAddress(gameState.winner)}
            <span className="winner-badge">🏆 Winner</span>
          </span>
        </div>
      )}

      {isCreator && !gameState.isActive && (
        <button
          onClick={onCloseGame}
          className="button"
          disabled={loading}
          style={{ marginTop: '1.5rem' }}
        >
          {loading ? <span className="loading"></span> : 'Close Game & Reclaim Rent'}
        </button>
      )}

      {isCreator && gameState.isActive && (
        <div className="message message-info" style={{ marginTop: '1.5rem' }}>
          <strong>Your Game:</strong> Share your wallet address with players so they can guess your secret number!
        </div>
      )}
    </div>
  );
};
