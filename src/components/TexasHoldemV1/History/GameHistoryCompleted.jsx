import { Leaderboard } from "../Leaderboard";
import React from "react";
import { Col, Row, } from "antd";
import { GameHistoryHandsPlayed } from "./GameHistoryHandsPlayed";
import Moment from "react-moment";
import { getExplorer } from "../../../helpers/networks";
import { getEllipsisTxt } from "../../../helpers/formatters";
import { useMoralisDapp } from "../../../providers/MoralisDappProvider/MoralisDappProvider";

export const GameHistoryCompleted = ({ gameId, gameStartedData, gameEndedData }) => {

  const { chainId } = useMoralisDapp();

  return (
    <div>
      <p style={{ color: "white" }}>
        This game started on{" "}
        <Moment format="YYYY/MM/DD HH:mm:ss">{gameStartedData.timestamp.toString()}</Moment> in
        Tx <a
          href={`${getExplorer(chainId)}/tx/${gameStartedData.txHash}`}
          target={"_blank"}
          rel={"noreferrer"}>
          {getEllipsisTxt(gameStartedData.txHash, 8)}
        </a>.
      </p>
      <p style={{ color: "white" }}>
        This game ended and the winnings paid out on{" "}
        <Moment format="YYYY/MM/DD HH:mm:ss">{gameEndedData.timestamp.toString()}</Moment> in
        Tx <a
          href={`${getExplorer(chainId)}/tx/${gameEndedData.txHash}`}
          target={"_blank"}
          rel={"noreferrer"}>
          {getEllipsisTxt(gameEndedData.txHash, 8)}
        </a>.
      </p>
      <Row>
        <Col>
          <h3>Final Hands and Leaderboard</h3>
          <Leaderboard gameId={gameId} showWinnings={true} />
        </Col>
      </Row>
      <Row>
        <Col>
          <GameHistoryHandsPlayed
            gameId={gameId}
            round1Price={gameStartedData.round1Price}
            round2Price={gameStartedData.round2Price}
            finished={true}
          />
        </Col>
      </Row>
    </div>
  );
}
