import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Button, Checkbox, Col, Divider, Form, Radio, Row, Space, Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { PlayingCard } from "../PlayingCards/PlayingCard";
import { Leaderboard } from "./Leaderboard";
import { RankName } from "./RankName";
import { Hand } from "./Hand";
import { GameMetaData } from "./GameMetaData";
import { useGameData } from "../../hooks/useGameData";
import abis from "../../helpers/contracts";
import { openNotification } from "../../helpers/notifications";
import { getTexasHoldemV1Address } from "../../helpers/networks";
import { GameStatus } from "./GameStatus";
import { getRoundStatusText } from "../../helpers/formatters";

export default function Game({ gameId }) {

  const stageName = ['', 'flop', '', 'turn', '', 'river'];

  const { chainId } = useMoralisDapp();
  const { Moralis } = useMoralis();

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);

  const options = {
    contractAddress, abi,
  };

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
    gameHasEnded } = useGameData(gameId);

  const [potentialFinalRiver, setPotentialFinalRiver] = useState([]);
  const [potentialFinalToken, setPotentialFinalToken] = useState([]);
  const [potentialFinalHand, setPotentialFinalHand] = useState([]);
  const [potentialFinalHandScore, setPotentialFinalHandScore] = useState(-1);

  const handleHandPlayed = async (t) => {
    let cost = gameData.round1Price;
    let functionName = "addNFTFlop";
    if (gameData.status === 4) {
      cost = gameData.round2Price;
      functionName = "addNFTTurn";
    }
    const opts = {
      ...options,
      functionName,
      msgValue: String(cost),
      params: {
        _tokenId: String(t),
        _gameId: String(gameId),
      },
    };

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
  };

  const handlePlayFinalHand = async (values) => {

    if (!values.river_cards) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Require 3 River cards!`,
        type: "error"
      });
      return;
    }

    if (values.river_cards.length !== 3) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Supplied ${values.river_cards.length} River cards. Require 3!`,
        type: "error"
      });
      return;
    }

    if (!values.final_token) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Final Token required!`,
        type: "error"
      });
      return;
    }

    const opts = {
      ...options,
      functionName: "playFinalHand",
      params: {
        _tokenId: String(values.final_token),
        _gameId: String(gameId),
        cardIds: values.river_cards,
      },
    };

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
  };

  const handleEndGame = async () => {
    const opts = {
      ...options,
      functionName: "endGame",
      params: {
        _gameId: String(gameId),
      },
    };

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
  };

  const handlePotentialFinalHandScore = async () => {
    setPotentialFinalHandScore(-1);
    if (potentialFinalToken.length === 2 && potentialFinalRiver.length === 3) {
      const hand = [
        String(potentialFinalToken[0]),
        String(potentialFinalToken[1]),
        String(potentialFinalRiver[0]),
        String(potentialFinalRiver[1]),
        String(potentialFinalRiver[2])
      ];

      setPotentialFinalHand(hand.sort((a, b) => a - b));

      const rank = await Moralis.executeFunction({
        functionName: "calculateHandRank",
        params: {
          "hand": hand,
        },
        ...options
      })
        .then((result) => result)
        .catch((e) => console.log(e.message));

      setPotentialFinalHandScore(rank);
    }
  };

  const handleFinalTokenChange = list => {
    setPotentialFinalToken(list);
  };

  const handleRiverCheckboxChange = list => {
    setPotentialFinalRiver(list);
  };

  if (!gameData) {
    // return <>Loading</>;
    return <Spin className="spin_loader" />;
  }

  if (gameData?.status === 0) {
    return <>Initialising on chain data</>;
  }

  return (
    <div key={`game_inner_container_${gameId}`} className="game-board">
      <div className="game-board--left_panel">
        <Form
          name="final_hand"
          onFinish={handlePlayFinalHand}
          autoComplete="off"
        >
          <div className={gameData.status === 6 ? "border-none" : ""}>
            {/* <GameStatus status={gameData.status} gameHasEnded={gameHasEnded} key={`game_status_${gameId}`} /> */}
            {
              (gameData.status > 1 && gameData.status < 6) && !gameHasEnded && <>
                <div>{getRoundStatusText(gameData.status % 2 === 0 ? gameData.status : gameData.status - 1)}</div>

                <Form.Item name={`river_cards`}>
                  <div>
                    {cardsDealt.map((item, idx) => (
                      <div key={`river_col_${item}_${gameId}`}>
                        <PlayingCard cardId={item} key={`card_in_river${item}_${gameId}`} />
                      </div>
                    ))}
                  </div>
                </Form.Item>
              </>
            }

            {
              gameData.status === 6 && !gameHasEnded && finalHand.card1 < 0 && <>
                <div className="river_stage-header">
                  <p className="title">Select your final hand</p>
                  <p className="desc">Select one of your available hands plus three cards from the river.</p>
                </div>

                {
                  lastRoundPlayed !== 6 &&
                  <>
                    <p className="river_stage-sub_title">Available Hands</p>

                    <Form.Item
                      name={"final_token"}
                    >
                      <Radio.Group>
                        <div className="available_hands-wrapper">
                          {
                            playableHands.map((nft, index) => (
                              <Hand nft={nft} key={`hand_${nft.token_id}_${gameId}`}>
                                <Radio.Button
                                  key={`final_hand_token_${nft.token_id}`}
                                  value={nft.token_id}
                                  onClick={() => handleFinalTokenChange([nft.card1, nft.card2])}
                                >
                                  {/* #{nft.token_id} */}
                                </Radio.Button>
                              </Hand>
                            ))
                          }
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  </>
                }

                <p className="river_stage-sub_title">{getRoundStatusText(gameData.status)}</p>

                <Form.Item name={`river_cards`}>
                  <Checkbox.Group onChange={handleRiverCheckboxChange}>
                    {
                      cardsDealt.map((item, idx) => (
                        <div key={`river_col_${item}_${gameId}`}>
                          <PlayingCard cardId={item} key={`card_in_river${item}_${gameId}`} />
                          <>
                            {
                              lastRoundPlayed !== 6 && <>
                                <br />
                                <Checkbox value={String(item)} key={`checkbox_river${item}_${gameId}`} />
                              </>
                            }
                          </>
                        </div>
                      ))
                    }
                  </Checkbox.Group>
                </Form.Item>

                {
                  lastRoundPlayed !== 6 && <div className="final_hand-btn--wrapper">
                    <Button className={`final_hand-btn submit`} htmlType="submit">
                      Submit Final Hand
                    </Button>

                    {/* <Button className={`final_hand-btn check`} onClick={() => handlePotentialFinalHandScore()}>
                      Check Final Hand
                    </Button> */}
                  </div>
                }
              </>
            }

            {
              gameData?.status === 6 && !gameHasEnded && finalHand.card1 >= 0 && <div className="waiting_section">
                <p className="title">Waiting for all players to submit their final hand.</p>
                <p className="sub_title">Winners revealed in:</p>
              </div>
            }

            <GameMetaData
              key={`game_metadata_${gameId}`}
              gameData={gameData}
              gameId={gameId}
              feesPaid={feesPaid}
              playersPerRound={playersPerRound}
              numHands={numHands}
              numFinalHands={numFinalHands}
              gameHasEnded={gameHasEnded}
              countdown={true} />

            {
              gameHasEnded &&
              <div className="leaderboard-wrapper">
                <p className="title">Leaderboard</p>
                <Leaderboard gameId={gameId} showWinnings={true} key={`leaderboard_game_${gameId}`} />
                <p className="desc">Click on this button to distribute winnings to all players on the leaderboard.</p>
                <Button className="distribute_btn" onClick={() => handleEndGame()}>
                  Distribute Pot
                </Button>
              </div>
            }
          </div>

          <div>
            {
              !gameHasEnded && lastRoundPlayed !== 6 && gameData.status !== 6 &&
              <>
                <p style={{ color: "white" }} className="title">Available Hands</p>

                {/* <p style={{ color: "white" }}>Your available hands include those that do not contain cards already dealt, or that you have already played this round</p>
                <p style={{ color: "white" }}>For the Turn and Final Hand rounds, only hands played during the previous round are available</p> */}

                {(gameData.status === 1 || gameData.status === 3 || gameData.status === 5) && <p style={{ color: "white" }} className="desc">These are your available hands. You’ll be able to play them once the {stageName[gameData.status]} is dealt.</p>}

                {(gameData.status === 2 || gameData.status === 4) && <p style={{ color: "white" }} className="desc">Choose which hand(s) to play.</p>}

                <Form.Item
                  name={"final_token"}
                >
                  <div className="available_hands-wrapper">
                    {
                      playableHands.map((nft, index) => (
                        <Hand nft={nft} key={`hand_${nft.token_id}_${gameId}`}>
                          <>
                            {
                              (gameData.status === 2 || gameData.status === 4) && <>
                                <Button onClick={() => handleHandPlayed(nft.token_id)} key={`play_button_${nft.token_id}`}>Play</Button>
                              </>
                            }
                          </>
                        </Hand>
                      ))
                    }
                  </div>
                </Form.Item>
              </>
            }
          </div>

          {
            gameData.status === 6 && !gameHasEnded && lastRoundPlayed !== 6 &&
            <>
              {/* <div>
                {
                  potentialFinalHandScore > -1 &&
                  <>
                    Potential final hand score:{" "}
                    {potentialFinalHandScore}{" "}

                    <RankName rank={potentialFinalHandScore} key={`potential_rank_${gameId}_${potentialFinalHandScore}`} />

                    <Row>
                      <Space>
                        {
                          potentialFinalHand.map((item, idx) => (
                            <Col key={`potential_final_hand_col_${item}_${gameId}`}>
                              <PlayingCard cardId={item} key={`potential_final_hand_card${item}_${gameId}`} width={35} />
                            </Col>
                          ))
                        }
                      </Space>
                    </Row>
                  </>
                }
              </div> */}
            </>
          }
        </Form>
      </div>

      <div className="game-board--right_panel">
        {gameData.status === 6 && gameHasEnded && <p className="game_info-title">Game Info</p>}
        <GameMetaData
          key={`game_metadata_${gameId}`}
          gameData={gameData}
          gameId={gameId}
          feesPaid={feesPaid}
          playersPerRound={playersPerRound}
          numHands={numHands}
          numFinalHands={numFinalHands}
          gameHasEnded={gameHasEnded}
          countdown={false} />

        {
          handsPlayed[2].hands.length > 0 &&
          <div key={`game_flop_container_${gameId}`} className="played_cards-wrapper">
            <p>Played in Flop</p>
            {
              handsPlayed[2].hands.map((hand, index) => (
                // <div key={`flop_row_${index}_${gameId}_${hand.card1}_${hand.card2}`}>
                <div key={`flop_col_${index}_${gameId}_${hand.card1}_${hand.card2}`} className="played_cards">
                  <PlayingCard cardId={hand.card1} key={`flop_card_${index}_card1_${gameId}`} />
                  <PlayingCard cardId={hand.card2} key={`flop_card_${index}_card2_${gameId}`} />
                </div>
                // </div>
              ))
            }
          </div>
        }

        {
          handsPlayed[4].hands.length > 0 &&
          <div key={`game_turn_container_${gameId}`} className="played_cards-wrapper">
            <p>Played in Turn</p>
            {
              handsPlayed[4].hands.map((hand, index) => (
                // <div key={`turn_row_${index}_${gameId}`}>
                <div key={`turn_col_${index}_${gameId}`} className="played_cards">
                  <PlayingCard cardId={hand.card1} key={`turn_card_${index}_card1_${gameId}`} />
                  <PlayingCard cardId={hand.card2} key={`turn_card_${index}_card2_${gameId}`} />
                </div>
                // </div>
              ))
            }
          </div>
        }

        {
          gameData.status === 6 &&
          <div key={`game_river_container_${gameId}`} className="played_cards-wrapper">
            <p>Played in River</p>
            {
              finalHand.card1 >= 0 && <div>
                <PlayingCard cardId={finalHand.card1} key={`final_hand_card1_${gameId}`} />
                <PlayingCard cardId={finalHand.card2} key={`final_hand_card2_${gameId}`} />
                <PlayingCard cardId={finalHand.card3} key={`final_hand_card3_${gameId}`} />
                <PlayingCard cardId={finalHand.card4} key={`final_hand_card4_${gameId}`} />
                <PlayingCard cardId={finalHand.card5} key={`final_hand_card5_${gameId}`} />
              </div>
            }
          </div>
        }

        {/* <div key={`game_final_hand_container_${gameId}`}>
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
        </div> */}
      </div>

      {/* uncompleted code block */}
      {/* <Row>
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

      <Divider /> */}

      {/* <Row style={{ width: "100%" }}>
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
                                  {
                                    gameData.status === 6 && !gameHasEnded && lastRoundPlayed !== 6 && <>
                                      <br />
                                      <Checkbox value={String(item)} key={`checkbox_river${item}_${gameId}`} />
                                    </>
                                  }
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
                      handsPlayed[2].hands && handsPlayed[2].hands.map((hand, index) => (
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
                      handsPlayed[4].hands && handsPlayed[4].hands.map((hand, index) => (
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
            <>
              {
                gameData.status === 6 && !gameHasEnded && lastRoundPlayed !== 6 &&
                <>
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
                </>
              }
            </>
          </Form>
        </Col>
      </Row> */}
    </div >
  );
}