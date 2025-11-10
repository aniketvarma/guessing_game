'use client';

import { FC, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

interface GuessHistoryItem {
  guess: number;
  feedback: 'correct' | 'high' | 'low';
  message: string;
}

interface MakeGuessProps {
  onMakeGuess: (guess: number, creator: PublicKey) => Promise<{ success: boolean; message: string; feedback?: 'correct' | 'high' | 'low' }>;
  loading: boolean;
  gameActive: boolean;
}

export const MakeGuess: FC<MakeGuessProps> = ({ onMakeGuess, loading, gameActive }) => {
  const [guess, setGuess] = useState<string>('');
  const [creatorAddress, setCreatorAddress] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [guessHistory, setGuessHistory] = useState<GuessHistoryItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) {
      setMessage({ type: 'error', text: 'Please enter a number between 1 and 100' });
      return;
    }

    if (!creatorAddress) {
      setMessage({ type: 'error', text: 'Please enter the game creator address' });
      return;
    }

    try {
      const creatorPubkey = new PublicKey(creatorAddress);
      const result = await onMakeGuess(num, creatorPubkey);
      
      setMessage({
        type: result.success ? (result.feedback === 'correct' ? 'success' : 'info') : 'error',
        text: result.message,
      });

      if (result.success && result.feedback) {
        setGuessHistory([
          { guess: num, feedback: result.feedback, message: result.message },
          ...guessHistory,
        ]);
      }

      if (result.success) {
        setGuess('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid creator address' });
    }
  };

  return (
    <div className="card">
      <h2>Make a Guess</h2>
      <form onSubmit={handleSubmit}>
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="creatorAddress">Game Creator Address</label>
          <input
            id="creatorAddress"
            type="text"
            className="input"
            value={creatorAddress}
            onChange={(e) => setCreatorAddress(e.target.value)}
            placeholder="Enter creator's wallet address"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="guess">Your Guess (1-100)</label>
          <input
            id="guess"
            type="number"
            min="1"
            max="100"
            className="input"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
            disabled={loading}
          />
        </div>
        <button type="submit" className="button" disabled={loading || !guess || !creatorAddress}>
          {loading ? <span className="loading"></span> : 'Submit Guess'}
        </button>
      </form>

      {guessHistory.length > 0 && (
        <div className="guess-history">
          <h3 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>Guess History</h3>
          {guessHistory.map((item, idx) => (
            <div key={idx} className={`guess-item guess-${item.feedback}`}>
              <span>Guess: {item.guess}</span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                {item.feedback === 'correct' ? '✓ Correct!' : 
                 item.feedback === 'high' ? '↓ Too High' : '↑ Too Low'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
