import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Button, Checkbox, Form, Radio, Spin, Tooltip } from "antd";
import { PlayingCard } from "../PlayingCards/PlayingCard";
import { Leaderboard } from "./Leaderboard";
import { Hand } from "./Hand";
import { GameMetaData } from "./GameMetaData";
import { useGameData } from "../../hooks/useGameData";
import abis from "../../helpers/contracts";
import { openNotification } from "../../helpers/notifications";
import { getBakendObjPrefix, getTexasHoldemV1Address } from "../../helpers/networks"
import { getRoundStatusText } from "../../helpers/formatters";

export default function Game({ gameId }) {

  const stageName = ['', 'flop', '', 'turn', '', 'river'];

  const { Moralis, chainId } = useMoralis();
  const backendPrefix = getBakendObjPrefix(chainId)

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
    gameHasEnded } = useGameData(gameId, backendPrefix);

  const [potentialFinalRiver, setPotentialFinalRiver] = useState([]);
  const [potentialFinalToken, setPotentialFinalToken] = useState([]);
  // eslint-disable-next-line
  const [potentialFinalHand, setPotentialFinalHand] = useState([]);
  // eslint-disable-next-line
  const [potentialFinalHandScore, setPotentialFinalHandScore] = useState(-1);

  const [checkedNum, setCheckedNum] = useState(0);
  const [checkStatus, setCheckStatus] = useState([0, 0, 0, 0, 0]);

  const handleOnClick = (e, idx) => {
    if (e.target.checked) { setCheckedNum(checkedNum + 1); } else { setCheckedNum(checkedNum - 1); }

    let tmp = checkStatus.map((item, index) => {
      return (idx === index) ? (1 - item) : item;
    });

    setCheckStatus([...tmp]);
  }

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

    try {
      const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
      openNotification({
        message: "🔊 Hand Played",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success"
      });
    } catch (e) {
      openNotification({
        message: "🔊 Error",
        description: `📃 ${e.message}`,
        type: "error"
      });
      console.log(e);
    }

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

    try {
      const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
      openNotification({
        message: "🔊 Final Hand Played",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success"
      });
    } catch (e) {
      openNotification({
        message: "🔊 Error",
        description: `📃 ${e.message}`,
        type: "error"
      });
      console.log(e);
    }
  };

  const handleEndGame = async () => {
    const opts = {
      ...options,
      functionName: "endGame",
      params: {
        _gameId: String(gameId),
      },
    };

    try {
      const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
      openNotification({
        message: "🔊 End Game Requested",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success"
      });
    } catch (e) {
      openNotification({
        message: "🔊 Error",
        description: `📃 ${e.message}`,
        type: "error"
      });
      console.log(e);
    }

  };

  // eslint-disable-next-line
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
    return <Spin className="spin_loader" />;
  }

  if (gameData?.status === 0) {
    return <div className="initialising_on_chain_data">Initialising on chain data</div>;
  }

  function handMatchesDealt(h) {
    return cardsDealt.some((item, index) => (h.card1 === item || h.card2 === item));
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
                                <Checkbox value={String(item)} key={`checkbox_river${item}_${gameId}`} onClick={(e) => handleOnClick(e, idx)} disabled={checkedNum === 3 && !checkStatus[idx]} />
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
                <Leaderboard gameId={gameId} showWinnings={false} key={`leaderboard_game_${gameId}`} />
                <p className="desc">Distribute Winnings to all players on the Leaderboard.</p>
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
                                {
                                  handMatchesDealt(nft) ? <Tooltip title="A card in this hand has already been dealt"><Button onClick={() => handleHandPlayed(nft.token_id)} key={`play_button_${nft.token_id}`} disabled={true}>Play</Button></Tooltip> :
                                    <Button onClick={() => handleHandPlayed(nft.token_id)} key={`play_button_${nft.token_id}`}>Play</Button>
                                }
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
            <></>
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
                <div key={`flop_col_${index}_${gameId}_${hand.card1}_${hand.card2}`} className="played_cards">
                  <PlayingCard cardId={hand.card1} key={`flop_card_${index}_card1_${gameId}`} />
                  <PlayingCard cardId={hand.card2} key={`flop_card_${index}_card2_${gameId}`} />
                </div>
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
                <div key={`turn_col_${index}_${gameId}`} className="played_cards">
                  <PlayingCard cardId={hand.card1} key={`turn_card_${index}_card1_${gameId}`} />
                  <PlayingCard cardId={hand.card2} key={`turn_card_${index}_card2_${gameId}`} />
                </div>
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
      </div>
    </div >
  );
}
