import React from "react";
import { useMoralis } from "react-moralis";
import Countdown from "react-countdown";
import { Table } from "antd";
import { getDealRequestedText, getRoundStatusText } from "../../helpers/formatters";

export const GameMetaData = ({ gameId, gameData, feesPaid, playersPerRound, numFinalHands, numHands, gameHasEnded, countdown = false }) => {

  const { Moralis } = useMoralis();

  // const columns = [
  //   {
  //     title: 'Round',
  //     dataIndex: 'round',
  //     key: 'round',
  //   },
  //   {
  //     title: 'My Bet',
  //     dataIndex: 'my_bet',
  //     key: 'my_bet',
  //   },
  //   {
  //     title: '# Players',
  //     dataIndex: 'num_players',
  //     key: 'num_players',
  //   },
  //   {
  //     title: '# Hands',
  //     dataIndex: 'num_hands',
  //     key: 'num_hands',
  //   },
  //   {
  //     title: 'Total Bet',
  //     dataIndex: 'total_bet',
  //     key: 'total_bet',
  //   },
  // ];

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

  // const dataSource = [
  //   {
  //     key: '2',
  //     round: 'Flop',
  //     total_bet: Moralis.Units.FromWei(feesPaid[2].total, 18),
  //     my_bet: Moralis.Units.FromWei(feesPaid[2].me, 18),
  //     num_players: playersPerRound[2].length,
  //     num_hands: numHands[2],
  //   },
  //   {
  //     key: '4',
  //     round: 'Turn',
  //     total_bet: Moralis.Units.FromWei(feesPaid[4].total, 18),
  //     my_bet: Moralis.Units.FromWei(feesPaid[4].me, 18),
  //     num_players: playersPerRound[4].length,
  //     num_hands: numHands[4],
  //   },
  //   {
  //     key: '6',
  //     round: 'River',
  //     total_bet: "",
  //     my_bet: "",
  //     num_players: numFinalHands,
  //     num_hands: numFinalHands,
  //   },
  //   {
  //     key: '8',
  //     round: 'Total Pot',
  //     total_bet: Moralis.Units.FromWei(gameData.totalPaidIn, 18),
  //     my_bet: "",
  //     num_players: "",
  //     num_hands: "",
  //   },
  // ];

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
  ];

  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return null;
    } else {
      // Render a countdown
      return (
        <div className="countdown">
          <div>
            <div>{hours < 10 ? "0" + hours : hours}</div>
            <div>hrs</div>
          </div>
          <div>
            <div>{minutes < 10 ? "0" + minutes : minutes}</div>
            <div>min</div>
          </div>
          <div>
            <div>{seconds < 10 ? "0" + seconds : seconds}</div>
            <div>sec</div>
          </div>
        </div>
      );
    }
  };

  if (countdown) {
    return (
      <div>
        {
          (gameData.status === 1 || gameData.status === 3 || gameData.status === 5) && gameData.gameStartTime > 0 && <div className="dealt_in_time">
            <div>{getRoundStatusText(gameData.status)}</div>
            <>
              {
                gameData.status === 1 && <Countdown date={(gameData.gameStartTime * 1000) + 200000} renderer={renderer} />
              }
              {
                gameData.status === 3 && <Countdown date={(gameData.roundEndTime * 1000) + 200000} renderer={renderer} />
              }
              {
                gameData.status === 5 && <Countdown date={(gameData.roundEndTime * 1000) + 200000} renderer={renderer} />
              }
            </>
          </div>
        }
        {
          (gameData.status === 2 || gameData.status === 4 || gameData.status === 6) && !gameHasEnded &&
          <div className="end_in_time">
            <div>{getDealRequestedText(gameData.status)} ends in:</div>
            <Countdown date={(gameData.roundEndTime * 1000)} renderer={renderer} />
          </div>
        }
      </div>
    )
  }

  return (
    <>
      <div className="bet_price-info">
        <p style={{ color: "white" }}>{`Flop Bet Per NFT: ${Moralis.Units.FromWei(gameData.round1Price, 18)}`}</p>
        <p style={{ color: "white" }}>{`Turn Bet Per NFT: ${Moralis.Units.FromWei(gameData.round2Price, 18)}`}</p>
      </div>

      {/* <Table
        dataSource={dataSource_r}
        columns={columns_r}
        pagination={false}
        // bordered
        size={"small"}
      /> */}
      <div className="game_info-table--wrapper">
        <table className="game_info-table">
          <thead>
            <tr>
              {columns_r.map((item) => (
                <td key={item.key}>{item.title}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataSource_r.map((item) => {
              return (
                <tr key={item.key}>
                  <td>{item.item}</td>
                  <td>{item.flop}</td>
                  <td>{item.turn}</td>
                  <td>{item.river}</td>
                  <td>{item.total_pot}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}