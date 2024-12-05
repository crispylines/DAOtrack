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
  'E4FYNnRGoxRva79HrfxwpPfHUVJWVxrttQ26FwvG11i': { label: '🥼#PAWG', cluster: 'cluster1' },
//  'AM84n1LcWWc6KrCXkJ5mfwPFW3RKZqHJHWqz3wKUvYEm': { label: '🥼#ai16z', cluster: 'cluster1' },
//  'CGUP4nA5VxqM8eRc4qVnhBHoF9v1diddycap': { label: '🥼#dapJones', cluster: 'cluster1' },
//  '4iYkwqgsdamp': { label: '🥼#diddycap', cluster: 'cluster1' },
//  '9Ji6GafFPlate': { label: '🥼#damp', cluster: 'cluster1' },
//  '6wTVWKQwAl': { label: '🥼#late', cluster: 'cluster1' },
//  'Ms5tLZVVkoto': { label: '🥼#wAl', cluster: 'cluster1' },
//  'gsbjNUwctnf': { label: '🥼#koto', cluster: 'cluster1' },
//  '988CrdL24mono': { label: '🥼#tnf', cluster: 'cluster1' },
 // '7zWD593VGFC': { label: '🥼#mono', cluster: 'cluster1' },
 // 'FDyxm7AqDCG': { label: '🥼#GFC', cluster: 'cluster1' },
 // '59oBqs32Vmilady': { label: '🥼#DCG', cluster: 'cluster1' },
 // 'CmCX9JfuiRetardio': { label: '🥼#milady', cluster: 'cluster1' },
 // 'GpEUt7Xparadaigm': { label: '🥼#retardio', cluster: 'cluster1' },
 // '32hGMSB8girle': { label: '🥼#paradaigm', cluster: 'cluster1' },
 // 'DmyYENoI': { label: '🥼#girle', cluster: 'cluster1' }
};

// Add filtered wallets if needed
const FILTERED_WALLETS = [];

// Add at the top with other constants
const PROCESSED_TXS = new Set();

// Add constant for DAOS_FUN program ID
const DAOS_FUN_PROGRAM_ID = '4FqThZWv3QKWkSyXCDmATpWkpEiCHq5yhkdGWpSEDAZM';

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
    const response = await fetch(`https://public-api.solscan.io/token/meta?tokenAddress=${mint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      symbol: data.symbol || getSymbolFromMint(mint),
      name: data.name || 'Unknown Token'
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return {
      symbol: getSymbolFromMint(mint),
      name: 'Unknown Token'
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
      
      // Find the wallet that initiated the swap
      const walletAddress = event.accountData.find(account => 
        account.nativeBalanceChange < 0 && 
        account.account !== event.feePayer
      )?.account;

      if (walletAddress) {
        // Determine if this is a buy (SOL -> Token) or sell (Token -> SOL)
        const isBuy = swapInfo.tokenInSymbol === 'SOL';
        
        const message = `🟢DAO BUY
${swapInfo.tokenOutSymbol} swapped ${swapInfo.amountIn} ${swapInfo.tokenInSymbol} for ${swapInfo.amountOut} ${swapInfo.tokenOutSymbol} (${swapInfo.tokenOutName})

MC: Unknown

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