// Constants
const TELEGRAM_BOT_TOKEN = BOT_TOKEN;  // Your Telegram Bot Token
const TELEGRAM_CHAT_ID = CHAT_ID;      // Your Telegram Chat ID
const HELIUS_API_KEY = API_KEY;        // Your Helius API Key
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Define wallet labels - simplified version
const WALLET_LABELS = {
  'E4FYNnRGoxRva79HrfxwpPfHUVJWVxrttQ26FwvG11i': { label: '🥼#PAWG', cluster: 'cluster1' },
  'AM84n1LcWWc6KrCXkJ5mfwPFW3RKZqHJHWqz3wKUvYEm': { label: '🥼#ai16z', cluster: 'cluster1' },
  'CGUP4nA5VxqM8eRc4qVnhBHoF9v1diddycap': { label: '🥼#dapJones', cluster: 'cluster1' },
  '4iYkwqgsdamp': { label: '🥼#diddycap', cluster: 'cluster1' },
  '9Ji6GafFPlate': { label: '🥼#damp', cluster: 'cluster1' },
  '6wTVWKQwAl': { label: '🥼#late', cluster: 'cluster1' },
  'Ms5tLZVVkoto': { label: '🥼#wAl', cluster: 'cluster1' },
  'gsbjNUwctnf': { label: '🥼#koto', cluster: 'cluster1' },
  '988CrdL24mono': { label: '🥼#tnf', cluster: 'cluster1' },
  '7zWD593VGFC': { label: '🥼#mono', cluster: 'cluster1' },
  'FDyxm7AqDCG': { label: '🥼#GFC', cluster: 'cluster1' },
  '59oBqs32Vmilady': { label: '🥼#DCG', cluster: 'cluster1' },
  'CmCX9JfuiRetardio': { label: '🥼#milady', cluster: 'cluster1' },
  'GpEUt7Xparadaigm': { label: '🥼#retardio', cluster: 'cluster1' },
  '32hGMSB8girle': { label: '🥼#paradaigm', cluster: 'cluster1' },
  'DmyYENoI': { label: '🥼#girle', cluster: 'cluster1' }
};

// Add filtered wallets if needed
const FILTERED_WALLETS = [];

// Add at the top with other constants
const PROCESSED_TXS = new Set();

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Simplified version of analyzeSwap focusing on Jupiter swaps
function analyzeSwap(tokenTransfers) {
  if (!tokenTransfers || tokenTransfers.length === 0) return {};
  
  const tokenIn = tokenTransfers[0]?.mint;
  const tokenOut = tokenTransfers[1]?.mint;
  const amountIn = tokenTransfers[0]?.tokenAmount;
  const amountOut = tokenTransfers[1]?.tokenAmount;

  return { tokenIn, tokenOut, amountIn, amountOut };
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
async function formatMessage(walletLabel, tokenIn, tokenOut, amountIn, amountOut, tokenMetadata, isBuy) {
  // Get market cap
  const marketCap = await fetchMarketCap(isBuy ? tokenOut : tokenIn);
  
  // Get token metadata
  const metadata = await getTokenMetadata(isBuy ? tokenOut : tokenIn);
  const tokenName = metadata?.name || 'Unknown Token';
  const tokenSymbol = metadata?.symbol?.toLowerCase() || 'unknown';
  
  // Format amounts
  const solAmount = isBuy ? amountIn : amountOut;
  const tokenAmount = isBuy ? amountOut : amountIn;
  
  // Determine token address for display
  const tokenAddress = isBuy ? tokenOut : tokenIn;

  return `
${isBuy ? '🟢DAO BUY' : '🔴DAO SELL'}
${walletLabel} swapped ${isBuy ? 
  `${solAmount} SOL for ${tokenAmount} ${tokenName} (${tokenSymbol})` : 
  `${tokenAmount} ${tokenName} (${tokenSymbol}) for ${solAmount} SOL`}

MC: ${marketCap}

${tokenAddress}`;
}

async function getTokenMetadata(tokenAddress) {
  try {
    const response = await fetch(`${HELIUS_RPC_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getTokenMetadata',
        params: [tokenAddress],
      }),
    });
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
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

// Update the handleRequest function to use the new message format
async function handleRequest(request) {
  if (request.method === 'POST') {
    const requestBody = await request.json();
    const event = requestBody[0];
    
    // Check for both SWAP type and Raydium program IDs
    const isSwap = event?.type === 'SWAP';
    const isRaydiumDirect = event?.instructions?.some(instruction => 
      instruction.programId === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
    );
    const isRaydiumRouted = event?.instructions?.some(instruction => 
      instruction.programId === 'routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS'
    );

    if (isSwap || isRaydiumDirect || isRaydiumRouted) {
      if (PROCESSED_TXS.has(event.signature)) {
        return new Response('Already processed.', { status: 200 });
      }
      PROCESSED_TXS.add(event.signature);

      const { tokenIn, tokenOut, amountIn, amountOut } = analyzeSwap(event.tokenTransfers);
      const walletAddress = event.accountData.find(acc => WALLET_LABELS[acc.account])?.account;
      
      if (walletAddress && WALLET_LABELS[walletAddress]) {
        const isBuy = tokenIn.toLowerCase() === 'So11111111111111111111111111111111111111112'.toLowerCase();
        const message = await formatMessage(
          WALLET_LABELS[walletAddress].label,
          tokenIn,
          tokenOut,
          amountIn,
          amountOut,
          isBuy
        );
        
        await sendToTelegram(message, isBuy ? tokenOut : tokenIn);
      }
    }
  }
  return new Response('OK', { status: 200 });
}