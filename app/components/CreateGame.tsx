'use client';

import { FC, useState } from 'react';

interface CreateGameProps {
  onCreateGame: (secretNumber: number) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

export const CreateGame: FC<CreateGameProps> = ({ onCreateGame, loading }) => {
  const [secretNumber, setSecretNumber] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const num = parseInt(secretNumber);
    if (isNaN(num) || num < 1 || num > 100) {
      setMessage({ type: 'error', text: 'Please enter a number between 1 and 100' });
      return;
    }

    const result = await onCreateGame(num);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      setSecretNumber('');
    }
  };

  return (
    <div className="card">
      <h2>Create New Game</h2>
      <form onSubmit={handleSubmit}>
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="secretNumber">Secret Number (1-100)</label>
          <input
            id="secretNumber"
            type="number"
            min="1"
            max="100"
            className="input"
            value={secretNumber}
            onChange={(e) => setSecretNumber((e.target as HTMLInputElement).value)}
            placeholder="Enter a number between 1 and 100"
            disabled={loading}
          />
        </div>
        <button type="submit" className="button" disabled={loading || !secretNumber}>
          {loading ? <span className="loading"></span> : 'Create Game'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
        <strong>Note:</strong> Only one game per wallet can be active. Other players can guess your secret number!
      </div>
    </div>
  );
};
