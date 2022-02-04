import React, { useState, useEffect } from "react";
import { useMoralisQuery } from "react-moralis";
import { Spin } from "antd";
import SaleInfo from "./SaleInfo";
import PreRevealSale from "./PreRevealSale";
import PostRevealSale from "./PostRevealSale";
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
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
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [saleStartDiff, setSaleStartDiff] = useState(startTime - now);
  const [revealTimeDiff, setRevealTimeDiff] = useState(revealTime - now);
  const [startIdx, setStartIdx] = useState(parseInt(startingIndex, 10));

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

  useEffect(() => {
    setSaleStartDiff(startTime - now);
    setRevealTimeDiff(revealTime - now);
    setStartIdx(parseInt(startingIndex, 10));

    console.log("saleStartDiff", saleStartDiff)
    console.log("revealTimeDiff", revealTimeDiff)
    console.log("startIdx", startIdx)

    setNow(Math.floor(Date.now() / 1000));
  }, [now]);

  if (!dataInitialised && nftBalanceIsLoading) {
    return <Spin className="spin_loader" />;
  }

  // const now = Math.floor(Date.now() / 1000);


  // const saleHeader = <SaleInfo
  //   startTime={startTime}
  //   revealTime={revealTime}
  //   startingIndex={startingIndex}
  // />;
  // let mainContent = null;

  // if (saleStartDiff > 0) {
  //   mainContent = <>
  //     <p className="title">NFT Sale</p>
  //     <p className="desc">Pre-reveal sale not started yet</p>
  //     {saleHeader}
  //   </>;
  // }

  // if (saleStartDiff <= 0 && revealTimeDiff > 0 && startIdx === 0) {
  //   mainContent = <>
  //     {
  //       totalSupply < 1326 ? (
  //         <PreRevealSale pricePerToken={pricePerToken} mintedTokens={minted} maxCanOwn={maxPerTxOrOwner} balance={NFTHands.length} totalSupply={totalSupply} saleHeader={saleHeader} />
  //       ) : (
  //         <>
  //           <p className="title">Pre-reveal minting sale</p>
  //           <p className="desc">Sold out!</p>
  //         </>
  //       )
  //     }
  //   </>;
  // }

  // if (startIdx === 0) {
  //   if (!mainContent) {
  //     mainContent = <>
  //       <p className="title">NFT Sale</p>
  //       <p className="desc">pre-reveal sale ended. Waiting for distribution</p>
  //     </>;
  //   }
  // }

  const canMint = (NFTHands.length < maxPerTxOrOwner)

  return (
    <div className="sales_page-wrapper">
      {/* {
        mainContent ? mainContent : <PostRevealSale pricePerToken={pricePerToken} canMint={canMint} maxCanOwn={maxPerTxOrOwner} mintedTokens={minted} />
      } */}
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