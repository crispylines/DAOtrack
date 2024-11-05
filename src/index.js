//CURRENT
//-1002368630513 The Lab
//-1002370104136 testing area
//wrangler tail solana-tracker-worker

const TELEGRAM_BOT_TOKEN = BOT_TOKEN;  // Your Telegram Bot Token
const TELEGRAM_CHAT_ID = CHAT_ID;      // Your Telegram Chat ID
const HELIUS_API_KEY = API_KEY;        // Your Helius API Key
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Define wallet labels with cluster information
const WALLET_LABELS = {
  'DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm': { label: '🥼#gake', cluster: 'cluster2' },
  '5hwVpdd6CB5dMCe2rWFETrKZ29wz8fe6KXTKBMhJGdNw': { label: '🥼#smirkWallet', cluster: 'cluster1' },
  '4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t': { label: '🥼#MITCH', cluster: 'cluster1' },
  'EY5udSh8BjxKq3zqKJVtNgRWr1jWkcJtCrHCvAoBLmRW': { label: '🥼#earlyAlpha', cluster: 'cluster1' },
  '8yJFWmVTQq69p6VJxGwpzW7ii7c5J9GRAtHCNMMQPydj': { label: '🥼#brainletWhale', cluster: 'cluster1' },
  '4hSXPtxZgXFpo6Vxq9yqxNjcBoqWN3VoaPJWonUtupzD': { label: '🥼#highProfitTrader', cluster: 'cluster1' },
  '9nrRN7pBM3Fdtm3wEHaTbf9adhMyBhPEAQHXBRdDzVxa': { label: '🥼#degenKindRegards', cluster: 'cluster1' },
  '5B52w1ZW9tuwUduueP5J7HXz5AcGfruGoX6YoAudvyxG': { label: '🥼#hammyWhaleDegen', cluster: 'cluster1' },
  //'4zq1iLpmepj2Rj7W6A3XQMRQA1HyjYqVpZiBzM6aPyH7': { label: '🥼#orangiePublic', cluster: 'cluster1' },//spammy, needs pumpfun detect
  '7SDs3PjT2mswKQ7Zo4FTucn9gJdtuW4jaacPA65BseHS': { label: '🥼#InsFNF', cluster: 'cluster3' },
  //'3tc4BVAdzjr1JpeZu6NAjLHyp4kK3iic7TexMBYGJ4Xk': { label: '🥼#DgFNF', cluster: 'cluster3' },//need to fix the pumpfun buys
  'C2n9iEKWntCSVwcpEdjR2VkXYvfdwuXfVk4N9DNRF47c': { label: '🥼#HDENG', cluster: 'cluster3' },
  //'2RssnB7hcrnBEx55hXMKT1E7gN27g9ecQFbbCc5Zjajq': { label: '🥼#Mostache', cluster: 'cluster3' },//need moonshot capability/pumpfun 
  'GQWLRHtR18vy8myoHkgc9SMcSzwUdBjJ816vehSBwcis': { label: '🥼#joji', cluster: 'cluster3' },
  '8MaVa9kdt3NW4Q5HyNAm1X5LbR8PQRVDc1W8NMVK88D5': { label: '🥼#Daumen', cluster: 'cluster3' },
  'DKwybycDSWidrHfpMjaahUsT1Yid3kig86ncXPAGe7AU': { label: '🥼#Yogurt', cluster: 'cluster3' },
  '8deJ9xeUvXSJwicYptA9mHsU2rN2pDx37KWzkDkEXhU6': { label: '🥼#Cookerflips', cluster: 'cluster3' },
  'HUpPyLU8KWisCAr3mzWy2FKT6uuxQ2qGgJQxyTpDoes5': { label: '🥼#Sun', cluster: 'cluster3' },
  'DKgvpfttzmJqZXdavDwTxwSVkajibjzJnN2FA99dyciK': { label: '🥼#Rowdy', cluster: 'cluster3' },
  '5wPWthsivjuGi43WbTo5LdSjDTJ8pXSSHyfXWVojJjUF': { label: '🥼#meech', cluster: 'cluster4' },
  'BeDLg1Yzm4aTz3oMgUL1qC8gyuYgdB85UTXZAobfvvYF': { label: '🥼#goodConsistentBuys', cluster: 'cluster4' },
  '8zFZHuSRuDpuAR7J6FzwyF3vKNx4CVW3DFHJerQhc7Zd': { label: '🥼#POW', cluster: 'cluster5' },
  'unjF4hY9RQkmi9Q6DgyqtpyV8C7FJq7dYd8mGovTcN7': { label: '🥼#nach30', cluster: 'cluster5' },
  '3Ve46xYmZTKExr3FmCLYMA5Xt12DkDKgK7AeNUhcc5cc': { label: '🥼#climpTrader', cluster: 'cluster5' },
  'A8bzshzYKQU6SSttSi7cPdmA4zdPYRt5saxuK1PrTzEp': { label: '🥼#sugar', cluster: 'cluster5' },
  'Aw1rq9VSY5SJisufnfmDJ6jAwJNx768EXypU15k8iVoW': { label: '🥼#copy1', cluster: 'cluster5' },
  'FdvYZ99wuATUdd6fuSqyAMJRoGLrcHivnuWHxgst475p': { label: '🥼#retardioInsider', cluster: 'cluster5' },
  '58aJk9ngALL8Np7r51JWPc3buPthaPDKknmDaNxuGQcP': { label: '🥼#VFound', cluster: 'cluster5' },
  '4ovLAWnbexHn1HFiKmSdWubPXg2rSJ2sUx46pCNxcTbs': { label: '🥼#larp', cluster: 'cluster5' },
  'J9QKW6w7ALr8pwhXayXJa1njC1AtJPpNGNMsb4HFXBdS': { label: '🥼#magi', cluster: 'cluster5' },
  '4pV17t9g4qdH3HWZzq6dZ62785pDYhkKUSPai8FHvQTH': { label: '🥼#winter', cluster: 'cluster5' },
  'Gwv9NGzyQvUPYk7A5mhDXHVL88P39Eoz9omQ1SVgguMv': { label: '🥼#gakealt', cluster: 'cluster5' },
  'BYN8BfqXPef3YHUvmjfHyuVM6cHCLy72Y7TGrPt3h5mx': { label: '🥼#experimentalWall', cluster: 'cluster5' },
  'FL4j8EEMAPUjrvASnqX7VdpWZJji1LFsAxwojhpueUYt': { label: '🥼#bizz', cluster: 'cluster5' },
  'FTg1gqW7vPm4kdU1LPM7JJnizbgPdRDy2PitKw6mY27j': { label: '🥼#rawr', cluster: 'cluster5' },
  'FQz71kJA22skWHLkuWcdDKjRZH3sKGLtSprRMwbMfMW5': { label: '🥼#ra', cluster: 'cluster5' },
//  '9jyqFiLnruggwNn4EQwBNFXwpbLM9hrA4hV59ytyAVVz': { label: '🥼#nachSOL', cluster: 'cluster5' },
//  'suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK': { label: '🥼#zezimaTRACK', cluster: 'cluster5' },
  'CMzohyRihiiuHMv6jGqkKn4BCpTqF7C2BFYk4BixfpUz': { label: '🥼#aisniper', cluster: 'cluster5' },
  '3rSZJHysEk2ueFVovRLtZ8LGnQBMZGg96H2Q4jErspAF': { label: '🥼#magnet', cluster: 'cluster5' },
  '3kjF7ZXfMYo1dqxFNE7WVtQ38zZSciptu1deWYibre1m': { label: '🥼#goatcabal', cluster: 'cluster5' },
  'FQYAQe4Eb46MPBXjDQa8FrFr5YRL6Jn6bmZRcGkjPeGf': { label: '🥼#treTrack', cluster: 'cluster5' },
  'HYWo71Wk9PNDe5sBaRKazPnVyGnQDiwgXCFKvgAQ1ENp': { label: '🥼#adamTrack', cluster: 'cluster5' },
  '85H7h4PPrv4TVoJaSD7MtvdD32kuR9tCZpA8xjATJcm9': { label: '🥼#fwogCabal', cluster: 'cluster5' },
  'RFSqPtn1JfavGiUD4HJsZyYXvZsycxf31hnYfbyG6iB': { label: '🥼#sez1', cluster: 'cluster5' },
  'Fofeqp2E3ykxnsB84L5HHVvTwtmkZqMg6YQEVgYkNfdW': { label: '🥼#shock', cluster: 'cluster5' },
  '9XfAyd3Z2DkjyD6mbQQgEU8rxUk9EbxzHjJbJTZLhTm5': { label: '🥼#TESTINGLOG1', cluster: 'cluster5' },
  'HCM9p2FQfbzbhC1XZLXDC6dpogkEZ5fUV8uMDLma4tce': { label: '🥼#TESTINGLOG2', cluster: 'cluster5' },
  'FPbVekSCE9uN9mVt3m6tY1AcgCJgtsybP89aeJnpwEY7': { label: '🥼#TESTINGLOG3', cluster: 'cluster5' },
};

//
// Add the filtered wallets A8bzshzYKQU6SSttSi7cPdmA4zdPYRt5saxuK1PrTzEp, Gwv9NGzyQvUPYk7A5mhDXHVL88P39Eoz9omQ1SVgguMv, BYN8BfqXPef3YHUvmjfHyuVM6cHCLy72Y7TGrPt3h5mx
const FILTERED_WALLETS = [
  'JD38n7ynKYcgPpF7k1BhXEeREu1KqptU93fVGy3S624k',
  'JD25qVdtd65FoiXNmR89JjmoJdYk9sjYQeSTZAALFiMy',//autosnipe.ai
  'JD1dHSqYkrXvqUVL8s6gzL1yB7kpYymsHfwsGxgwp55h'//on-chain surfer
];

// Add at the top with other constants
const PROCESSED_TXS = new Set();

// Add Pump.fun program ID to constants
const RAYDIUM_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
const RAYDIUM_ROUTER_PROGRAM_ID = 'routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS';
const PUMPFUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

function isWalletFiltered(event) {
  const checkFields = [
    event.sourceAddress,
    event.tokenTransfers?.[0]?.fromUserAccount,
    event.tokenTransfers?.[0]?.toUserAccount,
    event.tokenTransfers?.[1]?.fromUserAccount,
    event.tokenTransfers?.[1]?.toUserAccount,
    ...event.instructions?.flatMap(instruction => [instruction.programId, ...instruction.accounts]) || []
  ];

  return checkFields.some(field => FILTERED_WALLETS.includes(field));
}

async function handleRequest(request) {
  try {
    const event = await request.json();
    
    // Check if this is a transaction we want to process
    if (event.type === 'transaction') {
      // Skip if already processed
      if (PROCESSED_TXS.has(event.signature)) {
        console.log('Already processed this transaction, skipping');
        return new Response('Already processed.', { status: 200 });
      }
      PROCESSED_TXS.add(event.signature);

      // Check if transaction involves any of our supported DEXes
      const isPumpFunTx = event.instructions?.some(ix => ix.programId === PUMPFUN_PROGRAM_ID);
      const isRaydiumV4Tx = event.instructions?.some(ix => ix.programId === RAYDIUM_V4_PROGRAM_ID);
      const isRaydiumRouterTx = event.instructions?.some(ix => ix.programId === RAYDIUM_ROUTER_PROGRAM_ID);

      if (!isPumpFunTx && !isRaydiumV4Tx && !isRaydiumRouterTx) {
        return new Response('Not a relevant DEX transaction.', { status: 200 });
      }

      // Rest of your existing wallet filtering code...
      if (isWalletFiltered(event)) {
        console.log('Wallet filtered, not processing this swap');
        return new Response('Filtered wallet, not processed.', { status: 200 });
      }

      const { description, timestamp, signature, tokenTransfers } = event;
      
      // For Pump.fun, we can look at the program logs to determine if it's a buy or sell
      if (isPumpFunTx) {
        const pumpfunInstruction = event.instructions.find(ix => ix.programId === PUMPFUN_PROGRAM_ID);
        const isBuy = pumpfunInstruction?.data?.includes('Instruction: Buy');
        
        // If we can't determine the type, skip processing
        if (typeof isBuy !== 'boolean') {
          return new Response('Unable to determine Pump.fun transaction type.', { status: 200 });
        }

        // Process the swap using existing token transfer analysis
        const swapInfo = analyzeSwap(tokenTransfers);
        if (!swapInfo.tokenIn || !swapInfo.tokenOut) {
          return new Response('Invalid token transfers.', { status: 200 });
        }

        // Use existing logic to determine which token to display
        const { tokenToDisplay, amount, isBeingBought } = getTokenToDisplay(
          swapInfo.tokenIn,
          swapInfo.tokenOut,
          swapInfo.amountIn,
          swapInfo.amountOut
        );

        // Rest of your existing processing code...
        const { labeledDescription, clusterInfo, walletLabel } = replaceWalletWithLabelAndCluster(
          description,
          tokenToDisplay,
          await getTokenMetadata(tokenToDisplay)
        );

        // Send the message using existing code...
        await sendTelegramMessage(labeledDescription, signature, clusterInfo, walletLabel);
      } else {
        // Existing Raydium processing logic...
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Error processing request', { status: 500 });
  }
}

function analyzeSwap(tokenTransfers) {
  // Handle case where tokenTransfers might be undefined or empty
  if (!tokenTransfers || tokenTransfers.length < 2) {
    return {
      tokenIn: null,
      tokenOut: null,
      amountIn: 0,
      amountOut: 0
    };
  }

  const [tokenInTransfer, tokenOutTransfer] = tokenTransfers;
  
  return {
    tokenIn: tokenInTransfer.mint,
    tokenOut: tokenOutTransfer.mint,
    amountIn: tokenInTransfer.amount,
    amountOut: tokenOutTransfer.amount
  };
}

function getTokenToDisplay(tokenIn, tokenOut, amountIn, amountOut) {
  const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';
  if (tokenIn === SOL_ADDRESS) {
    return { tokenToDisplay: tokenOut, amount: amountOut, isBeingBought: true };
  } else {
    return { tokenToDisplay: tokenIn, amount: amountIn, isBeingBought: false };
  }
}

function replaceWalletWithLabelAndCluster(description, tokenAddress, tokenMetadata) {
  let labeledDescription = description;
  let clusterInfo = '';
  let walletLabel = '';

  for (const [wallet, info] of Object.entries(WALLET_LABELS)) {
    const regex = new RegExp(wallet, 'g');
    if (description.includes(wallet)) {
      labeledDescription = labeledDescription.replace(regex, info.label);
      clusterInfo = `${info.cluster}`;
      walletLabel = info.label;
      break;
    }
  }

  const tokenRegex = new RegExp(tokenAddress, 'g');
  labeledDescription = labeledDescription.replace(tokenRegex, `${tokenMetadata.name} (${tokenMetadata.symbol})`);

  labeledDescription = labeledDescription.replace(/(\d+(?:\.\d+)?)\s+([A-Z]+)/g, (match, amount, symbol) => {
    const roundedAmount = Math.round(parseFloat(amount));
    const formattedAmount = roundedAmount.toLocaleString();
    return `${formattedAmount} ${symbol}`;
  });

  return { labeledDescription, clusterInfo, walletLabel };
}

async function getTokenMetadata(tokenAddress) {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAsset',
      params: {
        id: tokenAddress,
      },
    }),
  });

  const data = await response.json();
  
  if (data.result) {
    return {
      name: data.result.content.metadata.name || 'Unknown Token',
      symbol: data.result.content.metadata.symbol || 'UNKNOWN',
    };
  } else {
    console.error('Failed to fetch token metadata:', data);
    return { name: 'Unknown Token', symbol: 'UNKNOWN' };
  }
}

async function fetchMarketCap(tokenAddress) {
  const dexscreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
  try {
    const response = await fetch(dexscreenerUrl);
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      // Sort pairs by liquidity in descending order
      const sortedPairs = data.pairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd);
      
      // Get the pair with the highest liquidity
      const topPair = sortedPairs[0];
      
      if (topPair.fdv) {
        const marketCap = parseFloat(topPair.fdv);
        if (marketCap) {
          if (marketCap >= 1000000) {
            return `$${(marketCap / 1000000).toFixed(2)}M`;
          } else if (marketCap >= 1000) {
            return `$${(marketCap / 1000).toFixed(2)}K`;
          } else {
            return `$${marketCap.toFixed(2)}`;
          }
        }
      }
    }
    return 'Unknown';
  } catch (error) {
    console.error('Error fetching market cap from DexScreener:', error);
    return 'Unknown';
  }
}

async function sendToTelegram(message, tokenAddress) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  console.log('Sending message to Telegram:', { message, tokenAddress });
  
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "🧪Trojan",
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

  const responseData = await response.json();

  if (!response.ok) {
    console.error('Failed to send message to Telegram:', responseData);
  }
}