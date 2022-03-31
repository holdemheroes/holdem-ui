import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { Spin } from "antd";
import SaleInfo from "./SaleInfo";
import PreRevealSale from "./PreRevealSale";
import PostRevealSale from "./PostRevealSale";
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
import "./style.scss";
import { getBakendObjPrefix } from "../../helpers/networks";
import { useChainData } from "../../hooks/useChainData";
import { BigNumber } from "@ethersproject/bignumber";
import { MAX_TOTAL_SUPPLY } from "../../helpers/constant";

export default function Sale() {
  const {
    // startBlockNum,
    // revealTime,
    startingIndex,
    maxPerTxOrOwner,
    pricePerToken,
    totalSupply,
    dataInitialised: nftSaleDataInitialised,
    refresh: refreshNftData,
  } = useNFTSaleInfo();

  const startBlockNum = BigNumber.from(10421700);
  const revealTime = BigNumber.from(1648999999);

  const { currentBlock, refresh: refreshCurrentBlock } = useChainData();

  const [minted, setMinted] = useState([]);
  const [saleStartBlockDiff, setSaleStartBlockDiff] = useState(null);
  const [revealTimeDiff, setRevealTimeDiff] = useState(null);
  const [saleStartTime, setSaleStartTime] = useState(0);
  const [saleTimeInitialised, setSaleTimeInitialised] = useState(false);

  const { NFTHands, isLoading: nftBalanceIsLoading } = useMyNFTHands();

  const { chainId } = useMoralis();
  const backendPrefix = getBakendObjPrefix(chainId);

  const { data: mintedRes } = useMoralisQuery(
    `${backendPrefix}HEHTransfer`,
    (query) =>
      query
        .equalTo("from", "0x0000000000000000000000000000000000000000")
        .equalTo("confirmed", true)
        .limit(MAX_TOTAL_SUPPLY),
    [],
    {
      live: true,
    }
  );

  useEffect(() => {
    if (mintedRes) {
      let m = mintedRes.map((item, i) => parseInt(item.get("tokenId"), 10));
      setMinted(m);
    }
  }, [mintedRes]);

  useEffect(() => {
    if (currentBlock > 0 && startBlockNum && !saleTimeInitialised) {
      const now = Math.floor(Date.now() / 1000);
      const blockDiff = startBlockNum.toNumber() - currentBlock;
      const start = now + blockDiff * 15;
      setSaleStartTime(start); // estimate based on 1 block every 15 seconds
      setSaleStartBlockDiff(blockDiff);
      setRevealTimeDiff(revealTime - now);
      setSaleTimeInitialised(true);
    }
  }, [currentBlock, startBlockNum, saleTimeInitialised, revealTime]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!nftSaleDataInitialised) {
        refreshNftData();
      }
      refreshCurrentBlock();
      const now = Math.floor(Date.now() / 1000);
      if (startBlockNum && currentBlock > 0) {
        setSaleStartBlockDiff(startBlockNum.toNumber() - currentBlock);
      }
      if (revealTime > 0) {
        setRevealTimeDiff(revealTime - now);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  });

  if (
    !nftSaleDataInitialised ||
    nftBalanceIsLoading ||
    !saleTimeInitialised ||
    revealTimeDiff === null
  ) {
    return <Spin className="spin_loader" />;
  }

  const startIdx = parseInt(startingIndex, 10);

  const canMint = NFTHands.length < maxPerTxOrOwner;

  return (
    <div className="sales_page-wrapper">
      {saleStartBlockDiff > 0 ? (
        <>
          <p className="title">NFT Sale</p>
          <p className="desc">Pre-reveal sale not started yet</p>
          <SaleInfo
            startBlockNum={startBlockNum}
            revealTime={revealTime}
            startingIndex={startingIndex}
            currentBlock={currentBlock}
            saleStartBlockDiff={saleStartBlockDiff}
            saleStartTime={saleStartTime}
          />
        </>
      ) : revealTimeDiff > 0 && startIdx === 0 ? (
        totalSupply < MAX_TOTAL_SUPPLY ? (
          <PreRevealSale
            pricePerToken={pricePerToken}
            mintedTokens={minted}
            maxCanOwn={maxPerTxOrOwner}
            balance={NFTHands.length}
            totalSupply={totalSupply}
            saleHeader={
              <SaleInfo
                startBlockNum={startBlockNum}
                revealTime={revealTime}
                startingIndex={startingIndex}
                currentBlock={currentBlock}
                saleStartBlockDiff={saleStartBlockDiff}
                saleStartTime={saleStartTime}
              />
            }
          />
        ) : (
          <>
            <p className="title">Pre-reveal minting sale</p>
            <p className="desc">Sold out!</p>
          </>
        )
      ) : startIdx === 0 ? (
        <>
          <p className="title">NFT Sale</p>
          <p className="desc">
            pre-reveal sale ended. Waiting for distribution
          </p>
        </>
      ) : (
        <PostRevealSale
          pricePerToken={pricePerToken}
          canMint={canMint}
          maxCanOwn={maxPerTxOrOwner}
          mintedTokens={minted}
        />
      )}
    </div>
  );
}
