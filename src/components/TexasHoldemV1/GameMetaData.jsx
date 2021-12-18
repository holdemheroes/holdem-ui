import React from "react";
import { useMoralis } from "react-moralis";
import Countdown from "react-countdown";
import { Descriptions, Table } from "antd";
import { GameStatus } from "./GameStatus";
import { getDealRequestedText } from "../../helpers/formatters";

export const GameMetaData = ({ gameId, gameData, feesPaid, playersPerRound, numFinalHands, numHands, gameHasEnded }) => {

  const { Moralis } = useMoralis();

  const columns = [
    {
      title: 'Round',
      dataIndex: 'round',
      key: 'round',
    },
    {
      title: 'My Bet',
      dataIndex: 'my_bet',
      key: 'my_bet',
    },
    {
      title: '# Players',
      dataIndex: 'num_players',
      key: 'num_players',
    },
    {
      title: '# Hands',
      dataIndex: 'num_hands',
      key: 'num_hands',
    },
    {
      title: 'Total Bet',
      dataIndex: 'total_bet',
      key: 'total_bet',
    },
  ];

  const columns_r = [
    {
      title: "",
      dataIndex: "item",
      key: "item",
    },
    {
      title: "Flop",
      dataIndex: "flop",
      key: "flop",
    },
    {
      title: "Turn",
      dataIndex: "turn",
      key: "turn",
    },
    {
      title: "River",
      dataIndex: "river",
      key: "river",
    },
    {
      title: "Total Pot",
      dataIndex: "total_pot",
      key: "total_pot",
    },
  ]

  const dataSource = [
    {
      key: '2',
      round: 'Flop',
      total_bet: Moralis.Units.FromWei(feesPaid[2].total, 18),
      my_bet: Moralis.Units.FromWei(feesPaid[2].me, 18),
      num_players: playersPerRound[2].length,
      num_hands: numHands[2],
    },
    {
      key: '4',
      round: 'Turn',
      total_bet: Moralis.Units.FromWei(feesPaid[4].total, 18),
      my_bet: Moralis.Units.FromWei(feesPaid[4].me, 18),
      num_players: playersPerRound[4].length,
      num_hands: numHands[4],
    },
    {
      key: '6',
      round: 'River',
      total_bet: "",
      my_bet: "",
      num_players: numFinalHands,
      num_hands: numFinalHands,
    },
    {
      key: '8',
      round: 'Total Pot',
      total_bet: Moralis.Units.FromWei(gameData.totalPaidIn, 18),
      my_bet: "",
      num_players: "",
      num_hands: "",
    },
  ];

  const dataSource_r = [
    {
      key: "My Bet",
      item: "My Bet",
      flop: Moralis.Units.FromWei(feesPaid[2].me, 18),
      turn: Moralis.Units.FromWei(feesPaid[4].me, 18),
      river: "",
      total_pot: "",
    },
    {
      key: "Players",
      item: "Players",
      flop: playersPerRound[2].length,
      turn: playersPerRound[4].length,
      river: numFinalHands,
      total_pot: "",
    },
    {
      key: "Hands",
      item: "Hands",
      flop: numHands[2],
      turn: numHands[4],
      river: numFinalHands,
      total_pot: "",
    },
    {
      key: "Total Bet",
      item: "Total Bet",
      flop: Moralis.Units.FromWei(feesPaid[2].total, 18),
      turn: Moralis.Units.FromWei(feesPaid[4].total, 18),
      river: "",
      total_pot: Moralis.Units.FromWei(gameData.totalPaidIn, 18),
    },
  ]

  return (
    <>
      <Descriptions
        title={`Game# ${gameId}`}
        bordered
        size={"small"}
      >
        <Descriptions.Item label="Flop Ante Per NFT:">{Moralis.Units.FromWei(gameData.round1Price, 18)}</Descriptions.Item>
        <Descriptions.Item label="Turn Ante Per NFT:">{Moralis.Units.FromWei(gameData.round2Price, 18)}</Descriptions.Item>
      </Descriptions>

      <Table
        dataSource={dataSource_r}
        columns={columns_r}
        pagination={false}
        bordered
        size={"small"}
      />

      <h4>
        <GameStatus status={gameData.status} gameHasEnded={gameHasEnded} key={`game_status_${gameId}`} />

        {
          (gameData.status === 1 || gameData.status === 3 || gameData.status === 5) && gameData.gameStartTime > 0 &&
          <div>Card will be dealt in approx{" "}

            {
              gameData.status === 1 && <Countdown date={(gameData.gameStartTime * 1000) + 20000} />
            }
            {
              gameData.status === 3 && <Countdown date={(gameData.roundEndTime * 1000) + 20000} />
            }
            {
              gameData.status === 5 && <Countdown date={(gameData.roundEndTime * 1000) + 20000} />
            }
          </div>
        }
        {
          (gameData.status === 2 || gameData.status === 4 || gameData.status === 6) && !gameHasEnded &&
          <div style={{ color: "white" }}>{getDealRequestedText(gameData.status)} ends in{" "}
            <Countdown date={(gameData.roundEndTime * 1000)} />
          </div>
        }
      </h4>
    </>
  );
}