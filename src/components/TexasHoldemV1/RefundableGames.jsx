import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisSubscription } from "react-moralis";
import { Spin } from "antd";
import abis from "../../helpers/contracts";
import { getBakendObjPrefix, getTexasHoldemV1Address } from "../../helpers/networks"
import Refundable from "./Refundable";
import "./style.scss";

export default function RefundableGames() {
  const abi = abis.texas_holdem_v1;
  const { Moralis, isInitialized, chainId, account } = useMoralis();
  const contractAddress = getTexasHoldemV1Address(chainId);
  const backendPrefix = getBakendObjPrefix(chainId);

  const [refundableGames, setRefundableGames] = useState(null);
  const [initialDataFetched, setInitialDataFetched] = useState(false);

  useEffect(() => {
    const fetchPaidIn = async (gameId) => {
      return await Moralis.executeFunction({
        contractAddress,
        functionName: "getPlayerAmountPaidIn",
        abi,
        params: {
          "_player": account,
          "_gameId": String(gameId),
        },
      })
        .then((result) => result)
        .catch((e) => console.log(e.message));
    };

    async function fetchRefundableGames() {
      if (!isInitialized) {
        return;
      }

      const THRefundableGame = Moralis.Object.extend(`${backendPrefix}THRefundableGame`);
      const query = new Moralis.Query(THRefundableGame)
      query.equalTo("confirmed", true).descending("gameId").limit(100);
      const results = await query.find();

      const rs = [];

      for (let i = 0; i < results.length; i++) {
        const gameId = results[i].get("gameId");
        const amount = await fetchPaidIn(gameId);

        if (amount && amount?.toString() !== "0" && !rs.includes({
          gameId, amount
        })) {
          rs.push({
            gameId, amount
          });
        }
      }

      rs.sort((a, b) => +b.gameId - +a.gameId);

      setRefundableGames(rs);
      setInitialDataFetched(true);

      // useMoralisSubscription(`${backendPrefix}THRefundableGame`,
      //   q => q.equalTo("confirmed", true).descending("gameId").limit(100),
      //   {
      //     onEnter: async data => {
      //       const rs = [];

      //       for (let i = 0; i < data.length; i++) {
      //         const gameId = data[i].get("gameId");
      //         const amount = await fetchPaidIn(gameId);

      //         if (amount && amount?.toString() !== "0" && !rs.includes({
      //           gameId, amount
      //         })) {
      //           rs.push({
      //             gameId, amount
      //           });
      //         }
      //       }

      //       rs.sort((a, b) => +b.gameId - +a.gameId);

      //       setRefundableGames(rs);
      //       setInitialDataFetched(true);
      //     },
      //   });
    }

    if (!initialDataFetched) {
      fetchRefundableGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refundableGames, initialDataFetched, isInitialized]);

  if (!refundableGames) {
    return <Spin className="spin_loader" />;
  }

  return (
    <div className="refundable_wrapper">
      <p className="title">Refundable Games</p>
      <p className="desc">Collect refunds from games in which you were the only player</p>
      <div className="refundable_games">
        {refundableGames &&
          refundableGames.map((item) => (
            <Refundable gameId={item.gameId} amount={item.amount} key={`refundable_game_${item.gameId}`} />
          ))
        }
      </div>
    </div>
  );
}
