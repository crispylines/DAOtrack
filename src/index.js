function replaceWalletWithLabelAndCluster(description, tokenAddress, tokenMetadata) {
	let labeledDescription = description;
	let clusterInfo = '';
	let walletLabel = '';

	// First find the wallet label
	for (const [wallet, info] of Object.entries(WALLET_LABELS)) {
		if (description.includes(wallet)) {
			walletLabel = info.label;
			clusterInfo = `${info.cluster}`;
			break;
		}
	}

	// Extract the token amount and name
	const amountMatch = description.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s+([^()]+?)\s*(\([^)]+\))?(?:\s+to|\s+from|$)/);
	const amount = amountMatch ? amountMatch[1] : '';
	
	// Create simplified description based on the message type
	// We need to check the emoji at the start of the message to determine if it's a buy or sell
	if (description.includes(' to ') || description.startsWith('🟢')) {
		// It's a buy
		labeledDescription = `${walletLabel} bought ${amount} ${tokenMetadata.name} (${tokenMetadata.symbol})`;
	} else {
		// It's a sell
		labeledDescription = `${walletLabel} sold ${amount} ${tokenMetadata.name} (${tokenMetadata.symbol})`;
	}

	return { labeledDescription, clusterInfo, walletLabel };
}