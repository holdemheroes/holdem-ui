import React, { useEffect, useState } from "react";
import { useMoralisQuery } from "react-moralis"
import { MAX_TOTAL_SUPPLY } from "../../helpers/constant"
import PostRevealSale from "../../components/Sale/PostRevealSale"

export default function L2Marketplace() {

  const [minted, setMinted] = useState([]);

  const { data: mintedRes } = useMoralisQuery(
    "PolygonHEHTransfer",
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

  return (
    <>
      <PostRevealSale
        pricePerToken={"0"}
        mintedTokens={minted}
        l1={false}
      />
    </>
  )
}
