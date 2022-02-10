import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
import NFTCard from "../NFTCard";
import "./style.scss";
import { Pagination } from "antd";
import { NavLink } from "react-router-dom";

export default function NFTBalance() {
  const { NFTHands } = useMyNFTHands();
  const { chainId } = useMoralisDapp();

  // const [currentItems, setCurrentItems] = useState(null);
  // const [tokensPerPage, setTokensPerPage] = useState(10);
  // const [pageNumber, setPageNumber] = useState(1);

  console.log("*********", { NFTHands })

  if (!NFTHands.length || !NFTHands) {
    // return <Spin className="spin_loader" />;
    return (
      <div className="no_nfts-body">
        <p className="title">You don't have any Holdem Heroes NFTs yet.</p>
        <div className="btn-wrapper">
          <NavLink to="/Marketplace" className="mint_now_btn btn-shadow">Mint now</NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet_page-wrapper">
      <div className="wallet-header">
        <p className="title">My NFTs</p>
        <p className="desc">These are the Holdem Heroes NFTs in your wallet.<br />You can <NavLink to="/Play">play</NavLink> Holdem Heroes with these, or trade them on OpenSea.</p>
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
