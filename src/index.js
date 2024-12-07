// Constants
//-1002368630513 The Lab
//-1002370104136 testing area
//wrangler tail solana-tracker-worker //for logging
//git push //npm run deploy
// Constants
const TELEGRAM_BOT_TOKEN = BOT_TOKEN; // Your Telegram Bot Token
const TELEGRAM_CHAT_ID = CHAT_ID; // Your Telegram Chat ID
const HELIUS_API_KEY = API_KEY; // Your Helius API Key
const HELIUS_RPC_URL = `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`;

// Wallet Labels (Simplified and in tokenList.js)
import { WALLET_LABELS, KNOWN_TOKENS } from './tokenList.js';

// Helius Webhook URL
const HELIUS_WEBHOOK_URL = `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`;

// Program ID for daos.fun
const DAOS_FUN_PROGRAM_ID = '4FqThZWv3QKWkSyXCDmATpWkpEiCHq5yhkdGWpSEDAZM';

// DEX Screener API for market cap
const DEX_SCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens/';

// Constants for token metadata
const SOL_MINT = 'So11111111111111111111111111111111111111112';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
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
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response('Error processing request', { status: 500 });
    }
  } else if (request.method === 'GET') {
    // Handle GET requests (e.g., for webhook setup/verification)
    return setupWebhook();
  }

  return new Response('OK', { status: 200 });
}

async function processTransaction(transaction) {
  try {
    const { accountData, signature } = transaction;

    // Check if the transaction involves any of the tracked wallets
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

    // Analyze the transaction for relevant actions (buy/sell)
    const analysisResult = await analyzeTransaction(
      transaction,
      walletAddress,
    );
    if (!analysisResult) {
      console.log(`Transaction ${signature} is not a relevant buy/sell.`);
      return;
    }

    const { isBuy, tokenIn, tokenOut, amountIn, amountOut } = analysisResult;

    // Get token metadata
    const tokenInMetadata = await getTokenMetadata(tokenIn);
    const tokenOutMetadata = await getTokenMetadata(tokenOut);

    // Fetch market cap (only for the bought/sold token)
    const marketCap = await fetchMarketCap(isBuy ? tokenOut : tokenIn);

    // Construct the message
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
      tokenAddress: isBuy ? tokenOut : tokenIn,
    });

    // Send the message to Telegram
    await sendToTelegram(message, isBuy ? tokenOut : tokenIn);
  } catch (error) {
    console.error('Error processing transaction:', error);
  }
}

async function analyzeTransaction(transaction, walletAddress) {
  const { accountData, instructions, tokenTransfers, signature } = transaction;

  const isDaosFunInteraction = instructions.some(
    (ix) => ix.programId === DAOS_FUN_PROGRAM_ID,
  );

  if (tokenTransfers.length < 2) {
    console.log(`Transaction ${signature} has fewer than 2 token transfers; skipping.`);
    return null; // Not a swap if fewer than 2 transfers
  }

  let isBuy = false;
  let tokenIn = '';
  let tokenOut = '';
  let amountIn = 0;
  let amountOut = 0;

  if (isDaosFunInteraction) {
    console.log(`Transaction ${signature} is a daos.fun interaction.`);
    // Iterate through transfers to find the tracked token *received* by the wallet
    const buyTransfer = tokenTransfers.find(
      (t) => KNOWN_TOKENS.hasOwnProperty(t.mint) && t.toUserAccount === walletAddress && t.tokenAmount > 0
    );

    if (buyTransfer) {
      isBuy = true;
      tokenOut = buyTransfer.mint;
      amountOut = buyTransfer.tokenAmount;

      // Find the corresponding sell (SOL or another KNOWN_TOKEN *from* the wallet)
      const sellTransfer = tokenTransfers.find(
        (t) => t.fromUserAccount === walletAddress && (t.mint === SOL_MINT || KNOWN_TOKENS.hasOwnProperty(t.mint)) && t.tokenAmount > 0
      );
      if (sellTransfer) {
        tokenIn = sellTransfer.mint;
        amountIn = sellTransfer.tokenAmount;
      } else {
        console.log(`[daos.fun] Couldn't find corresponding sell transfer for ${signature}`);
        return null;
      }
    } else {      
      // Check for sell of tracked token (from the wallet)
        const sellTransfer = tokenTransfers.find(
            (t) => KNOWN_TOKENS.hasOwnProperty(t.mint) && t.fromUserAccount === walletAddress && t.tokenAmount > 0
        )
        if (sellTransfer) {
            isBuy = false;
            tokenIn = sellTransfer.mint;
            amountIn = sellTransfer.tokenAmount;
            const buyTransfer = tokenTransfers.find(t=> t.toUserAccount === walletAddress && t.mint !== tokenIn)
            if (buyTransfer) {
                tokenOut = buyTransfer.mint;
                amountOut = buyTransfer.tokenAmount;
            } else {
                console.log(`[daos.fun] Couldn't find corresponding buy transfer for ${signature}`);
            }
        } else {
            console.log(`Transaction ${signature} is not a tracked buy or sell within daos.fun.`);
            return null;
        }
    }
  } else {
    console.log(`Transaction ${signature} is NOT a daos.fun interaction.`);
    // ... (rest of the non-daos.fun logic - keep the previous correct code here)
  }

  if (tokenIn && tokenOut && amountIn && amountOut) {
      console.log(`Transaction Analysis Result:`, { isBuy, tokenIn, tokenOut, amountIn, amountOut });
    return { isBuy, tokenIn, tokenOut, amountIn, amountOut };
  } else {
    console.log(
      `Could not fully determine buy/sell for transaction: ${signature}`, {tokenIn, tokenOut, amountIn, amountOut}, JSON.stringify(tokenTransfers, null, 2) // Log tokenTransfers for debugging!
    );
    return null;
  }
}

async function getTokenMetadata(mint) {
  try {
    // Check KNOWN_TOKENS
    if (KNOWN_TOKENS[mint]) {
      return KNOWN_TOKENS[mint];
    }

    // If not in KNOWN_TOKENS, default to symbol/name being the mint
    return {
      symbol: mint.substring(0, 8), // Shortened mint as symbol
      name: mint, // Full mint as name
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return { symbol: 'Unknown', name: 'Unknown' };
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
  const action = isBuy ? '🟢 BOUGHT' : '🔴 SOLD';
  const inName = tokenInName ? `(${tokenInName})` : '';
  const outName = tokenOutName ? `(${tokenOutName})` : '';

  return `
${action}
${walletLabel} ${isBuy ? 'bought' : 'sold'} ${amountOut} ${tokenOutSymbol} ${outName} ${isBuy ? 'with' : 'for'} ${amountIn} ${tokenInSymbol} ${inName}

MC: ${marketCap}

${tokenAddress}
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