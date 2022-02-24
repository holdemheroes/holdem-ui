import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis"
import { Spin } from "antd";
import SaleInfo from "./SaleInfo";
import PreRevealSale from "./PreRevealSale";
import PostRevealSale from "./PostRevealSale";
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
import "./style.scss";
import { getBakendObjPrefix } from "../../helpers/networks"

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


  const { chainId } = useMoralis();
  const backendPrefix = getBakendObjPrefix(chainId);

  const { data: mintedRes } = useMoralisQuery(
    `${backendPrefix}HEHTransfer`,
    query =>
      query
        .equalTo("from", "0x0000000000000000000000000000000000000000")
        .equalTo("confirmed", true)
        .limit(1326),
    [],
    {
      live: true,
    },
  );

  useEffect(() => {
    if (mintedRes) {
      let m = mintedRes.map((item, i) => parseInt(item.get("tokenId"), 10));
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

  const canMint = (NFTHands.length < maxPerTxOrOwner)

  return (
    <div className="sales_page-wrapper">
      {
        saleStartDiff > 0 ? (<>
          <p className="title">NFT Sale</p>
          <p className="desc">Pre-reveal sale not started yet</p>
          <SaleInfo
            startTime={startTime}
            revealTime={revealTime}
            startingIndex={startingIndex}
          />
        </>) : (revealTimeDiff > 0 && startIdx === 0) ?
          totalSupply < 1326 ?
            <PreRevealSale pricePerToken={pricePerToken} mintedTokens={minted} maxCanOwn={maxPerTxOrOwner} balance={NFTHands.length} totalSupply={totalSupply} saleHeader={<SaleInfo
              startTime={startTime}
              revealTime={revealTime}
              startingIndex={startingIndex}
            />} /> : (
              <>
                <p className="title">Pre-reveal minting sale</p>
                <p className="desc">Sold out!</p>
              </>) : startIdx === 0 ? (<>
                <p className="title">NFT Sale</p>
                <p className="desc">pre-reveal sale ended. Waiting for distribution</p>
              </>) : <PostRevealSale pricePerToken={pricePerToken} canMint={canMint} maxCanOwn={maxPerTxOrOwner} mintedTokens={minted} />
      }
    </div>
  );
}
