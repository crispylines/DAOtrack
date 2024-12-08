// Constants
//-1002368630513 The Lab
//-1002370104136 testing area
//wrangler tail solana-tracker-worker //for logging
//git push //npm run deploy
// Constants
const TELEGRAM_BOT_TOKEN = BOT_TOKEN;
const TELEGRAM_CHAT_ID = CHAT_ID;
const HELIUS_API_KEY = API_KEY;
const HELIUS_RPC_URL = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;
const HELIUS_WEBHOOK_URL = `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`;
const DAOS_FUN_PROGRAM_ID = '4FqThZWv3QKWkSyXCDmATpWkpEiCHq5yhkdGWpSEDAZM';
const JUPITER_PROGRAM_ID = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';  // Jupiter v6
const DEX_SCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens/';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Wallet Labels and Known Tokens
import { WALLET_LABELS, KNOWN_TOKENS } from './tokenList.js';

const ALLOWED_ORIGINS = [
  'https://your-frontend-domain.com',
  'https://daotrack-worker.qrimeth.workers.dev',
  // Add other allowed domains here
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});


async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders(request),
    });
  }

  if (request.method === 'POST') {
    try {
      const transactions = await request.json();
      console.log(
        'Received POST request with body:',
        JSON.stringify(transactions, null, 2),
      );

      for (const transaction of transactions) {
        await processTransaction(transaction);
      }
      
      return new Response('Success', { 
        status: 200,
        headers: corsHeaders(request)
      });
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response('Error processing request', { 
        status: 500,
        headers: corsHeaders(request)
      });
    }
  } else if (request.method === 'GET') {
    const url = new URL(request.url);
    
    if (url.pathname === '/') {
      const transactions = await TOKEN_BUYS_10.get('recent_transactions');
      const headers = {
        'Content-Type': 'text/html',
        ...corsHeaders(request)
      };
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>DAO Tracker</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .transaction { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
            </style>
            <script>
              // Auto-refresh every 30 seconds
              setInterval(() => {
                window.location.reload();
              }, 30000);
            </script>
          </head>
          <body>
            <h1>Recent DAO Transactions</h1>
            <p>Page auto-refreshes every 30 seconds</p>
            <div id="transactions">
              ${JSON.parse(transactions || '[]')
                .map(tx => `
                  <div class="transaction">
                    <p><strong>${tx.walletLabel}</strong> ${tx.isBuy ? 'bought' : 'sold'}</p>
                    <p>${tx.tokenOut.amount} ${tx.tokenOut.symbol} ${tx.isBuy ? 'with' : 'for'} ${tx.tokenIn.amount} ${tx.tokenIn.symbol}</p>
                    <p>Market Cap: ${tx.marketCap}</p>
                    <p>Time: ${new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                `).join('')}
            </div>
          </body>
        </html>
      `;
      
      return new Response(html, { headers });
    }
    
    if (url.pathname === '/api/transactions') {
      const transactions = await TOKEN_BUYS_10.get('recent_transactions');
      return new Response(transactions || '[]', { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(request)
        }
      });
    }
    
    // Existing webhook setup handling
    if (url.pathname === '/webhook-setup') {
      const response = await setupWebhook();
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...response.headers,
          ...corsHeaders(request)
        }
      });
    }
  }

  return Response.redirect(new URL('/', request.url), 302);
}

async function processTransaction(transaction) {
  try {
    const { accountData, signature } = transaction;

    const involvedWallet = accountData.find((account) =>
      WALLET_LABELS.hasOwnProperty(account.account),
    );
    if (!involvedWallet) {
      console.log(
        `Transaction ${signature} does not involve tracked wallets.`,
      );
      return;
    }

    const walletAddress = involvedWallet.account;

    const analysisResult = await analyzeTransaction(transaction, walletAddress);
    if (!analysisResult) {
        console.log(`Transaction ${transaction.signature} is not a relevant buy/sell.`);
        return;
    }

    const { isBuy, tokenIn, tokenOut, amountIn, amountOut } = analysisResult;

    // Fetch metadata and market cap concurrently
    const [tokenInMetadata, tokenOutMetadata, marketCap] = await Promise.all([
      getTokenMetadata(tokenIn),
      getTokenMetadata(tokenOut),
      fetchMarketCap(isBuy ? tokenOut : tokenIn),
    ]);

    const message = formatMessage({
  isBuy,
  walletLabel: WALLET_LABELS[walletAddress],
  tokenInSymbol: tokenInMetadata.symbol,
  tokenOutSymbol: tokenOutMetadata.symbol,
  amountIn,
  amountOut,
  tokenInName: tokenInMetadata.name,
  tokenOutName: tokenOutMetadata.name,
  marketCap,
  tokenAddress: isBuy ? tokenOut : tokenIn,  // This line is correct, but let's verify tokenIn/tokenOut are set correctly
});

    const transactionData = {
      timestamp: Date.now(),
      signature: transaction.signature,
      isBuy,
      walletLabel: WALLET_LABELS[walletAddress],
      tokenIn: {
        symbol: tokenInMetadata.symbol,
        name: tokenInMetadata.name,
        amount: amountIn,
        address: tokenIn
      },
      tokenOut: {
        symbol: tokenOutMetadata.symbol,
        name: tokenOutMetadata.name,
        amount: amountOut,
        address: tokenOut
      },
      marketCap
    };

    // Store in KV (keep last 100 transactions)
    await storeTransaction(transactionData);

    // Existing telegram send
    await sendToTelegram(message, isBuy ? tokenOut : tokenIn);
  } catch (error) {
    console.error('Error processing transaction:', error);
    // Optionally: Send an error message to Telegram
    await sendToTelegram(`Error processing transaction: ${error}`);
  }
}

async function analyzeTransaction(transaction, walletAddress) {
  const { instructions, tokenTransfers, signature } = transaction;

  if (instructions.some(ix => ix.programId === DAOS_FUN_PROGRAM_ID)) {
      console.log(`Transaction ${signature} is a daos.fun interaction.`);
      return analyzeDaosFunTransaction(tokenTransfers, walletAddress, signature);
  } else if (instructions.some(ix => ix.programId === JUPITER_PROGRAM_ID) ) { // Check for Jupiter
      console.log(`Transaction ${signature} is a Jupiter interaction.`);
      return analyzeJupiterTransaction(tokenTransfers, walletAddress, signature);
  } else {
      console.log(`Transaction ${signature} is NOT a daos.fun or Jupiter interaction.`);
      return analyzeNonDaosFunTransaction(tokenTransfers, walletAddress, signature)
  }
}

function analyzeJupiterTransaction(tokenTransfers, walletAddress, signature) {
  if (tokenTransfers.length < 2) {
      console.log(`Jupiter Transaction ${signature} has fewer than 2 token transfers; skipping.`);
      return null;
  }

  // Find SOL transfer (Jupiter uses wrapped SOL)
  const solTransfer = tokenTransfers.find(transfer => transfer.mint === SOL_MINT);

  if (!solTransfer) {
      console.log(`No SOL transfer found in Jupiter transaction ${signature}.`);
      return null;
  }

  const isBuy = solTransfer.fromUserAccount === walletAddress;

  const amountIn = solTransfer.tokenAmount;
  const tokenIn = solTransfer.mint;



  const otherTokenTransfer = tokenTransfers.find(
      (transfer) => KNOWN_TOKENS.hasOwnProperty(transfer.mint) && transfer.mint !== SOL_MINT
  );

  if (!otherTokenTransfer) {
      console.log(`No other known token transfer found in Jupiter transaction ${signature}.`);
      return null;
  }

  const amountOut = otherTokenTransfer.tokenAmount;
  const tokenOut = otherTokenTransfer.mint;

  return { isBuy, tokenIn, tokenOut, amountIn, amountOut };
}

function analyzeDaosFunTransaction(tokenTransfers, walletAddress, signature) {
  if (tokenTransfers.length < 2) {
    console.log(
      `Transaction ${signature} has fewer than 2 token transfers; skipping.`,
    );
    return null;
  }

  // 1. Determine SOL change (Buy/Sell based on SOL decrease/increase)
  const solTransfer = tokenTransfers.find((t) => t.mint === SOL_MINT);

  if (!solTransfer || !solTransfer.fromUserAccount || !solTransfer.toUserAccount) {
      console.log(`No or incomplete SOL transfer found for ${signature}; skipping`);
      return null;
  }
  const isBuy = solTransfer.fromUserAccount === walletAddress;

  // 2. Find the token transfer (excluding SOL)
  const tokenTransfer = tokenTransfers.find(
    (t) => t.mint !== SOL_MINT && 
    (t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress)
  );

  if (!tokenTransfer) {
    console.log(`[daos.fun] No token transfer found in ${signature}. Skipping.`);
    return null;
  }

  const tokenOut = tokenTransfer.mint;
  const amountOut = tokenTransfer.tokenAmount;

  // 3. Use SOL as tokenIn
  const tokenIn = solTransfer.mint;
  const amountIn = solTransfer.tokenAmount;

  if (isBuy && tokenTransfer.toUserAccount !== walletAddress) {
    console.warn(`[daos.fun BUY] Unexpected token recipient for ${signature}.`);
    return null;
  } else if (!isBuy && tokenTransfer.fromUserAccount !== walletAddress) {
    console.warn(`[daos.fun SELL] Unexpected token sender for ${signature}.`);
    return null;
  }

  return { isBuy, tokenIn, tokenOut, amountIn, amountOut };
}

function analyzeNonDaosFunTransaction(tokenTransfers, walletAddress, signature) {
  if (tokenTransfers.length < 2) {
    console.log(
      `Transaction ${signature} has fewer than 2 token transfers; skipping.`,
    );
    return null;
  }

  // Iterate through transfers to find potential buys/sells
  for (let i = 0; i < tokenTransfers.length; i++) {
    const transfer1 = tokenTransfers[i];

    // Possible SELL (token leaving the wallet)
    if (
      transfer1.fromUserAccount === walletAddress &&
      transfer1.tokenAmount > 0
    ) {
      for (let j = 0; j < tokenTransfers.length; j++) {
        if (i === j) continue; // Skip comparison with itself
        const transfer2 = tokenTransfers[j];

        // Corresponding BUY (token entering the wallet)
        if (
          transfer2.toUserAccount === walletAddress &&
          transfer2.tokenAmount > 0
        ) {
          return {
            isBuy: false,
            tokenIn: transfer1.mint,
            tokenOut: transfer2.mint,
            amountIn: transfer1.tokenAmount,
            amountOut: transfer2.tokenAmount,
          };
        }
      }
    }

    // Possible BUY (token entering the wallet)
    if (
      transfer1.toUserAccount === walletAddress &&
      transfer1.tokenAmount > 0
    ) {
      for (let j = 0; j < tokenTransfers.length; j++) {
        if (i === j) continue;
        const transfer2 = tokenTransfers[j];

        // Corresponding SELL (token leaving the wallet)
        if (
          transfer2.fromUserAccount === walletAddress &&
          transfer2.tokenAmount > 0
        ) {
          return {
            isBuy: true,
            tokenIn: transfer2.mint,
            tokenOut: transfer1.mint,
            amountIn: transfer2.tokenAmount,
            amountOut: transfer1.tokenAmount,
          };
        }
      }
    }
  }

  console.log(
    `Transaction ${signature} is not a tracked buy or sell (non-daos.fun).`,
  );
  return null;
}

async function getTokenMetadata(mint) {
  try {
    // First check KNOWN_TOKENS
    if (KNOWN_TOKENS[mint]) {
      return KNOWN_TOKENS[mint];
    }

    // If not in KNOWN_TOKENS, try DexScreener
    const response = await fetch(`${DEX_SCREENER_API}${mint}`);
    if (response.ok) {
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        const tokenInfo = data.pairs[0];
        return {
          symbol: tokenInfo.baseToken.symbol,
          name: tokenInfo.baseToken.name,
        };
      }
    }

    // If DexScreener fails or token not found, default to shortened mint
    return {
      symbol: mint.substring(0, 8),
      name: mint,
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return { symbol: mint.substring(0, 8), name: mint };
  }
}

async function fetchMarketCap(tokenAddress) {
  try {
    const response = await fetch(`${DEX_SCREENER_API}${tokenAddress}`);
    if (!response.ok) {
      throw new Error(`DexScreener API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (data.pairs && data.pairs.length > 0) {
      const mcap = data.pairs[0].fdv;
      if (mcap) {
        return formatMarketCap(mcap);
      }
    }
    return 'Unknown';
  } catch (error) {
    console.error('Error fetching market cap:', error);
    return 'Unknown';
  }
}

function formatMarketCap(mcap) {
  if (mcap >= 1000000) {
    return `${(mcap / 1000000).toFixed(1)}M`;
  } else if (mcap >= 1000) {
    return `${(mcap / 1000).toFixed(0)}K`;
  } else {
    return `${mcap.toFixed(0)}`;
  }
}

function formatMessage({
  isBuy,
  walletLabel,
  tokenInSymbol,
  tokenOutSymbol,
  amountIn,
  amountOut,
  tokenInName,
  tokenOutName,
  marketCap,
  tokenAddress,
}) {
  const action = isBuy ? '🟢 DAO BOUGHT' : '🔴 DAO SOLD';
  const inName = tokenInName ? `(${tokenInName})` : '';
  const outName = tokenOutName ? `(${tokenOutName})` : '';

  return `
${action}
${walletLabel} ${isBuy ? 'bought' : 'sold'} ${amountOut} ${tokenOutSymbol} ${outName} ${isBuy ? 'with' : 'for'} ${amountIn} ${tokenInSymbol} ${inName}

MC: ${marketCap}

<code>${tokenAddress}</code>
    `;
}

async function sendToTelegram(message, tokenAddress) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '🔍Trojan',
          url: `https://t.me/hector_trojanbot?start=d-raybot-${tokenAddress}`,
        },
        {
          text: '🧪BullX',
          url: `https://bullx.io/terminal?chainId=1399811149&address=${tokenAddress}`,
        },
      ],
    ],
  };

  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(inlineKeyboard),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to send message to Telegram:', errorData);
  }
}

async function setupWebhook() {
  const currentWebhooks = await (
    await fetch(HELIUS_WEBHOOK_URL)
  ).json();

  if (currentWebhooks.length > 0) {
    const webhookID = currentWebhooks[0].webhookID;
    console.log('Deleting webhook', webhookID);

    const deleteResponse = await fetch(
      `${HELIUS_WEBHOOK_URL}&webhookID=${webhookID}`,
      {
        method: 'DELETE',
      },
    );

    if (!deleteResponse.ok) {
      console.error(
        'Failed to delete webhook:',
        await deleteResponse.text(),
      );
      return new Response('Failed to delete webhook', { status: 500 });
    }

    console.log('Webhook deleted successfully');
  }

  const webhookData = {
    webhookURL: 'YOUR_WEBHOOK_URL', // Replace with your worker's URL
    accountAddresses: Object.keys(WALLET_LABELS),
    transactionTypes: ['ANY'],
    webhookType: 'enhanced', // Use 'enhanced' for detailed transaction data
  };

  const createResponse = await fetch(HELIUS_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookData),
  });

  if (!createResponse.ok) {
    console.error('Failed to create webhook:', await createResponse.text());
    return new Response('Failed to create webhook', { status: 500 });
  }

  const newWebhook = await createResponse.json();
  console.log('Webhook created successfully:', newWebhook);

  return new Response(
    `Webhook created successfully: ${JSON.stringify(newWebhook)}`,
    { status: 200 },
  );
}

async function storeTransaction(transaction) {
  // Get current transactions
  const currentTransactions = JSON.parse(await TOKEN_BUYS_10.get('recent_transactions') || '[]');
  
  // Add new transaction at start
  currentTransactions.unshift(transaction);
  
  // Keep only last 100
  const recentTransactions = currentTransactions.slice(0, 100);
  
  // Store back in KV
  await TOKEN_BUYS_10.put('recent_transactions', JSON.stringify(recentTransactions));
}