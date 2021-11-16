export const networkConfigs = {
  "0x1": {
    currencySymbol: "ETH",
    blockExplorerUrl: "https://etherscan.io",
    openSeaUrl: "https://opensea.io"
  },
  "0x3": {
    currencySymbol: "ETH",
    blockExplorerUrl: "https://ropsten.etherscan.io"
  },
  "0x4": {
    currencySymbol: "ETH",
    blockExplorerUrl: "https://rinkeby.etherscan.io",
    openSeaUrl: "https://testnets.opensea.io",
    holdemHeroesAddress: "0x0f311974A57181B6e806a8cCF6F8EfEe0Ee7EEac",
    texasHoldemV1Address: "0xca25aB8b9da0ab88F86d2838f9CA78281eA01f6E"
  },
  "0x2a": {
    currencySymbol: "ETH",
    blockExplorerUrl: "https://kovan.etherscan.io"
  },
  "0x5": {
    currencySymbol: "ETH",
    blockExplorerUrl: "https://goerli.etherscan.io"
  },
  "0xaa289": {
    chainName: "VorDev Chain",
    currencyName: "ETH",
    currencySymbol: "ETH",
    rpcUrl: "http://127.0.0.1:8545",
    holdemHeroesAddress: "0xD86C8F0327494034F60e25074420BcCF560D5610",
    texasHoldemV1Address: "0xd99748782d7643b00C36a4Bb296C4A099dF98Ff3"
  },
  "0x539": {
    chainName: "Local Chain",
    currencyName: "ETH",
    currencySymbol: "ETH",
    rpcUrl: "http://127.0.0.1:7545",
  },
  "0xa86a": {
    chainId: 43114,
    chainName: "Avalanche Mainnet",
    currencyName: "AVAX",
    currencySymbol: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorerUrl: "https://cchain.explorer.avax.network",
  },
  "0x38": {
    chainId: 56,
    chainName: "Smart Chain",
    currencyName: "BNB",
    currencySymbol: "BNB",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorerUrl: "https://bscscan.com",
  },
  "0x61": {
    chainId: 97,
    chainName: "Smart Chain - Testnet",
    currencyName: "BNB",
    currencySymbol: "BNB",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    blockExplorerUrl: "https://testnet.bscscan.com",
  },
  "0x89": {
    chainId: 137,
    chainName: "Polygon Mainnet",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    rpcUrl: "https://rpc-mainnet.maticvigil.com",
    blockExplorerUrl: "https://explorer-mainnet.maticvigil.com",
  },
  "0x13881": {
    chainId: 80001,
    chainName: "Mumbai",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    rpcUrl: "https://rpc-mumbai.matic.today",
    blockExplorerUrl: "https://rpc-mumbai.matic.today",
  },
};

export const getNativeByChain = (chain) => networkConfigs[chain]?.currencySymbol || "NATIVE";

export const getExplorer = (chain) => networkConfigs[chain]?.blockExplorerUrl;

export const getHoldemHeroesAddress = (chain) => networkConfigs[chain]?.holdemHeroesAddress;
export const getTexasHoldemV1Address = (chain) => networkConfigs[chain]?.texasHoldemV1Address;

export const getOpenSeaUrl = (chain) => networkConfigs[chain]?.openSeaUrl
