import type { PublicKey } from "@solana/web3.js"

export type SendorIDL = {
  version: string
  name: string
  instructions: Instruction[]
  accounts: Account[]
  errors: Error[]
  types: Type[]
}

export type BondingCurveState = {
  launchMetadata: PublicKey
  basePrice: bigint
  slope: bigint
  currentSupply: bigint
  decimals: number
}

export type GlobalState = {
  admin: PublicKey
  launchCount: bigint
}

export type LaunchMetadata = {
  tokenMint: PublicKey
  vault: PublicKey
  launchId: bigint
  currentDay: bigint
  window1Start: bigint
  window2Start: bigint
  bump: number
}

export type UserRecord = {
  user: PublicKey
  lastActionDay: bigint
}

export type Instruction = {
  name: string
  accounts: InstructionAccount[]
  args: InstructionArg[]
}

export type InstructionAccount = {
  name: string
  isMut: boolean
  isSigner: boolean
}

export type InstructionArg = {
  name: string
  type: string
}

export type Account = {
  name: string
  type: {
    kind: string
    fields: AccountField[]
  }
}

export type AccountField = {
  name: string
  type: string
}

export type Error = {
  code: number
  name: string
  msg: string
}

export type Type = {
  name: string
  type: {
    kind: string
    fields: TypeField[]
  }
}

export type TypeField = {
  name: string
  type: string
}

export enum SendorErrorCode {
  NotInTradingWindow = 6000,
  ActionAlreadyPerformed = 6001,
  ExceedsSellLimit = 6002,
  ExceedsTransferLimit = 6003,
  InsufficientSupply = 6004,
  InsufficientFunds = 6005,
  InsufficientLiquidity = 6006,
  Unauthorized = 6007,
  InvalidWindowTimes = 6008,
}

export interface SendorError {
  code: number
  name: string
  msg: string
}

export const SENDOR_ERRORS: Record<number, SendorError> = {
  6000: {
    code: 6000,
    name: "NotInTradingWindow",
    msg: "Trading is not allowed at this time.",
  },
  6001: {
    code: 6001,
    name: "ActionAlreadyPerformed",
    msg: "This wallet has already performed an action in the current cycle.",
  },
  6002: {
    code: 6002,
    name: "ExceedsSellLimit",
    msg: "Sell amount exceeds the daily 10% limit of holdings.",
  },
  6003: {
    code: 6003,
    name: "ExceedsTransferLimit",
    msg: "Transfer amount exceeds the daily 20% limit of holdings.",
  },
  6004: {
    code: 6004,
    name: "InsufficientSupply",
    msg: "Insufficient token supply available for purchase.",
  },
  6005: {
    code: 6005,
    name: "InsufficientFunds",
    msg: "Insufficient funds to complete the purchase.",
  },
  6006: {
    code: 6006,
    name: "InsufficientLiquidity",
    msg: "Insufficient liquidity in pool for the sell amount.",
  },
  6007: {
    code: 6007,
    name: "Unauthorized",
    msg: "Unauthorized access or incorrect signer.",
  },
  6008: {
    code: 6008,
    name: "InvalidWindowTimes",
    msg: "Invalid trading window parameters.",
  },
}
