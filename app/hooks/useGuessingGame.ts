'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { useCallback, useEffect, useState } from 'react';
import idl from '../../target/idl/guessing_game.json';

const PROGRAM_ID = new PublicKey('CgmYL5KARiCGFXP1bpWh8xuX9B2anwoW3Ygj4GTScRud');

interface GameState {
  secretNumber: number;
  attempts: number;
  creator: PublicKey;
  isActive: boolean;
  winner: PublicKey | null;
  bump: number;
}

interface GuessResult {
  success: boolean;
  message: string;
  feedback?: 'correct' | 'high' | 'low';
}

export const useGuessingGame = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProvider = useCallback(() => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    return new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
  }, [connection, wallet]);

  const getProgram = useCallback(() => {
    const provider = getProvider();
    return new Program(idl as any, provider);
  }, [getProvider]);

  const getGamePDA = useCallback((creator: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('game'), creator.toBuffer()],
      PROGRAM_ID
    );
  }, []);

  const fetchGameState = useCallback(async (creator?: PublicKey) => {
    try {
      const creatorKey = creator || wallet.publicKey;
      if (!creatorKey) return;

      const program = getProgram();
      const [gameStatePda] = getGamePDA(creatorKey);

      const accountInfo = await connection.getAccountInfo(gameStatePda);
      if (!accountInfo) {
        setGameState(null);
        return;
      }

      const gameStateData: any = await (program.account as any).gameState.fetch(gameStatePda);
      setGameState({
        secretNumber: gameStateData.secretNumber as number,
        attempts: gameStateData.attempts as number,
        creator: gameStateData.creator as PublicKey,
        isActive: gameStateData.isActive as boolean,
        winner: gameStateData.winner as PublicKey | null,
        bump: gameStateData.bump as number,
      });
    } catch (err: any) {
      console.error('Error fetching game state:', err);
      setGameState(null);
    }
  }, [connection, wallet.publicKey, getProgram, getGamePDA]);

  const createGame = useCallback(async (secretNumber: number) => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const program = getProgram();
      const [gameStatePda] = getGamePDA(wallet.publicKey);

      await program.methods
        .newGame(secretNumber)
        .accounts({
          gameState: gameStatePda,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();

      await fetchGameState();
      return { success: true, message: 'Game created successfully!' };
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to create game';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, getProgram, getGamePDA, fetchGameState]);

  const makeGuess = useCallback(async (guess: number, gameCreator: PublicKey): Promise<GuessResult> => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const program = getProgram();
      const [gameStatePda] = getGamePDA(gameCreator);

      const tx = await program.methods
        .makeGuess(guess)
        .accounts({
          gameState: gameStatePda,
          guesser: wallet.publicKey,
        } as any)
        .rpc();

      // Fetch updated state
      await fetchGameState(gameCreator);

      // Parse transaction logs to determine feedback
      const txDetails = await connection.getTransaction(tx, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      let feedback: 'correct' | 'high' | 'low' = 'low';
      let message = 'Guess submitted';

      if (txDetails?.meta?.logMessages) {
        const logs = txDetails.meta.logMessages.join(' ');
        if (logs.includes('guessed the correct number')) {
          feedback = 'correct';
          message = `Correct! You guessed the number!`;
        } else if (logs.includes('too high')) {
          feedback = 'high';
          message = `Too high! Try a lower number.`;
        } else if (logs.includes('too low')) {
          feedback = 'low';
          message = `Too low! Try a higher number.`;
        }
      }

      return { success: true, message, feedback };
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to make guess';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, connection, getProgram, getGamePDA, fetchGameState]);

  const closeGame = useCallback(async () => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const program = getProgram();
      const [gameStatePda] = getGamePDA(wallet.publicKey);

      await program.methods
        .closeGame()
        .accounts({
          gameState: gameStatePda,
          creator: wallet.publicKey,
        } as any)
        .rpc();

      setGameState(null);
      return { success: true, message: 'Game closed successfully!' };
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to close game';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, getProgram, getGamePDA]);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchGameState();
    }
  }, [wallet.publicKey, fetchGameState]);

  return {
    gameState,
    loading,
    error,
    createGame,
    makeGuess,
    closeGame,
    fetchGameState,
  };
};
