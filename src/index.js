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
          text: "🔍 Solscan",
          url: `https://solscan.io/token/${tokenAddress}`
        },
        {
          text: "📊 Birdeye",
          url: `https://birdeye.so/token/${tokenAddress}`
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