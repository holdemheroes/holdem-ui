import React from "react";
import { Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
import NFTCard from "../NFTCard";
import "./style.scss";

export default function NFTBalance() {
  const { NFTHands } = useMyNFTHands();
  const { chainId } = useMoralisDapp();

  if (!NFTHands.length) {
    return <Spin className="spin_loader" />;
  }

  return (
    <div className="wallet_page-wrapper">
      <div className="wallet-header">
        <p className="title">My NFTs</p>
        <p className="desc">Urna et urna neque lorem. Diam lacus aliquet mauris suscipit turpis cursus ut.</p>
      </div>

      <div className="wallet-main">
        {
          NFTHands && NFTHands.map((nft, index) => {
            return (
              <NFTCard nft={nft} chainId={chainId} key={index} />
            )
          })
        }
      </div>
    </div>
  );
}
