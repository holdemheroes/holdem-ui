import React from "react";
import { useMoralis } from "react-moralis";
import abis from "../../helpers/contracts";
import { getHoldemHeroesAddress } from "../../helpers/networks";
import { openNotification } from "../../helpers/notifications";
import { getHasWhitelist, getMerkleProof } from "../../helpers/whitelist"

const BN = require('bn.js');

export default function PreRevealSale({ pricePerToken, mintedTokens, maxCanOwn, balance, totalSupply, saleHeader }) {
  const { Moralis, chainId, account } = useMoralis();
  const abi = abis.heh_nft;
  const contractAddress = getHoldemHeroesAddress(chainId);

  const hasWhitelist = getHasWhitelist(chainId);

  const MAX_TOTAL_SUPPLY = 1326;

  async function preRevealMint(event) {
    event.preventDefault();
    const formData = new FormData(event.target),
      formDataObj = Object.fromEntries(formData.entries());
    const numToMint = parseInt(formDataObj.mint_amount, 10);
    const cost = new BN(pricePerToken).mul(new BN(numToMint));

    let proof = []

    if(hasWhitelist) {
      proof = getMerkleProof(chainId, account)
    }

    const options = {
      contractAddress,
      functionName: "mintNFTPreReveal",
      abi,
      msgValue: cost.toString(),
      params: {
        numberOfNfts: numToMint,
        merkleProof: proof,
      },
    };

    try {
      const tx = await Moralis.executeFunction({ awaitReceipt: false, ...options });
      openNotification({
        message: "🔊 New Transaction",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success"
      });
    } catch(e) {
      openNotification({
        message: "🔊 Error",
        description: `📃 ${e.message}`,
        type: "error"
      });
      console.log(e);
    }

  }

  const canMint = Math.min((maxCanOwn - balance, MAX_TOTAL_SUPPLY - totalSupply), 7);
  const options = [];
  for (let i = 1; i <= canMint; i++) {
    options.push(<option value={i} key={`mint_option_${i}`}>{i}</option>);
  }

  let block = <p className="title">Minted max of {maxCanOwn.toString()} already</p>;
  if (options.length > 0) {
    block = <form onSubmit={(e) => preRevealMint(e)} name="mint-form">
      <span>Mint</span>
      <select name={"mint_amount"}>
        {options}
      </select>
      <span>Hands for Ξ{Moralis.Units.FromWei(pricePerToken)} each</span>
      <input className="btn-shadow btn-hover-pointer" type="submit" value="Mint!" />
    </form>;
  }

  return (
    <>
      <p className="title">Blind Minting Phase: {1326 - totalSupply} Available</p>
      {block}
      {saleHeader}
    </>
  );
}
