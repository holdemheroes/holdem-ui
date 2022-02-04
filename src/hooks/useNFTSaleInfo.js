import { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "../providers/MoralisDappProvider/MoralisDappProvider";
import abis from "../helpers/contracts";
import { getHoldemHeroesAddress } from "../helpers/networks";

export const useNFTSaleInfo = () => {
  const { isInitialized } = useMoralis();
  const { chainId } = useMoralisDapp();
  const abi = abis.heh_nft;
  const contractAddress = getHoldemHeroesAddress(chainId);

  const [fetched, setFetched] = useState(false);
  const [dataInitialised, setDataInitialised] = useState(false);

  const options = {
    contractAddress, abi,
  };

  const {
    data: startTime,
    fetch: startTimeFetch,
  } = useWeb3ExecuteFunction({
    ...options,
    functionName: "SALE_START_TIMESTAMP",
  });

  const {
    data: revealTime,
    fetch: revealTimeFetch,
  } = useWeb3ExecuteFunction({
    ...options,
    functionName: "REVEAL_TIMESTAMP",
  });

  const {
    data: startingIndex,
    fetch: startingIndexFetch,
  } = useWeb3ExecuteFunction({
    ...options,
    functionName: "startingIndex",
  });

  const {
    data: maxPerTxOrOwner,
    fetch: maxPerTxOrOwnerFetch,
  } = useWeb3ExecuteFunction({
    ...options,
    functionName: "MAX_PER_ADDRESS_OR_TX",
  });

  const {
    data: pricePerToken,
    fetch: pricePerTokenFetch,
  } = useWeb3ExecuteFunction({
    ...options,
    functionName: "getNftPrice",
  });

  const {
    data: totalSupply,
    fetch: totalSupplyFetch,
  } = useWeb3ExecuteFunction({
    ...options,
    functionName: "totalSupply",
  });

  useEffect(() => {

    if (isInitialized && !fetched) {
      setFetched(true);
      refresh();
    }

    if (startTime !== null &&
      revealTime !== null &&
      startingIndex !== null &&
      maxPerTxOrOwner !== null &&
      pricePerToken !== null &&
      totalSupply !== null) {
      setDataInitialised(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, fetched, startTime, revealTime, startingIndex, maxPerTxOrOwner, pricePerToken, totalSupply]);


  const refresh = () => {
    startTimeFetch();
    revealTimeFetch();
    startingIndexFetch();
    maxPerTxOrOwnerFetch();
    pricePerTokenFetch();
    totalSupplyFetch();
  };

  return {
    refresh,
    dataInitialised,
    startTime,
    revealTime,
    startingIndex,
    maxPerTxOrOwner,
    pricePerToken,
    totalSupply,
  };
};
