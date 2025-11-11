import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GuessingGame } from "../target/types/guessing_game";
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { expect } from "chai";



describe("guessing_game", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  const walletPublicKey = provider.wallet.publicKey;
  const program = anchor.workspace.guessingGame as Program<GuessingGame>;

  //derive PDA of game_state

  const [gameStatePda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), walletPublicKey.toBuffer()],
    program.programId
  )

  it("Creates a new game with a secret number", async () => {
    // Add your test here.

    const tx = await program.methods.newGame(42).accounts({
      gameState: gameStatePda,        // ← Your derived PDA
      creator: walletPublicKey,       // ← The creator (your wallet)
      systemProgram: SystemProgram.programId,
    } as any).rpc();
    console.log("Your transaction signature", tx);


    // Fetch the account details of the created game state
    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.secretNumber).to.equal(42);
    expect(gameState.attempts).to.equal(0);
    expect(gameState.isActive).to.equal(true);
    expect(gameState.winner).to.be.null;
    expect(gameState.creator.toString()).to.equal(walletPublicKey.toString());
  });

  it("GGuessing the secret number", async () => {

    //generate a different guesser (not the creator)
    const guesser = Keypair.generate();

    // Airdrop some SOL to the guesser for transaction fees
    const transferTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: guesser.publicKey,
        lamports: anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(transferTx);


    // Make a wrong guess
    const tx = await program.methods.makeGuess(30).accounts({
      gameState: gameStatePda,
      guesser: guesser.publicKey,

    } as any).signers([guesser]).rpc();

    console.log("Guess transaction signature", tx);

    // Fetch the updated game state
    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.attempts).to.equal(1);
    expect(gameState.isActive).to.equal(true);
    expect(gameState.winner).to.be.null;


    // Now make the correct guess
    const tx2 = await program.methods.makeGuess(42).accounts({
      gameState: gameStatePda,
      guesser: guesser.publicKey,
    } as any).signers([guesser]).rpc();

    console.log("Correct guess transaction signature", tx2);

    // Fetch the updated game state
    const updatedGameState = await program.account.gameState.fetch(gameStatePda);

    expect(updatedGameState.attempts).to.equal(2);
    expect(updatedGameState.isActive).to.equal(false);
    expect(updatedGameState.winner!.toString()).to.equal(guesser.publicKey.toString());

  });


  it("closing the game", async () => {
    const tx = await program.methods.closeGame().accounts({
      gameState: gameStatePda,
      creator: walletPublicKey,
    } as any).rpc();
    
    console.log("Close game transaction signature", tx);

    //check if account is closed
    const accountInfo = await provider.connection.getAccountInfo(gameStatePda);
    expect(accountInfo).to.be.null;
  });

});