import React, { useState, useEffect } from "react"
import SaleInfo from "./SaleInfo"
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo"
import { useMoralisQuery } from "react-moralis";
import PreRevealSale from "./PreRevealSale"
import PostRevealSale from "./PostRevealSale"
import { useMyNFTHands } from "../../hooks/useMyNFTHands"

export default function Sale() {
  const {
    startTime,
    revealTime,
    startingIndex,
    maxPerTxOrOwner,
    pricePerToken,
    totalSupply,
    dataInitialised
  } = useNFTSaleInfo()

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
      const m = []
      for (let i = 0; i < mintedRes.length; i += 1) {
        const t = mintedRes[i].get("tokenId")
        m.push(parseInt(t, 10))
      }
      setMinted(m)
    }
  }, [mintedRes]);

  if (!dataInitialised && nftBalanceIsLoading) {
    return (<div>LOADING</div>)
  }

  const now = Math.floor(Date.now() / 1000)

  const saleStartDiff = startTime - now
  const revealTimeDiff = revealTime - now
  const startIdx = parseInt(startingIndex, 10)

  const saleHeader = <SaleInfo
    startTime={startTime}
    revealTime={revealTime}
    startingIndex={startingIndex}
  />

  if (saleStartDiff > 0) {
    return (
      <div>
        {saleHeader}
        <h4>NFT Sale</h4>
        Pre-reveal sale not started yet
      </div>
    )
  }

  if (saleStartDiff <= 0 && revealTimeDiff > 0 && startIdx === 0) {
    return (
      <>
        {
          totalSupply < 1326 ? (
            <PreRevealSale pricePerToken={pricePerToken} mintedTokens={minted} maxCanOwn={maxPerTxOrOwner} balance={NFTHands.length} totalSupply={totalSupply} />
          ) : (
            <div>
              <h4>Pre-reveal minting sale</h4>
              Sold out!
            </div>
          )
        }
      </>
    )
  }

  if (startIdx === 0) {
    return (
      <div>
        <h4>NFT Sale</h4>
        pre-reveal sale ended. Waiting for distribution
      </div>
    )
  }

  const canMint = (NFTHands.length < maxPerTxOrOwner)

  return (
    <PostRevealSale pricePerToken={pricePerToken} canMint={canMint} maxCanOwn={maxPerTxOrOwner} mintedTokens={minted} />
  )
}