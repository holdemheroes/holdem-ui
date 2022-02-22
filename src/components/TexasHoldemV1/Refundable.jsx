import React from "react";
import abis from "../../helpers/contracts";
import { getCurrencySymbol, getTexasHoldemV1Address } from "../../helpers/networks"
import { useMoralis } from "react-moralis";
import { openNotification } from "../../helpers/notifications";

export default function Refundable({ gameId, amount }) {
  const { Moralis, chainId } = useMoralis();

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);
  const currencySymbol = getCurrencySymbol(chainId)

  const options = {
    contractAddress, abi,
  };

  const handleClaimRefund = async () => {
    const opts = {
      ...options,
      functionName: "claimRefund",
      params: {
        _gameId: String(gameId),
      },
    };

    try {
      const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
      openNotification({
        message: "🔊 New Transaction",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success"
      });
    } catch(e) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Receipt: ${e.message}`,
        type: "error"
      });
      console.log(e);
    }
  }

  return (
    <div className="refundable_game_card">
      <p className="title">Game #{gameId}</p>
      <button className="claim_btn btn-shadow btn-hover-pointer" onClick={() => handleClaimRefund()}>
        Claim {Moralis.Units.FromWei(amount, 18)} {currencySymbol}
      </button>
    </div>
  );
}
