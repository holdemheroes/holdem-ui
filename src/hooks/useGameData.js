import { useMoralis, useMoralisSubscription } from "react-moralis";
import abis from "../helpers/contracts";
import { getTexasHoldemV1Address } from "../helpers/networks"
import { useEffect, useState } from "react";
import { openNotification } from "../helpers/notifications";
import { getDealRequestedText, sortFinalHand } from "../helpers/formatters";
import BN from "bn.js";
import { useMyNFTHands } from "./useMyNFTHands";

export const useGameData = (gameId, backendPrefix) => {
  const { Moralis, chainId, account } = useMoralis();

  const { NFTHands } = useMyNFTHands();

  const abi = abis.texas_holdem_v1;

  const [options, setOptions] = useState(null);
  const [contractAddress, setContractAddress] = useState(getTexasHoldemV1Address(chainId));

  const [gameData, setGameData] = useState(null);
  const [refetchGameData, setRefetchGameData] = useState(false);
  const [cardsDealt, setCardsDealt] = useState([]);
  const [handsPlayed, setHandsPlayed] = useState({
    2: {
      hands: [],
      tokenRefs: []
    },
    4: {
      hands: [],
      tokenRefs: []
    }
  });
  const [handsPlayedFetched, setHandsPlayedFetched] = useState(false);
  const [handsPlayedLoading, setHandsPlayedLoading] = useState(false);

  const [playableHands, setPlayableHands] = useState([]);
  const [lastRoundPlayed, setLastRoundPlayed] = useState(0);

  const [feesPaid, setFeesPaid] = useState({
    2: { me: "0", total: "0" },
    4: { me: "0", total: "0" },
  });
  const [feesPaidFetched, setFeesPaidFetched] = useState(false);
  const [feesPaidLoading, setFeesPaidLoading] = useState(false);

  const [playersPerRound, setPlayersPerRound] = useState({
    2: [],
    4: [],
  });

  const [numHands, setNumHands] = useState({
    2: 0,
    4: 0,
  });

  const [numFinalHands, setNumFinalHands] = useState(0);

  const [finalHand, setFinalHand] = useState({
    card1: -1,
    card2: -1,
    card3: -1,
    card4: -1,
    card5: -1,
    rank: -1,
  });
  const [finalHandFetched, setFinalHandFetched] = useState(false);
  const [finalHandLoading, setFinalHandLoading] = useState(false);

  const [gameHasEnded, setGameHasEnded] = useState(false);

  function handMatchesPlayed(h, round) {
    for (let j = 0; j < handsPlayed[round].tokenRefs.length; j++) {
      if (parseInt(h.token_id, 10) === handsPlayed[round].tokenRefs[j]) {
        return true;
      }
    }
    return false;
  }

  function handMatchesDealt(h) {
    for (let j = 0; j < cardsDealt.length; j += 1) {
      if (h.card1 === cardsDealt[j] || h.card2 === cardsDealt[j]) {
        return true;
      }
    }
    return false;
  }

  function processPlayableHands() {
    const playable = [];
    // handle initial playable hands
    switch (gameData?.status) {
      case 1:
      case 2:
        // can use any of my NFTs that have not yet been dealt or played
        for (let i = 0; i < NFTHands.length; i += 1) {
          const h = NFTHands[i];
          const isDealt = handMatchesDealt(h);
          const playedInFlop = handMatchesPlayed(h, 2);
          if (!isDealt && !playedInFlop) {
            playable.push(h);
          }
        }
        break;
      case 3:
      case 4:
        // can only play hands already added to Flop
        for (let i = 0; i < NFTHands.length; i += 1) {
          const h = NFTHands[i];
          const isDealt = handMatchesDealt(h);
          const playedInFlop = handMatchesPlayed(h, 2);
          const playedInTurn = handMatchesPlayed(h, 4);

          if (!isDealt && playedInFlop && !playedInTurn) {
            playable.push(h);
          }
        }
        break;
      case 5:
      case 6:
        // can only play hands already added to Turn
        for (let i = 0; i < NFTHands.length; i += 1) {
          const h = NFTHands[i];
          const isDealt = handMatchesDealt(h);
          const playedInTurn = handMatchesPlayed(h, 4);

          if (!isDealt && playedInTurn) {
            playable.push(h);
          }
        }
        break;
      default:
        break;
    }

    setPlayableHands(playable);
  }

  function handleOnChainGameData(data) {
    const gameCleaned = {
      gameRoundTimeSeconds: parseInt(data.gameRoundTimeSeconds),
      numCardsDealt: parseInt(data.numCardsDealt),
      numPlayersInRound: parseInt(data.numPlayersInRound),
      refundable: parseInt(data.refundable),
      round1Price: data.round1Price,
      round2Price: data.round2Price,
      gameStartTime: parseInt(data.gameStartTime),
      roundEndTime: parseInt(data.roundEndTime),
      status: parseInt(data.status),
      totalPaidIn: data.totalPaidIn.toString(),
    };

    setGameData(gameCleaned);
  }

  function handleOnChainCardsDealt(cards) {
    const cardsAsInts = [];
    for (let i = 0; i < cards.length; i++) {
      let card = parseInt(cards[i], 10);
      if (cardsAsInts.includes(card)) continue;
      cardsAsInts.push(card);
    }
    setCardsDealt(cardsAsInts);
    processPlayableHands();
  }

  function handleCardDealRequestedEvent(data) {
    const round = parseInt(data.attributes.turnRequested, 10);
    setGameData({ ...gameData, status: round });

    processPlayableHands();

    setRefetchGameData(true);

    openNotification({
      message: "🔊 Deal Requested!",
      description: `${getDealRequestedText(round)} requested in game #${gameId}`,
      type: "info"
    });
  }

  function handleCardDealtEvent(data) {
    const round = parseInt(data.attributes.round, 10);
    const cardId = parseInt(data.attributes.cardId, 10);
    const blockTimestamp = new Date(data.attributes.block_timestamp) / 1000;

    const newCardsDealt = [];

    setGameData({ ...gameData, status: round, roundEndTime: blockTimestamp + gameData.gameRoundTimeSeconds });

    for (let i = 0; i < cardsDealt.length; i++) {
      if (!newCardsDealt.includes(cardsDealt[i])) {
        newCardsDealt.push(cardsDealt[i]);
      }
    }

    if (!newCardsDealt.includes(cardId)) newCardsDealt.push(cardId);

    setCardsDealt(newCardsDealt);

    processPlayableHands();
    setRefetchGameData(true);

    openNotification({
      message: "🔊 Card Dealt!",
      description: `${getDealRequestedText(round)} dealt in game #${gameId}`,
      type: "info"
    });
  }

  function handleHandAddedEvent(data) {
    if (data.attributes.player === account) {
      const round = parseInt(data.attributes.round, 10);
      const tokenId = parseInt(data.attributes.tokenId, 10);
      const handId = parseInt(data.attributes.handId, 10);
      const card1 = parseInt(data.attributes.card1, 10);
      const card2 = parseInt(data.attributes.card2, 10);

      const newHandsPlayed = { ...handsPlayed };
      const hand = {
        round, tokenId, handId, card1, card2
      };

      if (!newHandsPlayed[round].hands.includes(hand)) newHandsPlayed[round].hands.push(hand);
      if (!newHandsPlayed[round].tokenRefs.includes(tokenId)) newHandsPlayed[round].tokenRefs.push(tokenId);

      setHandsPlayed(newHandsPlayed);
      if (round > lastRoundPlayed) {
        setLastRoundPlayed(round);
      }

      processPlayableHands();
      setRefetchGameData(true);

      openNotification({
        message: "🔊 Hand added!",
        description: `You hand was added to ${getDealRequestedText(round)} in game #${gameId}`,
        type: "success"
      });
    }
  }

  function handleFeePaidEvent(data) {
    const round = parseInt(data.attributes.round, 10);
    const amount = new BN(data.attributes.amount);
    const player = data.attributes.player;

    // total
    if (gameData?.totalPaidIn) {
      const newTotal = new BN(gameData.totalPaidIn).add(amount);
      setGameData({ ...gameData, totalPaidIn: newTotal.toString() });
    }

    const newFeesPaid = { ...feesPaid };
    const newPlayersPerRound = { ...playersPerRound };
    const newNumHands = { ...numHands };

    if (player === account) {
      const newAmnt = new BN(feesPaid[round].me).add(amount);
      newFeesPaid[round].me = newAmnt.toString();
      if (round > lastRoundPlayed) {
        setLastRoundPlayed(round);
      }
    }

    const newRoundTotal = new BN(feesPaid[round].total).add(amount);
    newFeesPaid[round].total = newRoundTotal.toString();

    if (!newPlayersPerRound[round].includes(player)) {
      newPlayersPerRound[round].push(player);
    }

    newNumHands[round] += 1;

    setFeesPaid(newFeesPaid);
    setPlayersPerRound(newPlayersPerRound);
    setNumHands(newNumHands);

    // refresh game data
    setRefetchGameData(true);
  }

  function handleFinalHandPlayedEvent(data) {

    if (data.attributes.player === account) {
      const newFinalHand = {};
      const cTmp = sortFinalHand(
        parseInt(data.attributes.card1, 10),
        parseInt(data.attributes.card2, 10),
        parseInt(data.attributes.card3, 10),
        parseInt(data.attributes.card4, 10),
        parseInt(data.attributes.card5, 10)
      );

      newFinalHand.card1 = cTmp[0];
      newFinalHand.card2 = cTmp[1];
      newFinalHand.card3 = cTmp[2];
      newFinalHand.card4 = cTmp[3];
      newFinalHand.card5 = cTmp[4];
      newFinalHand.rank = parseInt(data.attributes.rank, 10);
      setFinalHand(newFinalHand);
      setLastRoundPlayed(6);

      openNotification({
        message: "🔊 Final Hand Played!",
        description: `You Final Hand was successfully played in game #${gameId}`,
        type: "success"
      });
    }

    setNumFinalHands(numFinalHands + 1);
  }

  function handleHandsPlayedData(results) {
    setHandsPlayedFetched(true);
    const newHandsPlayed = {
      2: {
        hands: [],
        tokenRefs: []
      },
      4: {
        hands: [],
        tokenRefs: []
      }
    };
    if (results.length > 0) {
      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        const round = parseInt(res.get("round"), 10);
        const tokenId = parseInt(res.get("tokenId"), 10);
        const handId = parseInt(res.get("handId"), 10);
        const card1 = parseInt(res.get("card1"), 10);
        const card2 = parseInt(res.get("card2"), 10);
        const hand = {
          round, tokenId, handId, card1, card2
        };

        if (!newHandsPlayed[round].hands.includes(hand)) newHandsPlayed[round].hands.push(hand);
        if (!newHandsPlayed[round].tokenRefs.includes(tokenId)) newHandsPlayed[round].tokenRefs.push(tokenId);
        
        if (round > lastRoundPlayed) {
          setLastRoundPlayed(round);
        }
      }
    }
    setHandsPlayed(newHandsPlayed);
    processPlayableHands();
  }

  function handleFeesPaidData(results) {
    setFeesPaidFetched(true);
    const newFeesPaid = {
      2: { me: "0", total: "0" },
      4: { me: "0", total: "0" },
    };

    const newPlayersPerRound = {
      2: [],
      4: [],
    };

    const newNumHands = {
      2: 0,
      4: 0,
    };

    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      const player = res.get("player");
      const round = parseInt(res.get("round"), 10);
      const amount = new BN(res.get("amount"));
      if (player === account) {
        const newMeAmnt = new BN(newFeesPaid[round].me).add(amount);
        newFeesPaid[round].me = newMeAmnt.toString();
      }

      const newTotalAmnt = new BN(newFeesPaid[round].total).add(amount);
      newFeesPaid[round].total = newTotalAmnt.toString();

      if (!newPlayersPerRound[round].includes(player)) {
        newPlayersPerRound[round].push(player);
      }

      newNumHands[round] += 1;
    }

    setFeesPaid(newFeesPaid);
    setPlayersPerRound(newPlayersPerRound);
    setNumHands(newNumHands);
  }

  function handleFinalHandData(results) {
    setFinalHandFetched(true);
    const newFinalHand = {
      card1: -1,
      card2: -1,
      card3: -1,
      card4: -1,
      card5: -1,
      rank: -1,
    };

    for (let i = 0; i < results.length; i += 1) {
      const res = results[i];
      const player = res.get("player");
      if (player === account) {
        const cTmp = sortFinalHand(
          parseInt(res.get("card1"), 10),
          parseInt(res.get("card2"), 10),
          parseInt(res.get("card3"), 10),
          parseInt(res.get("card4"), 10),
          parseInt(res.get("card5"), 10)
        );

        newFinalHand.card1 = cTmp[0];
        newFinalHand.card2 = cTmp[1];
        newFinalHand.card3 = cTmp[2];
        newFinalHand.card4 = cTmp[3];
        newFinalHand.card5 = cTmp[4];
        newFinalHand.rank = parseInt(res.get("rank"), 10);
        setLastRoundPlayed(6);
      }
      setNumFinalHands(numFinalHands + 1);
    }
    setFinalHand(newFinalHand);
  }

  function fetchCardsDealt() {
    Moralis.executeFunction({
      functionName: "getCardsDealt",
      params: {
        "_gameId": gameId,
      },
      ...options
    })
      .then((result) => handleOnChainCardsDealt(result))
      .catch((e) => console.log(e.message));
  }

  function fetchOnChainGameData() {
    // get game data from contract
    Moralis.executeFunction({
      functionName: "games",
      params: {
        "": gameId,
      },
      ...options
    })
      .then((result) => handleOnChainGameData(result))
      .catch((e) => console.log(e.message));
  }

  function fetchHandsPlayed() {
    setHandsPlayedLoading(true);
    // get any hands already played
    const THHandAdded = Moralis.Object.extend(`${backendPrefix}THHandAdded`);
    const queryTHHandAdded = new Moralis.Query(THHandAdded);
    queryTHHandAdded.equalTo("gameId", String(gameId));
    queryTHHandAdded.equalTo("player", account);
    queryTHHandAdded.find()
      .then((result) => handleHandsPlayedData(result))
      .catch((e) => console.log(e.message));
  }

  function fetchFeesPaid() {
    setFeesPaidLoading(true);
    const THFeePaid = Moralis.Object.extend(`${backendPrefix}THFeePaid`);
    const queryTHFeePaid = new Moralis.Query(THFeePaid);
    queryTHFeePaid.equalTo("gameId", String(gameId));
    queryTHFeePaid.find()
      .then((result) => handleFeesPaidData(result))
      .catch((e) => console.log(e.message));
  }

  function fetchFinalHand() {
    setFinalHandLoading(true);
    const THFinalHandPlayed = Moralis.Object.extend(`${backendPrefix}THFinalHandPlayed`);
    const queryTHFinalHandPlayed = new Moralis.Query(THFinalHandPlayed);
    queryTHFinalHandPlayed.equalTo("gameId", String(gameId));
    queryTHFinalHandPlayed.find()
      .then((result) => handleFinalHandData(result))
      .catch((e) => console.log(e.message));
  }

  useEffect(() => {
    setContractAddress(getTexasHoldemV1Address(chainId))
    const opts = {
      contractAddress, abi,
    }
    setOptions(opts)
  }, [chainId, abi, contractAddress])

  // get the initial data - wait a second between each attempt while status is "NOT EXIST"
  // runs when first loaded until game status is > 0
  useEffect(() => {
    let timeout
    if ((!gameData || gameData?.status === 0) && options) {
      timeout = setTimeout(() => {
        fetchOnChainGameData()
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, account, gameId, options]); // depends on gameData and account - called when it's changed

  // fetch initial cards dealt from chain
  // runs when first loaded if status is > 1 until cards are populated
  useEffect(() => {
    // get initial cards dealt
    let timeout;
    if (cardsDealt.length === 0 && gameData?.status > 1 && options) {
      timeout = setTimeout(() => {
        fetchCardsDealt();
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsDealt, gameData, options]);

  // get any hands already played if status >= 2
  useEffect(() => {
    if (gameData?.status >= 2 && !handsPlayedFetched && !handsPlayedLoading) {
      fetchHandsPlayed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, account, NFTHands, handsPlayedFetched, handsPlayedLoading]);

  // get fees paid if status >= 2
  useEffect(() => {
    if (gameData?.status >= 2 && !feesPaidFetched && !feesPaidLoading) {
      fetchFeesPaid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, account, NFTHands, feesPaidFetched, feesPaidLoading]);

  // fetch final hand if status == 6
  useEffect(() => {
    if (gameData?.status === 6 && !finalHandFetched && !finalHandLoading) {
      fetchFinalHand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, account, NFTHands, finalHandFetched, finalHandLoading]);

  // monitor changes to wallet address
  useEffect(() => {
    fetchHandsPlayed();
    fetchFeesPaid();
    fetchFinalHand();
    processPlayableHands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, NFTHands]);

  // refresh gameData every block while game in progress
  useEffect(() => {
    let timeout;
    if (gameData?.status > 0 && !gameHasEnded && options) {
      timeout = setTimeout(() => {
        fetchOnChainGameData();
      }, 15000);
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, gameHasEnded, gameId, options]);

  // check game ended every second if status == 6
  // and game hasn't been flagged as ended yet
  useEffect(() => {
    let timeout;
    if (gameData?.status === 6 && !gameHasEnded) {
      timeout = setTimeout(() => {
        const now = Math.floor(new Date() / 1000);
        if (gameData.roundEndTime < now) {
          setGameHasEnded(true);
        }
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, gameHasEnded]);

  // periodically process playable cards
  useEffect(() => {
    let timeout;
    if (gameData?.status === 2 || gameData?.status === 4 || gameData?.status === 6) {
      timeout = setTimeout(() => {
        processPlayableHands();
      }, 1000);
    }

    if (gameData?.status === 1 || gameData?.status === 3 || gameData?.status === 5) {
      timeout = setTimeout(() => {
        processPlayableHands();
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  // refresh gameData when requested
  useEffect(() => {
    let timeout;

    if (refetchGameData) {
      setRefetchGameData(false);
      timeout = setTimeout(() => {
        fetchOnChainGameData();
      }, 3000);
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchGameData]);

  /*
   SUBSCRIPTIONS
   */

  // subscribe to CardDealRequested - THCardDealRequested
  useMoralisSubscription(`${backendPrefix}THCardDealRequested`,
    q => q.equalTo("gameId", String(gameId)),
    [gameId],
    {
      onEnter: data => handleCardDealRequestedEvent(data),
    });

  // subscribe to CardDealt events - THCardDealt
  useMoralisSubscription(`${backendPrefix}THCardDealt`,
    q => q.equalTo("gameId", String(gameId)),
    [gameId],
    {
      onEnter: data => handleCardDealtEvent(data),
    });

  // subscribe to HandAdded events - THHandAdded
  useMoralisSubscription(`${backendPrefix}THHandAdded`,
    query => query.equalTo("gameId", String(gameId)).equalTo("player", account),
    [gameId, account],
    {
      onEnter: data => handleHandAddedEvent(data),
    });

  // subscribe to FeePaid events - THFeePaid
  useMoralisSubscription(`${backendPrefix}THFeePaid`,
    q => q.equalTo("gameId", String(gameId)).equalTo("player", account),
    [gameId],
    {
      onEnter: data => handleFeePaidEvent(data),
    });

  // subscribe to FinalHandPlayed events - THFinalHandPlayed
  useMoralisSubscription(`${backendPrefix}THFinalHandPlayed`,
    q => q.equalTo("gameId", String(gameId)),
    [gameId],
    {
      onEnter: data => handleFinalHandPlayedEvent(data),
    });

  return {
    gameData,
    cardsDealt,
    handsPlayed,
    lastRoundPlayed,
    playableHands,
    feesPaid,
    playersPerRound,
    numFinalHands,
    numHands,
    finalHand,
    gameHasEnded
  };
}
