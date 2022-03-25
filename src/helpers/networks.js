export const networkConfigs = {
  "0x1": {
    chainId: 1,
    chainName: "Ethereum Mainnet",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://etherscan.io",
    openSeaUrl: "https://opensea.io",
    holdemHeroesAddress: "",
    texasHoldemV1Address: "",
    chainType: "l1",
    prefix: "Eth",
  },
  "0x4": {
    chainId: 4,
    chainName: "Ethereum Rinkeby",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://rinkeby.etherscan.io",
    openSeaUrl: "https://testnets.opensea.io",
    holdemHeroesAddress: "0xF5E017CB133B62E3FEE97AeC48571ae901AA2147",
    texasHoldemV1Address: "",
    chainType: "l1",
    prefix: "Eth",
  },
  "0xaa289": {
    chainId: 696969,
    chainName: "VorDev Chain",
    currencyName: "ETH",
    currencySymbol: "ETH",
    blockExplorerUrl: "http://localhost",
    openSeaUrl: "http://localhost",
    holdemHeroesAddress: "",
    texasHoldemV1Address: "",
    chainType: "l1",
    prefix: "Eth",
  },
  "0x539": {
    chainId: 1337,
    chainName: "Local Chain",
    currencyName: "ETH",
    currencySymbol: "ETH",
    blockExplorerUrl: "http://localhost",
    openSeaUrl: "http://localhost",
    holdemHeroesAddress: "",
    texasHoldemV1Address: "",
    chainType: "l1",
    prefix: "Eth",
  },
  "0x89": {
    chainId: 137,
    chainName: "Polygon Mainnet",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    blockExplorerUrl: "https://polygonscan.com",
    openSeaUrl: "https://opensea.io",
    holdemHeroesAddress: "",
    texasHoldemV1Address: "",
    chainType: "l2",
    prefix: "Polygon",
  },
  "0x13881": {
    chainId: 80001,
    chainName: "Polygon Mumbai",
    currencyName: "MATIC",
    currencySymbol: "MATIC",
    blockExplorerUrl: "https://mumbai.polygonscan.com/",
    openSeaUrl: "https://testnets.opensea.io",
    holdemHeroesAddress: "",
    texasHoldemV1Address: "",
    chainType: "l2",
    prefix: "Polygon",
  },
};

export const getCurrencySymbol = (chain) => networkConfigs[chain]?.currencySymbol || "NATIVE";

export const getExplorer = (chain) => networkConfigs[chain]?.blockExplorerUrl;

export const getHoldemHeroesAddress = (chain) => networkConfigs[chain]?.holdemHeroesAddress;

export const getTexasHoldemV1Address = (chain) => networkConfigs[chain]?.texasHoldemV1Address;

export const getOpenSeaUrl = (chain) => networkConfigs[chain]?.openSeaUrl;

export const getChainType = (chain) => networkConfigs[chain]?.chainType;

export const getBakendObjPrefix = (chain) => networkConfigs[chain]?.prefix;

export const getGameIsLive = (chain) => (networkConfigs[chain]?.texasHoldemV1Address !== "");

export const getHehIsLive = (chain) => (networkConfigs[chain]?.holdemHeroesAddress !== "");
