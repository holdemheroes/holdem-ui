import React from "react"
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider"
import abis from "../../helpers/contracts"
import { getTexasHoldemV1Address } from "../../helpers/networks"
import { useMoralis } from "react-moralis"
import { Button } from "antd"
import { openNotification } from "../../helpers/notifications"

export default function Refundable({ gameId, amount }) {
  const { chainId } = useMoralisDapp();
  const { Moralis } = useMoralis()

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);

  const options = {
    contractAddress, abi,
  }

  const handleClaimRefund = async () => {
    const opts = {
      ...options,
      functionName: "claimRefund",
      params: {
        _gameId: String(gameId),
      },
    }

    const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
    tx.on("transactionHash", (hash) => {
      openNotification({
        message: "🔊 Claim refund requested!",
        description: `📃 Tx Hash: ${hash}`,
        type: "success"
      });
    })
      .on("error", (error) => {
        console.log(error);
      });
  }

  return (
    <div>
      <h4>Game #{gameId}</h4>
      <Button onClick={() => handleClaimRefund()}>
        Claim {Moralis.Units.FromWei(amount, 18)} ETH
      </Button>
    </div>
  )
}