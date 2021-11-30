import React, { useState, useEffect } from "react"
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider"
import abis from "../../helpers/contracts"
import { getTexasHoldemV1Address } from "../../helpers/networks"
import { useMoralis } from "react-moralis"
import Refundable from "./Refundable"
import { Spin } from "antd"

export default function RefundableGames() {
  const { chainId, walletAddress } = useMoralisDapp();
  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);
  const { Moralis, isInitialized } = useMoralis()

  const [refundableGames, setRefundableGames] = useState(null)
  const [initialDataFetched, setInitialDataFetched] = useState(false)

  useEffect(() => {

    const fetchPaidIn = async (gameId) => {
      return await Moralis.executeFunction({
        contractAddress,
        functionName: "getPlayerAmountPaidIn",
        abi,
        params: {
          "_player": walletAddress,
          "_gameId": String(gameId),
        },
      })
        .then((result) => result)
        .catch((e) => console.log(e.message));
    };

    async function fetchRefundableGames() {
      if (!isInitialized) {
        return
      }

      const THRefundableGame = Moralis.Object.extend("THRefundableGame");
      const query = new Moralis.Query(THRefundableGame)
      query.descending("gameId")
      query.limit(100);
      const results = await query.find();

      const rs = []

      for (let i = 0; i < results.length; i += 1) {
        const gameId = results[i].get("gameId")
        const amount = await fetchPaidIn(gameId)
        if (amount && amount !== "0" && !rs.includes({
          gameId, amount
        })) {
          rs.push({
            gameId, amount
          })
        }
      }
      setRefundableGames(rs)
      setInitialDataFetched(true)

    }

    if (!initialDataFetched) {
      fetchRefundableGames()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refundableGames, initialDataFetched, isInitialized]);

  if (!refundableGames) {
    return <Spin className="spin_loader" />;
  }

  return (
    <div>
      <h2>Refundable Games</h2>
      {refundableGames &&
        refundableGames.map((item) => (
          <Refundable gameId={item.gameId} amount={item.amount} key={`refundable_game_${item.gameId}`} />
        ))
      }

    </div>
  )
}