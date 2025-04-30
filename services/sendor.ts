// services/sendor.ts

import { type Connection, PublicKey, SystemProgram, type Keypair } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token"
import * as anchor from "@project-serum/anchor"
import { BN } from "@project-serum/anchor"
import { SENDOR_IDL } from "@/idl/sendor" // Your Anchor IDL JSON
import { TOKEN_DECIMALS } from "@/constants/sendor"

// Use environment variable for program ID
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SENDOR_PROGRAM_ID || "6mqsEaGREVXfAroU9WErmEPqYmKoFpoMHuFHzvBBGgna",
)

// PDA seed buffers
const GLOBAL_SEED = Buffer.from("global")
const LAUNCH_SEED = Buffer.from("launch")
const BONDING_SEED = Buffer.from("bonding")

export class SendorService {
  public program: anchor.Program
  private wallet: anchor.Wallet
  private connection: Connection

  constructor(connection: Connection, wallet: anchor.Wallet) {
    this.connection = connection
    this.wallet = wallet
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    })
    anchor.setProvider(provider)
    this.program = new anchor.Program(SENDOR_IDL as anchor.Idl, PROGRAM_ID, provider)
  }

  // PDA helpers
  findGlobalStatePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([GLOBAL_SEED], PROGRAM_ID)
  }

  findLaunchMetadataPDA(launchId: number): [PublicKey, number] {
    const buf = new BN(launchId).toArrayLike(Buffer, "le", 8)
    return PublicKey.findProgramAddressSync([LAUNCH_SEED, buf], PROGRAM_ID)
  }

  findBondingCurvePDA(launchId: number): [PublicKey, number] {
    const buf = new BN(launchId).toArrayLike(Buffer, "le", 8)
    return PublicKey.findProgramAddressSync([BONDING_SEED, buf], PROGRAM_ID)
  }

  // Initialize global state (admin-only). Call once.
  async initializeGlobalState(): Promise<string> {
    const [globalState] = this.findGlobalStatePDA()
    const tx = await this.program.methods
      .initialize()
      .accounts({
        globalState,
        admin: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
    return tx
  }

  // Create a new launch – must pass the full Keypair so it can sign the mint account
  async createLaunch(tokenMintKeypair: Keypair, basePrice: number, slope: number): Promise<string> {
    // Ensure global state exists (you can also call initializeGlobalState separately)
    const [globalState] = this.findGlobalStatePDA()
    let launchCount: number
    try {
      const gs = await this.program.account.globalState.fetch(globalState)
      launchCount = (gs.launchCount as BN).toNumber()
    } catch {
      // auto-init if missing
      await this.initializeGlobalState()
      const gs2 = await this.program.account.globalState.fetch(globalState)
      launchCount = (gs2.launchCount as BN).toNumber()
    }

    // PDAs for this launch
    const [launchMetadata] = this.findLaunchMetadataPDA(launchCount)
    const [bondingCurve] = this.findBondingCurvePDA(launchCount)

    // Vault ATA: owner = launchMetadata PDA
    const vault = await getAssociatedTokenAddress(
      tokenMintKeypair.publicKey,
      launchMetadata,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )

    // Call Anchor
    const tx = await this.program.methods
      .createLaunch(new BN(basePrice), new BN(slope))
      .accounts({
        globalState,
        launchMetadata,
        bondingCurve,
        tokenMint: tokenMintKeypair.publicKey,
        vault,
        admin: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([tokenMintKeypair]) // <-- include the mint Keypair here
      .rpc()

    return tx
  }

  // Buy from an existing launch
  async buy(
    launchMetadata: PublicKey,
    bondingCurve: PublicKey,
    tokenMint: PublicKey,
    amountTokens: number,
  ): Promise<string> {
    // Convert token amount to base units (lamports)
    // This is the critical fix - we need to convert the token amount to base units
    const amountBaseUnits = new BN(Math.floor(amountTokens * 10 ** TOKEN_DECIMALS))
    console.log(`Buying ${amountTokens} tokens (${amountBaseUnits.toString()} base units)`)

    const vault = await getAssociatedTokenAddress(
      tokenMint,
      launchMetadata,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )
    const buyerTokenAccount = await getAssociatedTokenAddress(tokenMint, this.wallet.publicKey)

    const tx = await this.program.methods
      .buy(amountBaseUnits)
      .accounts({
        launchMetadata,
        bondingCurve,
        tokenMint,
        vault,
        buyer: this.wallet.publicKey,
        buyerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc()

    return tx
  }

  // Sell tokens back to the launch
  async sell(
    launchMetadata: PublicKey,
    bondingCurve: PublicKey,
    tokenMint: PublicKey,
    amountTokens: number,
  ): Promise<string> {
    // Convert token amount to base units
    const amountBaseUnits = new BN(Math.floor(amountTokens * 10 ** TOKEN_DECIMALS))
    console.log(`Selling ${amountTokens} tokens (${amountBaseUnits.toString()} base units)`)

    const vault = await getAssociatedTokenAddress(
      tokenMint,
      launchMetadata,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )
    const sellerTokenAccount = await getAssociatedTokenAddress(tokenMint, this.wallet.publicKey)

    // Find user record PDA
    const userRecordSeed = Buffer.from("user_record")
    const [userRecord] = PublicKey.findProgramAddressSync(
      [userRecordSeed, launchMetadata.toBuffer(), this.wallet.publicKey.toBuffer()],
      PROGRAM_ID,
    )

    const tx = await this.program.methods
      .sell(amountBaseUnits)
      .accounts({
        launchMetadata,
        bondingCurve,
        vault,
        tokenMint,
        userTokenAccount: sellerTokenAccount,
        userRecord,
        seller: this.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc()

    return tx
  }
}
