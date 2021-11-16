import { useMoralisDapp } from "../providers/MoralisDappProvider/MoralisDappProvider"
import { useMoralis, useMoralisSubscription } from "react-moralis"
import abis from "../helpers/contracts"
import { getTexasHoldemV1Address } from "../helpers/networks"
import { useEffect, useState } from "react"
import { openNotification } from "../helpers/notifications"

export const useGameMetadata = () => {
  const { chainId } = useMoralisDapp();
  const { Moralis } = useMoralis()

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address( chainId );

  const options = {
    contractAddress, abi,
  }

  const [ maxConcurrentGames, setMaxConcurrentGames ] = useState(null)
  const [ maxConcurrentGamesLoading, setMaxConcurrentGamesLoading ] = useState(false)
  const [ maxConcurrentGamesFetched, setMaxConcurrentGamesFetched ] = useState(false)

  const [ gamesInProgress, setGamesInProgress ] = useState([])
  const [ gamesInProgressLoading, setGamesInProgressLoading ] = useState(false)
  const [ gamesInProgressFetched, setGamesInProgressFetched ] = useState(false)

  const [ numGames, setNumGames ] = useState(0)
  const [ numGamesLoading, setNumGamesLoading ] = useState(false)
  const [ numGamesFetched, setNumGamesFetched ] = useState(false)

  function handleOnChainMaxConcurrentGames(result) {
    setMaxConcurrentGamesFetched(true)
    setMaxConcurrentGames(result)
  }

  function handleOnChainGamesInProgress(result) {
    setGamesInProgressFetched(true)
    setGamesInProgress(result)
  }

  function handleOnChainNumGames(result) {
    setNumGamesFetched(true)
    setNumGames(result)
  }

  function handleGameCreated(data) {
    const newGameId = data.attributes.gameId
    if(!gamesInProgress.includes(newGameId)) {
      const newGames = [...gamesInProgress, newGameId]

      openNotification( {
        message: "🔊 New Game!",
        description: `New game started: #${newGameId}`,
        type: "info"
      } );

      setGamesInProgress(newGames)
    }
    setNumGames(numGames + 1)
  }

  function handleGameDeleted(data) {
    const deletedGameId = data.attributes.gameId
    const newGames = gamesInProgress.filter(e => e !== deletedGameId)
    setGamesInProgress(newGames)

    openNotification( {
      message: "🔊 Game Ended",
      description: `Game #${deletedGameId} ended`,
      type: "info"
    } );
  }

  function fetchOnChainMaxConcurrentGames() {
    setMaxConcurrentGamesLoading(true)

    Moralis.executeFunction({
      functionName: "maxConcurrentGames",
      ...options
    })
      .then((result) => handleOnChainMaxConcurrentGames(result))
      .catch((e) => console.log(e.message))
  }

  function fetchOnChainGamesInProgress() {
    setGamesInProgressLoading(true)
    Moralis.executeFunction({
      functionName: "getGameIdsInProgress",
      ...options
    })
      .then((result) => handleOnChainGamesInProgress(result))
      .catch((e) => console.log(e.message))
  }

  function fetchOnChainNumGames() {
    setNumGamesLoading(true)
    Moralis.executeFunction({
      functionName: "currentGameId",
      ...options
    })
      .then((result) => handleOnChainNumGames(result))
      .catch((e) => console.log(e.message))
  }

  //get initial maxConcurrentGames
  useEffect(() => {
    if(!maxConcurrentGames && !maxConcurrentGamesLoading && !maxConcurrentGamesFetched) {
      fetchOnChainMaxConcurrentGames()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxConcurrentGames, maxConcurrentGamesLoading, maxConcurrentGamesFetched])

  //get initial gamesInProgress
  useEffect(() => {
    if(!gamesInProgressLoading && !gamesInProgressFetched) {
      fetchOnChainGamesInProgress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesInProgressLoading, gamesInProgressFetched])

  //get initial gamesNumGames
  useEffect(() => {
    if(!numGamesLoading && !numGamesFetched) {
      fetchOnChainNumGames()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numGamesLoading, numGamesFetched])

  // refresh games in progress every block
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOnChainGamesInProgress()
    }, 15000)

    return () => {
      clearTimeout(timeout)
    }
  })

  // set up subs after initial game data fetched
  useMoralisSubscription("THGameStarted", q => q, [], {
    onCreate: data => handleGameCreated(data),
  });

  useMoralisSubscription("THGameDeleted", q => q, [], {
    onCreate: data => handleGameDeleted(data),
  });

  return { maxConcurrentGames, gamesInProgress, numGames }
}