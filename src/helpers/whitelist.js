const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")

export const whitelists = {
  // Eth Mainnet
  "0x1": [],
  // Eth Rinkeby
  "0x4": [
    "0xD9EaE9dDD6952349883e2168616Ef434B21DDd6C",
    "0x6e2A22af2a0cc7905b3543c72486057A9f67cA87",
    "0x64B2D8822976Ed82934D595995e9983856D37264",
    "0x134B422c75E9528D1b0689583f1FFCc2523C4c05",
    "0xad028c2DAee42aB93a96186bfa1f7BDF0DC518Be",
    "0x865cBeb5C60Bf132D5AF3282f00Df51C9B42608c",
    "0x8D3541C259AaF1033b6451f516C2BB04DdCdAb95",
    "0xd5FA636c7cc092F387671c7F75B9d976dC386690",
    "0x4dB37bBaa13F53207E6E1C1F1b155E4785A5f47C",
    "0x5cae4a2C32CEBf91F27D80f3474FB311a41C7e2e"
  ],
  // VorDev
  "0xaa289": [
    "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
    "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
    "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b",
    "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d",
    "0xd03ea8624C8C5987235048901fB614fDcA89b117",
    "0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC",
    "0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9",
    "0x28a8746e75304c0780E011BEd21C72cD78cd535E",
    "0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E",
    "0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e",
    "0x610Bb1573d1046FCb8A70Bbbd395754cD57C2b60",
    "0x855FA758c77D68a04990E992aA4dcdeF899F654A",
    "0xfA2435Eacf10Ca62ae6787ba2fB044f8733Ee843",
    "0x64E078A8Aa15A41B85890265648e965De686bAE6",
    "0x2F560290FEF1B3Ada194b6aA9c40aa71f8e95598"
  ],
};

export const getWhitelist = (chain) => whitelists[chain] || [];

export const getHasWhitelist = (chain) => {
  const wl = getWhitelist(chain);
  return wl.length > 0;
}

export const getMerkleTree = (chain) => {
  const wl = whitelists[chain] || [];
  const leafNodes = wl.map(addr => keccak256(addr));
  return new MerkleTree(leafNodes, keccak256, {sortPairs: true});
}

export const getMerkleProof = (chain, minter) => {
  const merkleTree = getMerkleTree(chain);

  const leaf = keccak256(minter);
  return merkleTree.getHexProof(leaf.toString("hex"));
}

export const getMerkleProofFromExistingTree = (merkleTree, minter) => {
  const leaf = keccak256(minter);
  return merkleTree.getHexProof(leaf.toString("hex"));
}
