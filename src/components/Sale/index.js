import React, { useState, useEffect } from "react";
import SaleInfo from "./SaleInfo";
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo";
import { useMoralisQuery } from "react-moralis";
import PreRevealSale from "./PreRevealSale";
import PostRevealSale from "./PostRevealSale";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
import { Spin } from "antd";
import "./style.scss";

export default function Sale() {
  const {
    startTime,
    revealTime,
    startingIndex,
    maxPerTxOrOwner,
    pricePerToken,
    totalSupply,
    dataInitialised
  } = useNFTSaleInfo();

  const [minted, setMinted] = useState([]);

  const { NFTHands, isLoading: nftBalanceIsLoading } = useMyNFTHands();

  const { data: mintedRes } = useMoralisQuery(
    "HEHTransfer",
    query =>
      query
        .equalTo("from", "0x0000000000000000000000000000000000000000")
        .equalTo("confirmed", true),
    [],
    {
      live: true,
    },
  );

  useEffect(() => {
    if (mintedRes) {
      const m = [];
      for (let i = 0; i < mintedRes.length; i += 1) {
        const t = mintedRes[i].get("tokenId");
        m.push(parseInt(t, 10));
      }
      setMinted(m);
    }
  }, [mintedRes]);

  if (!dataInitialised && nftBalanceIsLoading) {
    return <Spin className="spin_loader" />;
  }

  const now = Math.floor(Date.now() / 1000);

  const saleStartDiff = startTime - now;
  const revealTimeDiff = revealTime - now;
  const startIdx = parseInt(startingIndex, 10);

  const saleHeader = <SaleInfo
    startTime={startTime}
    revealTime={revealTime}
    startingIndex={startingIndex}
  />;
  let mainContent = null;

  if (saleStartDiff > 0) {
    mainContent = <>
      {saleHeader}
      <h4>NFT Sale</h4>
      Pre-reveal sale not started yet
    </>;
  }

  if (saleStartDiff <= 0 && revealTimeDiff > 0 && startIdx === 0) {
    mainContent = <>
      {
        totalSupply < 1326 ? (
          <PreRevealSale pricePerToken={pricePerToken} mintedTokens={minted} maxCanOwn={maxPerTxOrOwner} balance={NFTHands.length} totalSupply={totalSupply} />
        ) : (
          <>
            <h4>Pre-reveal minting sale</h4>
            Sold out!
          </>
        )
      }
    </>;
  }

  if (startIdx === 0) {
    mainContent = <>
      <h4>NFT Sale</h4>
      pre-reveal sale ended. Waiting for distribution
    </>;
  }

  const canMint = (NFTHands.length < maxPerTxOrOwner)

  return (
    <div className="sales_page-wrapper">
      {
        mainContent ? mainContent : <PostRevealSale pricePerToken={pricePerToken} canMint={canMint} maxCanOwn={maxPerTxOrOwner} mintedTokens={minted} />
      }
    </div>
  );
}