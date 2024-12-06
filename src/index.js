// Constants
//-1002368630513 The Lab
//-1002370104136 testing area
//wrangler tail solana-tracker-worker //for logging
//git push //npm run deploy

const TELEGRAM_BOT_TOKEN = BOT_TOKEN;  // Your Telegram Bot Token
const TELEGRAM_CHAT_ID = CHAT_ID;      // Your Telegram Chat ID
const HELIUS_API_KEY = API_KEY;        // Your Helius API Key
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Define wallet labels - simplified version
const WALLET_LABELS = {
  'E4FYNnRGoxRva79HrfxwpPfHUVJWVxrttQ26FwvG11i': '#PAWG',
  'AM84n1LLcxHXnvkDpEWM6DgozwZPVhfL3qhvwGf3fGPK': '#ai16z',
  'ChUZjgoZoZ86WucToFmnjA3UuQYpd43sygf9CvUtNsct': '#daojones',
  '9qNCRKR7H3W3jy4vftdBQpVvVX72unpKBkSU1NUMTapm': '#diddycap',
  '9J1GGafFPwSw4JnVVmR6tGFXNKwNhrJhYRJMqpqA9VfP': '#damp',
  '6wTVWXQDDkHJUMRRwKJfxmXg2PLuqdeK5qN9RJKwzEu3': '#late',
  'MsStLL7V8Q1dEPrFGbw6KBZd9GaE9CJCqwGwzwRZrxwR': '#wAI',
  'gsbNUwCLmWQFgVBmvXJKX1SjVYVE7Y9FkcVw7VYXmVwC': '#koto',
  '988CrdL24Gy4pxWwfBzYTVE9TQPvf1kqtXGGm4cLGxwk': '#inf',
  '7zWD593WXZEqwZKcBVZhUWEr6XgmYEZUxcwYEZrVE7Ao': '#mono',
  'FDyxm7Aq6cmXQX8oKmJcySUVguGtSddceZnJyriw7qVc': '#GFC',
  '59oBqsS2WXZEqwZKcBVZhUWEr6XgmYEZUxcwYEZrVE7A': '#DCG',
  'CmCX9JfuLFwZVE9pxWwfBzYTVE9TQPvf1kqtXGGm4cLG': '#milady',
  'GrgCuU7XWXZEqwZKcBVZhUWEr6XgmYEZUxcwYEZrVE7A': '#retardio',
  '32hGMS8S2WXZEqwZKcBVZhUWEr6XgmYEZUxcwYEZrVE7': '#paradigm',
  'DmyYENoLFwZVE9pxWwfBzYTVE9TQPvf1kqtXGGm4cLGx': '#girle'
  // Add other wallet labels as needed
};

// Add filtered wallets if needed
const FILTERED_WALLETS = [];

// Add at the top with other constants
const PROCESSED_TXS = new Set();

// Add constant for DAOS_FUN program ID
const DAOS_FUN_PROGRAM_ID = '4FqThZWv3QKWkSyXCDmATpWkpEiCHq5yhkdGWpSEDAZM';

import { KNOWN_TOKENS } from './tokenList.js';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Add these constants at the top with the other constants
const HARDCODED_TOKENS = {
  'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC': {
    symbol: 'ai16z',
    name: 'ai16z'
  },
  'EqsBaDzag9bB9Tkck8kBXtQj4DdXTSr7S5V3aH3nVfZr': {
    symbol: 'PAWG',
    name: 'Private Asset Wealth Group'
  },
  '991tCxvXrVMXt6YHhKcNiNyR6hmPW4iQBe7exBeuEJQA': {
    symbol: 'daojones',
    name: 'DAO Jones'
  },
  '2ToWKrXBvpvhvk6K4LHNHh4KhKqUWKjNVPJ9ixv6dJRk': {
    symbol: 'diddycap',
    name: 'Diddy Capital'
  },
  '4FHsJkJJRk8WzTVZUWh4GnAVrHbJ8KXh6RNmxZCKKFAq': {
    symbol: 'damp',
    name: 'DAMP Protocol'
  },
  '78E2W1CcWjqLWXszrPJ6uFyg7NCZEqVAJTfB85CNZR9m': {
    symbol: 'late',
    name: 'Late Capital'
  },
  'BgBYApuddHLsqkGZpyHmvNqmXhGqrz6p9mSxsaQNJBvN': {
    symbol: 'wAI',
    name: 'wAI Combinator'
  },
  '6PZqzXGZQQRUwXCvKKEJ9VqYNK9YUPkBxKE9YJTewHxU': {
    symbol: 'KOTO',
    name: 'KOTOPIA'
  },
  'Df41efRpYgLe9YQeGDDwHKJJ4UhePWMEZS3bwWkRdZvk': {
    symbol: 'inf',
    name: 'Inferno'
  },
  'EqYnLeJgWUZ7U4C4uF481eAe2PkcyoqxDVFEMYL282Ux': {
    symbol: 'mono',
    name: 'Monopoly'
  },
  '55PCCXa6oRk6wHxVQpojWfBvQj8nMwLMX9EkYACZb6q7': {
    symbol: 'GFC',
    name: 'George Fund Capital'
  },
  'Ca5pGwrrwtUgBMDe4sL3UxgqG9GsUwXCRWm1UsYJKnZk': {
    symbol: 'milady',
    name: 'Milady'
  },
  'CC4aRC4wiw4UfRBmUZZo9jqHiKnUZbL5bWwMHHHqnpFw': {
    symbol: 'retardio',
    name: 'Retardio'
  },
  '5RWMzxESpvJTf1TGxUJqy5LHhqzjjUjZwEEWkegTiJSF': {
    symbol: 'paradigm',
    name: 'Paradigm'
  },
  'DmyYENoLFwZVE9pxWwfBzYTVE9TQPvf1kqtXGGm4cLGx': {
    symbol: 'girle',
    name: 'girl econo'
  }
};

// Add this constant at the top with other constants
const METADATA_API_URL = "https://token-metadata.solana-labs.vercel.app/api/metadata";

// Update KNOWN_TOKENS to include the Degen Spartan AI token
const KNOWN_TOKENS = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'SOL'
  },
  'Gu3LDkn7Vx3bmCzLafYNKcDxv2mH7YN44NJZFXnypump': {
    symbol: 'degenai',
    name: 'Degen Spartan AI'
  }
  // ... other known tokens ...
};

// Add Jupiter API endpoint
const JUPITER_API_URL = "https://token.jup.ag/all";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Simplified version of analyzeSwap focusing on Jupiter swaps
async function analyzeSwap(tokenTransfers) {
  if (!tokenTransfers || tokenTransfers.length < 2) return {};
  
  const tokenIn = tokenTransfers[0];
  const tokenOut = tokenTransfers[1];
  
  // Fetch metadata for both tokens
  const [inMetadata, outMetadata] = await Promise.all([
    getTokenMetadata(null, tokenIn.mint),
    getTokenMetadata(null, tokenOut.mint)
  ]);

  return {
    tokenIn: tokenIn.mint,
    tokenOut: tokenOut.mint,
    amountIn: tokenIn.tokenAmount,
    amountOut: tokenOut.tokenAmount,
    tokenInSymbol: inMetadata.symbol,
    tokenOutSymbol: outMetadata.symbol,
    tokenInName: inMetadata.name,
    tokenOutName: outMetadata.name
  };
}

// Simplified message format
async function sendToTelegram(message, tokenAddress) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "🔍Trojan",
          url: `https://t.me/hector_trojanbot?start=d-raybot-${tokenAddress}`
        },
        {
          text: "🧪BullX",
          url: `https://bullx.io/terminal?chainId=1399811149&address=${tokenAddress}`
        }
      ]
    ]
  };

  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(inlineKeyboard)
    }),
  });

  if (!response.ok) {
    console.error('Failed to send message to Telegram:', await response.json());
  }
}

// Add this function to format the message
async function formatMessage(swapInfo, marketCap) {
  return `🟢DAO BUY
${swapInfo.tokenOutSymbol} swapped ${swapInfo.amountIn} ${swapInfo.tokenInSymbol} for ${swapInfo.amountOut} ${swapInfo.tokenOutSymbol} (${swapInfo.tokenOutName})

MC: ${marketCap}

${swapInfo.tokenOut}`;
}

async function getTokenMetadata(connection, mint) {
  try {
    // First check KNOWN_TOKENS for daos.fun tokens
    if (KNOWN_TOKENS[mint]) {
      return {
        symbol: KNOWN_TOKENS[mint].symbol,
        name: KNOWN_TOKENS[mint].name,
        marketCap: 'Unknown'
      };
    }

    // For other tokens, try Jupiter API first
    const response = await fetch(JUPITER_API_URL);
    if (response.ok) {
      const tokens = await response.json();
      const tokenInfo = tokens.find(t => t.address === mint);
      if (tokenInfo) {
        return {
          symbol: tokenInfo.symbol.toLowerCase(),
          name: tokenInfo.name,
          marketCap: 'Unknown'
        };
      }
    }

    // If Jupiter API fails, try Solana token metadata API as fallback
    const metadataResponse = await fetch(`${METADATA_API_URL}/${mint}`);
    if (metadataResponse.ok) {
      const metadata = await metadataResponse.json();
      return metadata;
    }

    // Last resort fallback for SOL
    if (mint === SOL_MINT) {
      return {
        symbol: 'SOL',
        name: 'SOL',
        marketCap: 'Unknown'
      };
    }

    throw new Error('Token metadata not found');
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    
    // Default fallback
    return {
      symbol: 'Unknown',
      name: 'Unknown Token',
      marketCap: 'Unknown'
    };
  }
}

function getSymbolFromMint(mint) {
  if (mint === 'So11111111111111111111111111111111111111112') {
    return 'SOL';
  }
  return 'Unknown';
}

async function fetchMarketCap(tokenAddress) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const data = await response.json();
    
    if (data.pairs && data.pairs[0]) {
      const mcap = data.pairs[0].fdv;
      if (mcap) {
        // Format market cap
        if (mcap >= 1000000) {
          return `${(mcap / 1000000).toFixed(0)}k`;
        } else {
          return `${(mcap / 1000).toFixed(0)}k`;
        }
      }
    }
    return 'Unknown';
  } catch (error) {
    console.error('Error fetching market cap:', error);
    return 'Unknown';
  }
}

// Update the handleRequest function to properly detect Jupiter swaps
async function handleRequest(request) {
  if (request.method === 'POST') {
    const requestBody = await request.json();
    console.log('Received POST request with body:', JSON.stringify(requestBody, null, 2));

    const event = requestBody[0];
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Check for Jupiter or daos.fun swaps
    const isJupiterSwap = event?.source === 'JUPITER' && event?.tokenTransfers?.length >= 2;
    const isDaosFunSwap = event?.instructions?.some(ix => 
      ix.programId === DAOS_FUN_PROGRAM_ID
    ) && event?.tokenTransfers?.length >= 2;
    
    console.log('Transaction type checks:', { isJupiterSwap, isDaosFunSwap, tokenTransfers: event?.tokenTransfers?.length });

    if (isJupiterSwap || isDaosFunSwap) {
      const { tokenTransfers } = event;
      const swapInfo = await analyzeSwap(tokenTransfers);
      
      // Find the wallet that initiated the swap - look for the account with negative SOL balance change
      const walletAddress = event.accountData.find(account => 
        account.nativeBalanceChange < -5000 && // Changed from just negative to -5000 to exclude fee payer
        !account.tokenBalanceChanges.some(change => change.mint === SOL_MINT) // Exclude wrapped SOL accounts
      )?.account;

      if (walletAddress) {
        // Determine if this is a buy (SOL -> Token) or sell (Token -> SOL)
        const isBuy = swapInfo.tokenInSymbol === 'SOL';
        
        const message = `🟢DAO BUY
${WALLET_LABELS[walletAddress] || 'Unknown'} swapped ${swapInfo.amountIn} ${swapInfo.tokenInSymbol} for ${swapInfo.amountOut} ${swapInfo.tokenOutSymbol} (${swapInfo.tokenOutName})

MC: ${swapInfo.marketCap || 'Unknown'}

${swapInfo.tokenOut}`;
        
        await sendToTelegram(message, isBuy ? swapInfo.tokenOut : swapInfo.tokenIn);
      } else {
        console.log('No matching wallet label found');
      }
    } else {
      console.log('Not a Jupiter or daos.fun swap');
    }
  }
  return new Response('OK', { status: 200 });
}