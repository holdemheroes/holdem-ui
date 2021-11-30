import { useGameData } from "../../hooks/useGameData"
import { Button, Checkbox, Col, Divider, Form, Radio, Row, Space } from "antd"
import React, { useState } from "react"
import { PlayingCard } from "../PlayingCards/PlayingCard"
import { useMoralis } from "react-moralis"
import { openNotification } from "../../helpers/notifications"
import { Leaderboard } from "./Leaderboard"
import { RankName } from "./RankName"
import { Hand } from "./Hand"
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider"
import abis from "../../helpers/contracts"
import { getTexasHoldemV1Address } from "../../helpers/networks"
import { GameMetaData } from "./GameMetaData"

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px",
  },
};

export default function Game({ gameId }) {

  const { chainId } = useMoralisDapp();
  const { Moralis } = useMoralis()

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);

  const options = {
    contractAddress, abi,
  }

  const {
    gameData,
    cardsDealt,
    handsPlayed,
    lastRoundPlayed,
    playableHands,
    feesPaid,
    playersPerRound,
    numHands,
    numFinalHands,
    finalHand,
    gameHasEnded } = useGameData(gameId)

  const [potentialFinalRiver, setPotentialFinalRiver] = useState([])
  const [potentialFinalToken, setPotentialFinalToken] = useState([])
  const [potentialFinalHand, setPotentialFinalHand] = useState([])
  const [potentialFinalHandScore, setPotentialFinalHandScore] = useState(-1)

  const handleHandPlayed = async (t) => {
    let cost = gameData.round1Price
    let functionName = "addNFTFlop"
    if (gameData.status === 4) {
      cost = gameData.round2Price
      functionName = "addNFTTurn"
    }
    const opts = {
      ...options,
      functionName,
      msgValue: String(cost),
      params: {
        _tokenId: String(t),
        _gameId: String(gameId),
      },
    }

    const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
    tx.on("transactionHash", (hash) => {
      openNotification({
        message: "🔊 Hand played!",
        description: `📃 Tx Hash: ${hash}`,
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

  const handlePlayFinalHand = async (values) => {

    if (!values.river_cards) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Require 3 River cards!`,
        type: "error"
      })
      return
    }

    if (values.river_cards.length !== 3) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Supplied ${values.river_cards.length} River cards. Require 3!`,
        type: "error"
      })
      return
    }

    if (!values.final_token) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Final Token required!`,
        type: "error"
      })
      return
    }

    const opts = {
      ...options,
      functionName: "playFinalHand",
      params: {
        _tokenId: String(values.final_token),
        _gameId: String(gameId),
        cardIds: values.river_cards,
      },
    }

    const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
    tx.on("transactionHash", (hash) => {
      openNotification({
        message: "🔊 Final Hand played!",
        description: `📃 Tx Hash: ${hash}`,
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

  const handleEndGame = async () => {
    const opts = {
      ...options,
      functionName: "endGame",
      params: {
        _gameId: String(gameId),
      },
    }

    const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
    tx.on("transactionHash", (hash) => {
      openNotification({
        message: "🔊 End game requested!",
        description: `📃 Tx Hash: ${hash}`,
        type: "success"
      });
    })
      .on("error", (error) => {
        console.log(error);
      });
  }

  const handlePotentialFinalHandScore = async () => {
    setPotentialFinalHandScore(-1)
    if (potentialFinalToken.length === 2 && potentialFinalRiver.length === 3) {
      const hand = [
        String(potentialFinalToken[0]),
        String(potentialFinalToken[1]),
        String(potentialFinalRiver[0]),
        String(potentialFinalRiver[1]),
        String(potentialFinalRiver[2])
      ]

      setPotentialFinalHand(hand.sort((a, b) => a - b))

      const rank = await Moralis.executeFunction({
        functionName: "calculateHandRank",
        params: {
          "hand": hand,
        },
        ...options
      })
        .then((result) => result)
        .catch((e) => console.log(e.message))

      setPotentialFinalHandScore(rank)
    }
  }

  const handleFinalTokenChange = list => {
    setPotentialFinalToken(list)
  }
  const handleRiverCheckboxChange = list => {
    setPotentialFinalRiver(list)
  };

  if (!gameData) {
    return <>Loading</>
  }

  if (gameData?.status === 0) {
    return <>Initialising on chain data</>
  }

  return (
    <div key={`game_inner_container_${gameId}`}>
      <Row>
        <Col>
          <GameMetaData
            key={`game_metadata_${gameId}`}
            gameData={gameData}
            gameId={gameId}
            feesPaid={feesPaid}
            playersPerRound={playersPerRound}
            numHands={numHands}
            numFinalHands={numFinalHands}
            gameHasEnded={gameHasEnded} />

        </Col>
        <Col>
          {
            (finalHand.card1 >= 0 || gameHasEnded) &&
            <div>
              <h4>Leaderboard</h4>
              <Leaderboard gameId={gameId} key={`leaderboard_game_${gameId}`} />
            </div>
          }
          <>
            {gameData.status === 6 && gameHasEnded && <>
              <Button type="primary" onClick={() => handleEndGame()}>
                End Game
              </Button>
            </>}
          </>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col>
          <Form
            name="final_hand"
            onFinish={handlePlayFinalHand}
            autoComplete="off"
          >
            <div>
              <Row>
                <Space align={"start"}>
                  <Col>
                    <h4>River</h4>
                    <Form.Item
                      name={`river_cards`}
                    >
                      <Checkbox.Group onChange={handleRiverCheckboxChange}>
                        <Row>
                          <Space>
                            {cardsDealt.map((item, idx) => (
                              <Col key={`river_col_${item}_${gameId}`}>
                                <PlayingCard cardId={item} key={`card_in_river${item}_${gameId}`} />
                                <>
                                  {gameData.status === 6 && !gameHasEnded && lastRoundPlayed !== 6 && <><br />

                                    <Checkbox value={String(item)} key={`checkbox_river${item}_${gameId}`} />

                                  </>}
                                </>
                              </Col>
                            ))}
                          </Space>
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                  <Col key={`game_flop_container_${gameId}`}>
                    <h4>Played in Flop</h4>
                    <div>Paid in: {Moralis.Units.FromWei(feesPaid[2].me)}</div>
                    {
                      handsPlayed[2].hands &&
                      handsPlayed[2].hands.map((hand, index) => (
                        <Row key={`flop_row_${index}_${gameId}_${hand.card1}_${hand.card2}`}>
                          <Col key={`flop_col_${index}_${gameId}_${hand.card1}_${hand.card2}`}>
                            <PlayingCard cardId={hand.card1} key={`flop_card_${index}_card1_${gameId}`} />
                            <PlayingCard cardId={hand.card2} key={`flop_card_${index}_card2_${gameId}`} />
                          </Col>
                        </Row>
                      ))
                    }
                  </Col>
                  <Col key={`game_turn_container_${gameId}`}>
                    <h4>Played in Turn</h4>
                    <div>Paid in: {Moralis.Units.FromWei(feesPaid[4].me)}</div>
                    {
                      handsPlayed[4].hands &&
                      handsPlayed[4].hands.map((hand, index) => (
                        <Row key={`turn_row_${index}_${gameId}`}>
                          <Col key={`turn_col_${index}_${gameId}`}>
                            <PlayingCard cardId={hand.card1} key={`turn_card_${index}_card1_${gameId}`} />
                            <PlayingCard cardId={hand.card2} key={`turn_card_${index}_card2_${gameId}`} />
                          </Col>
                        </Row>
                      ))
                    }
                  </Col>
                  <Col key={`game_final_hand_container_${gameId}`}>
                    <h4>Final Hand</h4>
                    {
                      finalHand.card1 >= 0 && <div>
                        <Row>
                          <Col>
                            Rank: <RankName rank={finalHand.rank} /> ({finalHand.rank})
                          </Col>
                        </Row>
                        <Space>
                          <Row>
                            <Col>
                              <PlayingCard cardId={finalHand.card1} key={`final_hand_card1_${gameId}`} />
                            </Col>
                            <Col>
                              <PlayingCard cardId={finalHand.card2} key={`final_hand_card2_${gameId}`} />
                            </Col>
                            <Col>
                              <PlayingCard cardId={finalHand.card3} key={`final_hand_card3_${gameId}`} />
                            </Col>
                            <Col>
                              <PlayingCard cardId={finalHand.card4} key={`final_hand_card4_${gameId}`} />
                            </Col>
                            <Col>
                              <PlayingCard cardId={finalHand.card5} key={`final_hand_card5_${gameId}`} />
                            </Col>
                          </Row>
                        </Space>
                      </div>
                    }
                  </Col>
                </Space>
              </Row>
            </div>
            {!gameHasEnded && lastRoundPlayed !== 6 &&

              <>
                <h4>Available Hands</h4>

                <p>Your available hands include those that do not contain cards already dealt, or that you have already played this round</p>

                <p>For the Turn and Final Hand rounds, only hands played during the previous round are available</p>
                <Form.Item
                  name={"final_token"}
                >
                  <Radio.Group>
                    <div style={styles.NFTs}>
                      {
                        playableHands.map((nft, index) => (
                          <Hand nft={nft} key={`hand_${nft.token_id}_${gameId}`}>
                            <>
                              {gameData.status === 6 && !gameHasEnded && lastRoundPlayed !== 6 && <>

                                <Radio.Button
                                  key={`final_hand_token_${nft.token_id}`}
                                  value={nft.token_id}
                                  onClick={() => handleFinalTokenChange([nft.card1, nft.card2])}
                                >
                                  #{nft.token_id}
                                </Radio.Button>
                              </>}
                            </>
                            <>
                              {(gameData.status === 2 || gameData.status === 4) && <>
                                <Button onClick={() => handleHandPlayed(nft.token_id)} key={`play_button_${nft.token_id}`}>Play #{nft.token_id}</Button>
                              </>}
                            </>
                          </Hand>
                        ))}
                    }
                    </div>
                  </Radio.Group>
                </Form.Item>
              </>

            }
            <>
              {gameData.status === 6 && !gameHasEnded && lastRoundPlayed !== 6 && <>
                <p>Select one hand plus three cards from the River to play your final hand</p>
                <Button type="primary" htmlType="submit">
                  Submit Final Hand
                </Button>
                <Button onClick={() => handlePotentialFinalHandScore()}>
                  Check Final Hand
                </Button>
                <div>
                  {
                    potentialFinalHandScore > -1 &&
                    <>
                      Potential final hand score:{" "}
                      {potentialFinalHandScore}{" "}
                      <RankName rank={potentialFinalHandScore} key={`potential_rank_${gameId}_${potentialFinalHandScore}`} />
                      <Row>
                        <Space>
                          {potentialFinalHand.map((item, idx) => (
                            <Col key={`potential_final_hand_col_${item}_${gameId}`}>
                              <PlayingCard cardId={item} key={`potential_final_hand_card${item}_${gameId}`} width={35} />
                            </Col>
                          ))}
                        </Space>
                      </Row>
                    </>
                  }
                </div>
              </>}
            </>
          </Form>
        </Col>
      </Row>
    </div>
  )
}