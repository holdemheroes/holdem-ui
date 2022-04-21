import { useMoralis } from "react-moralis"
import abis from "../helpers/contracts"
import { useEffect, useState } from "react"
import { getChainType, getHoldemHeroesAddress } from "../helpers/networks"
import { BigNumber } from "@ethersproject/bignumber"

export const usePostRevealPrice = (tokenId) => {
  const { Moralis, isInitialized, chainId } = useMoralis();

  const abi = abis.heh_nft;

  const [contractAddress, setContractAddress] = useState(null);
  const [options, setOptions] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    if(chainId && !contractAddress) {
      const cA = getHoldemHeroesAddress( chainId );
      setContractAddress( cA )
      const opts = {
        contractAddress: cA, abi,
      }
      setOptions(opts)
    }
  }, [chainId, contractAddress, abi]);

  const priceFetch = async () => {
    if(chainId && contractAddress && options) {
      if ( getChainType( chainId ) === "l1" ) {
        Moralis.executeFunction( {
          functionName: "getPostRevealNftPrice",
          params: {
            "_tokenId": tokenId,
          },
          ...options
        } )
          .then( ( result ) => {
            setPrice( result )
            setFetched(true)
          } )
          .catch( ( e ) => console.log( e.message ) );
      } else {
        setPrice( BigNumber.from( "0" ) )
        setFetched(true)
      }
    }
  }

  useEffect(() => {
    if (isInitialized && chainId && !fetched && contractAddress && !isFetching && !price) {
      setIsFetching(true);
      priceFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chainId,
    isInitialized,
    fetched,
    contractAddress,
    isFetching,
    price
  ]);

  return {
    fetched,
    isFetching,
    priceFetch,
    price,
  }


}
