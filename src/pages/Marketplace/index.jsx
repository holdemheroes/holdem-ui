import React, { useEffect, useState } from "react";
import "./style.scss";
import { useMoralis } from "react-moralis"
import { getChainType } from "../../helpers/networks"
import { Spin } from "antd"
import L1Marketplace from "./L1Marketplace"
import L2Marketplace from "./L2Marketplace"


export default function Marketplace() {

  const { chainId } = useMoralis();

  const [chainType, setChainType] = useState(null);

  useEffect(() => {
    if(chainId) {
      setChainType(getChainType(chainId));
    }
  }, [chainId])

  if(!chainId) {
    return (
      <div className="marketplace_page-wrapper">
        <p className="title">NFT Marketplace</p>
        <p className="desc">Connect Wallet</p>
      </div>
    )
  }

  if(!chainType) {
    return (
      <div className="marketplace_page-wrapper">
        <p className="title">NFT Marketplace</p>
        <Spin />
      </div>
    )
  }

  return (
    <div className="marketplace_page-wrapper">
      <p className="title">NFT Marketplace</p>
      {
        chainType === "l1" ? <L1Marketplace /> : <L2Marketplace />
      }
    </div>
  )
}
