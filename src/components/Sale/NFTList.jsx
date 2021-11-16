import React from "react";
import NFT from "./NFT"

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px",
  },
};

export default function NFTList({ currentTokens, canMint, mintedTokens, pricePerToken }) {

  return (
    <div style={styles.NFTs}>
      {currentTokens &&
      currentTokens.map(( item) => (
        <NFT key={`nft_id_${item}`} tokenId={item} canMint={canMint} mintedTokens={mintedTokens} pricePerToken={pricePerToken} />
      ))}
    </div>
  );
}