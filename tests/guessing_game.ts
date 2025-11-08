import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GuessingGame } from "../target/types/guessing_game";

describe("guessing_game", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.guessingGame as Program<GuessingGame>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.newGame().rpc();
    console.log("Your transaction signature", tx);
  });
});
