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
    holdemHeroesAddress: "0x0f311974A57181B6e806a8cCF6F8EfEe0Ee7EEac",
    // texasHoldemV1Address: "0xca25aB8b9da0ab88F86d2838f9CA78281eA01f6E",
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
    holdemHeroesAddress: "0xD86C8F0327494034F60e25074420BcCF560D5610",
    // texasHoldemV1Address: "0xd99748782d7643b00C36a4Bb296C4A099dF98Ff3",
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
    holdemHeroesAddress: "0x4990af7cD359D44716CD881B367A0A32A5741Cb9",
    // texasHoldemV1Address: "0x52456E0CA3D056b4cFAf8B10076B7Ace3CaD2A06",
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
