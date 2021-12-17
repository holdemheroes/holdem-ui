import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
import NFTCard from "../NFTCard";
import "./style.scss";
import { Pagination } from "antd";

export default function NFTBalance() {
  const { NFTHands } = useMyNFTHands();
  const { chainId } = useMoralisDapp();

  // const [currentItems, setCurrentItems] = useState(null);
  // const [tokensPerPage, setTokensPerPage] = useState(10);
  // const [pageNumber, setPageNumber] = useState(1);

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

      {/* <div>
        <Pagination
          showQuickJumper
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          defaultCurrent={1}
          total={NFTHands.length}
          onChange={handlePageClick}
        />
      </div> */}
    </div>
  );
}
