import React from "react";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider"
import { useMoralis } from "react-moralis"
import abis from "../../helpers/contracts"
import { getHoldemHeroesAddress } from "../../helpers/networks"
import { openNotification } from "helpers/notifications"

const BN = require('bn.js')

export default function PreRevealSale({ pricePerToken, mintedTokens, maxCanOwn, balance, totalSupply }) {
  const { chainId } = useMoralisDapp();
  const { Moralis } = useMoralis();
  const abi = abis.heh_nft;
  const contractAddress = getHoldemHeroesAddress(chainId);

  const MAX_TOTAL_SUPPLY = 1326

  async function preRevealMint(event) {
    event.preventDefault()
    const formData = new FormData(event.target),
      formDataObj = Object.fromEntries(formData.entries())
    const numToMint = parseInt(formDataObj.mint_amount, 10)
    const cost = new BN(pricePerToken).mul(new BN(numToMint))

    const options = {
      contractAddress,
      functionName: "mintNFTPreReveal",
      abi,
      msgValue: cost.toString(),
      params: {
        numberOfNfts: numToMint
      },
    }

    const tx = await Moralis.executeFunction({ awaitReceipt: false, ...options });
    tx.on("transactionHash", (hash) => {
      openNotification({
        message: "🔊 New Transaction",
        description: `📃 Tx Hash: ${hash}`,
        type: "success"
      });
    })
      .on("receipt", (receipt) => {
        openNotification({
          message: "🔊 New Receipt",
          description: `📃 Receipt: ${receipt.transactionHash}`,
          type: "success"
        });
      })
      .on("error", (error) => {
        openNotification({
          message: "🔊 Error",
          description: `📃 Receipt: ${error.toString()}`,
          type: "error"
        });
        console.log(error);
      });
  }

  const canMint = Math.min((maxCanOwn - balance, MAX_TOTAL_SUPPLY - totalSupply), 5)
  const options = []
  for (let i = 1; i <= canMint; i += 1) {
    options.push(<option value={i} key={`mint_option_${i}`}>{i}</option>)
  }

  let block = <>Minted max of {maxCanOwn.toString()} already</>
  if (options.length > 0) {
    block = <form onSubmit={(e) => preRevealMint(e)}>
      Mint{" "}
      <select name={"mint_amount"}>
        {options}
      </select>
      {" "}Hands for Ξ{Moralis.Units.FromWei(pricePerToken)} each
      {" "}<input type="submit" value="Mint!" />
    </form>
  }

  return (
    <>
      <h4>Pre-reveal minting sale - {1326 - mintedTokens.length} left!</h4>
      {block}
    </>
  )

}