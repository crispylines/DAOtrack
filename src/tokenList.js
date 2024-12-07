export const KNOWN_TOKENS = {
  "So11111111111111111111111111111111111111112": {
    name: "SOL",
    symbol: "SOL",
    logoURI: null
  },
  "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC": {
    name: "ai16z",
    symbol: "ai16z",
    logoURI: null
  },
  "EqsBaDzag9bB9Tkck8kBXtQj4DdXTSr7S5V3aH3nVfZr": {
    name: "Private Asset Wealth Group",
    symbol: "PAWG",
    logoURI: null
  },
  "99tCAvV13GA35GQzMe6UsZJN8S5VTKDEbfqp2ZoRgFws": {
    name: "DAO Jones",
    symbol: "daojones",
    logoURI: null
  },
  "2ToWKrbULA2hEQfagVj5oAwemXFGWX5aN8xtjHaJFnx1": {
    name: "Diddy Capital",
    symbol: "diddycap",
    logoURI: null
  },
  "FTikkFDaNqpFPZ3BE32QqNtx2PwAk4y3nfeeYYtyJFWR": {
    name: "DAMP Protocol",
    symbol: "damp",
    logoURI: null
  },
  "78E2eW1QBg15cinNR4wfFzu9SJPsDXQKR29SNpApg78J": {
    name: "Late Capital",
    symbol: "late",
    logoURI: null
  },
  "BgBYAPuGkd4Fn58mBPhNnrts6H6K4m2xwWWYVXi2kgsL": {
    name: "wAI Combinator",
    symbol: "wAI",
    logoURI: null
  },
  "GQQ7zcP3a5dqrMYaD7BPdPd9Ksxcm6BgkcfnBKWsqcWn": {
    name: "KOTOPIA",
    symbol: "KOTO",
    logoURI: null
  },
  "41efRpYgL94NCMktNH84fkVxwSFkhahJ58X4UfVC292h": {
    name: "Inferno",
    symbol: "inf",
    logoURI: null
  },
  "EqYnLeJgWUZ7U4C4uF481eAe2PkcyoqxDVFEMYL282Ux": {
    name: "Monopoly",
    symbol: "mono",
    logoURI: null
  },
  "56PCzXa6wN9bbaVJZwRTSSPqynPbcYodQUAm2vBLKjFJ": {
    name: "George Fund Capital",
    symbol: "GFC",
    logoURI: null
  },
  "Ca5pGwrrwtUgBMDe4sL3UxgqG9GsUwXCRWm1UsYJKnZk": {
    name: "Milady",
    symbol: "milady",
    logoURI: null
  },
  "CC4aRC4wiw4UfRBmUZZo9jqHiKnUZbL5bWwMHHHqnpFw": {
    name: "Retardio",
    symbol: "retardio",
    logoURI: null
  },
  "5pGwrrxrUtLFKoNbTyfVaikhsYXuio1KTZMmesFn1Nej": {
    name: "Paradigm",
    symbol: "paradigm",
    logoURI: null
  },
  "DmyYENoMKDFtbfUeBcMhAedi1amPSEvJC9Sy8R8VxQ8j": {
    name: "girl econo",
    symbol: "girle",
    logoURI: null
  }
}; 

// Add a helper function to check if a token transfer is a sell of a tracked token
function isTrackedTokenSell(tokenTransfer) {
  const tokenMint = tokenTransfer.mint;
  return KNOWN_TOKENS.hasOwnProperty(tokenMint) && 
         tokenTransfer.tokenAmount > 0 && 
         tokenTransfer.fromUserAccount !== tokenTransfer.toUserAccount;
}

// Then in your transaction processing logic:
const trackedSells = tx.tokenTransfers.filter(isTrackedTokenSell);
if (trackedSells.length > 0) {
  // This is a sell of a tracked token
  const soldToken = KNOWN_TOKENS[trackedSells[0].mint];
  console.log(`Detected sell of ${soldToken.symbol}`);
} 