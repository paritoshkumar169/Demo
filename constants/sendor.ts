// Constants from the Solana program
export const TOKEN_DECIMALS = 9
export const INITIAL_SUPPLY_TOKENS = 1_000_000_000
export const INITIAL_SUPPLY_BASE_UNITS = INITIAL_SUPPLY_TOKENS * 1_000_000_000 // 1e9 * 1e9 = 1e18 base units

export const SELL_LIMIT_PERCENT = 10 // 10% sell limit per day
export const TRANSFER_LIMIT_PERCENT = 20 // 20% transfer limit per day

export const WINDOW_DURATION = 15 * 60 // 15 minutes window duration (in seconds)
export const HALF_DAY = 12 * 60 * 60 // 12 hours in seconds (half-day interval)

// Default values for token creation
export const DEFAULT_BASE_PRICE = 0.001 // 0.001 SOL
export const DEFAULT_SLOPE = 0.0001 // 0.0001 SOL
