import React from "react";
import NFT from "./NFT";

export default function NFTList({ currentTokens, canMint, mintedTokens, pricePerToken }) {

  return (
    <div className="nft_list">
      {currentTokens &&
        currentTokens.map((item) => (
          <NFT key={`nft_id_${item}`} tokenId={item} canMint={canMint} mintedTokens={mintedTokens} pricePerToken={pricePerToken} />
        ))}
    </div>
  );
}