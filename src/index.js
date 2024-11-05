async function handleRequest(request) {
  if (request.method === 'POST') {
    const requestBody = await request.json();
    console.log('Received POST request with body:', requestBody);

    if (typeof TOKEN_BUYS_2 === 'undefined') {
      console.error('TOKEN_BUYS_2 KV namespace is not defined');
      // Continue processing but skip buyer tracking
    }

    const event = requestBody[0];
    if (event?.type === 'SWAP') {
      // Check if we've already processed this transaction
      if (PROCESSED_TRANSACTIONS.has(event.signature)) {
        console.log('Already processed transaction:', event.signature);
        return new Response('Already processed.', { status: 200 });
      }
      
      // Add signature to processed set
      PROCESSED_TRANSACTIONS.add(event.signature);
      
      // Clean up old signatures (optional - keeps memory usage in check)
      if (PROCESSED_TRANSACTIONS.size > 1000) {
        const oldestSignature = PROCESSED_TRANSACTIONS.values().next().value;
        PROCESSED_TRANSACTIONS.delete(oldestSignature);
      }

      if (isWalletFiltered(event)) {
        console.log('Wallet filtered, not processing this swap');
        return new Response('Filtered wallet, not processed.', { status: 200 });
      }

      const { description, timestamp, signature, tokenTransfers } = event;
      const transactionTimestamp = new Date(timestamp * 1000).toLocaleString();
      const transactionSignature = `https://solscan.io/tx/${signature}`;

      const { tokenIn, tokenOut, amountIn, amountOut } = analyzeSwap(tokenTransfers);

      const { tokenToDisplay, amount, isBeingBought } = getTokenToDisplay(tokenIn, tokenOut, amountIn, amountOut);

      const tokenMetadata = await getTokenMetadata(tokenToDisplay);

      const { labeledDescription, clusterInfo, walletLabel } = replaceWalletWithLabelAndCluster(description, tokenToDisplay, tokenMetadata);

      const marketCap = await fetchMarketCap(tokenToDisplay);

      //let messageToSend = `🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪\n\n` +
      let messageToSend = 
                          `${isBeingBought ? '🟢🧪BuyTEST' : '🔴🧪SellTESTERS'}\n` +
                          `${labeledDescription}\n\n` +
                          `MC: ${marketCap}\n\n` +
                          `<code>${tokenToDisplay}</code>`;

      console.log('About to send message to Telegram:', messageToSend);
      await sendToTelegram(messageToSend, tokenToDisplay);
      console.log('Sent initial message to Telegram');

      if (isBeingBought && typeof TOKEN_BUYS_2 !== 'undefined') {
        const buyersKey = `buyers_${tokenToDisplay}`;
        let buyersJson = await TOKEN_BUYS_2.get(buyersKey);
        let buyers = new Set(JSON.parse(buyersJson || '[]'));
        buyers.add(walletLabel);
        await TOKEN_BUYS_2.put(buyersKey, JSON.stringify(Array.from(buyers)));

        console.log(`Current buyers for ${tokenToDisplay}: ${Array.from(buyers).join(', ')}`);

        if (buyers.size >= 2) {
          const buyersMessage = `🧬🧬🧬🧬🧬🧬🧬🧬🧬🧬🧬🧬\n\n Multiple buys detected for \n\n ${tokenMetadata.name} (${tokenMetadata.symbol})\n\n` +
                                `${Array.from(buyers).join(', ')}\n\n` +
                          `MC: ${marketCap}\n\n` +
                                `<code>${tokenToDisplay}</code>`;
          console.log('About to send buyers message to Telegram:', buyersMessage);
          await sendToTelegram(buyersMessage, tokenToDisplay);
          console.log('Sent buyers message to Telegram');
          
          console.log(`Sent multiple buys alert for ${tokenToDisplay}`);
          
          // Clear the buyers after sending the alert
          await TOKEN_BUYS_2.delete(buyersKey);
        }
      }
    } else {
      console.log('Not a SWAP event, ignoring.');
    }

    return new Response('Processed POST request body.', { status: 200 });
  } else {
    return new Response('Method not allowed.', { status: 405 });
  }
}