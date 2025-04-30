export const SENDOR_IDL = {
  version: "0.1.0",
  name: "sendor",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "globalState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createLaunch",
      accounts: [
        {
          name: "globalState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "launchMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bondingCurve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: true,
          isSigner: true,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "basePrice",
          type: "u64",
        },
        {
          name: "slope",
          type: "u64",
        },
      ],
    },
    {
      name: "buy",
      accounts: [
        {
          name: "launchMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bondingCurve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "buyerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "sell",
      accounts: [
        {
          name: "launchMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bondingCurve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userRecord",
          isMut: true,
          isSigner: false,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "transfer",
      accounts: [
        {
          name: "launchMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sourceTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destination",
          isMut: false,
          isSigner: false,
        },
        {
          name: "destinationTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userRecord",
          isMut: true,
          isSigner: false,
        },
        {
          name: "source",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "updateGlobal",
      accounts: [
        {
          name: "globalState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "launchMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "setSellWindow",
      accounts: [
        {
          name: "globalState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "launchMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "window1Start",
          type: "i64",
        },
        {
          name: "window2Start",
          type: "i64",
        },
      ],
    },
    {
      name: "migrate",
      accounts: [
        {
          name: "globalState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "launchMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bondingCurve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "adminTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "BondingCurveState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "launchMetadata",
            type: "publicKey",
          },
          {
            name: "basePrice",
            type: "u64",
          },
          {
            name: "slope",
            type: "u64",
          },
          {
            name: "currentSupply",
            type: "u64",
          },
          {
            name: "decimals",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "GlobalState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "launchCount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "LaunchMetadata",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tokenMint",
            type: "publicKey",
          },
          {
            name: "vault",
            type: "publicKey",
          },
          {
            name: "launchId",
            type: "u64",
          },
          {
            name: "currentDay",
            type: "u64",
          },
          {
            name: "window1Start",
            type: "i64",
          },
          {
            name: "window2Start",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "UserRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey",
          },
          {
            name: "lastActionDay",
            type: "u64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "NotInTradingWindow",
      msg: "Trading is not allowed at this time.",
    },
    {
      code: 6001,
      name: "ActionAlreadyPerformed",
      msg: "This wallet has already performed an action in the current cycle.",
    },
    {
      code: 6002,
      name: "ExceedsSellLimit",
      msg: "Sell amount exceeds the daily 10% limit of holdings.",
    },
    {
      code: 6003,
      name: "ExceedsTransferLimit",
      msg: "Transfer amount exceeds the daily 20% limit of holdings.",
    },
    {
      code: 6004,
      name: "InsufficientSupply",
      msg: "Insufficient token supply available for purchase.",
    },
    {
      code: 6005,
      name: "InsufficientFunds",
      msg: "Insufficient funds to complete the purchase.",
    },
    {
      code: 6006,
      name: "InsufficientLiquidity",
      msg: "Insufficient liquidity in pool for the sell amount.",
    },
    {
      code: 6007,
      name: "Unauthorized",
      msg: "Unauthorized access or incorrect signer.",
    },
    {
      code: 6008,
      name: "InvalidWindowTimes",
      msg: "Invalid trading window parameters.",
    },
  ],
}
