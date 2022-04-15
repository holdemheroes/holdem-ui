import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";
import { getGameIsLive, getHoldemHeroesAddress, getTexasHoldemV1Address } from "../helpers/networks"
import abis from "../helpers/contracts";

export const useMyNFTHands = (options) => {
  const { account } = useMoralisWeb3Api();
  const { Moralis, chainId, account: walletAddress } = useMoralis();

  const thAbi = abis.texas_holdem_v1;
  const { resolveLink } = useIPFS();

  const [NFTHands, setNFTHands] = useState([]);
  const [handsFetched, setHandsFetched] = useState(false);
  const [hehContractAddress, setHehContractAddress] = useState(getHoldemHeroesAddress( chainId ));
  const [texasHoldemAddress, setTexasHoldemAddress] = useState(getTexasHoldemV1Address( chainId ));
  const [gameIsLive, setGameIsLive] = useState(getGameIsLive( chainId ));

  const {
    fetch: getMyNFTHands,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(
    account.getNFTsForContract,
    { chain: chainId, token_address: hehContractAddress, address: walletAddress, ...options },
  );

  useEffect(() => {
    if(chainId && !hehContractAddress && !texasHoldemAddress) {
      setHehContractAddress( getHoldemHeroesAddress( chainId ) )
      setTexasHoldemAddress( getTexasHoldemV1Address( chainId ) )
      setGameIsLive( getGameIsLive( chainId ) )
    }
  }, [chainId, hehContractAddress, texasHoldemAddress]);

  useEffect(() => {
    if(hehContractAddress && walletAddress) {
      getMyNFTHands();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hehContractAddress, walletAddress]);

  useEffect(() => {
    if (data?.result) {
      const NFTs = data.result;
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
        }

        // set some reference data for games - helps reduce multiple calls to contract during gameplay
        if (NFT?.token_id && gameIsLive) {
          fetchHandData(NFT.token_id)
            .then((d) => {
              if (d?.card1.toString() && d?.card2.toString() && d?.handId.toString()) {
                NFT.card1 = parseInt(d.card1, 10);
                NFT.card2 = parseInt(d.card2, 10);
                NFT.handId = parseInt(d.handId, 10);
              }
            })
            .catch((e) => console.log(e.message));
        }
      }
      setNFTHands(NFTs);
      setHandsFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, gameIsLive]);

  // attaches useful data regarding Hand ID and associated Card IDs for gameplay.
  // Only called once the game contract is live
  const fetchHandData = async (tokenId) => {
    return await Moralis.executeFunction({
      contractAddress: texasHoldemAddress,
      functionName: "getTokenDataWithHandId",
      abi: thAbi,
      params: {
        "_tokenId": String(tokenId),
      },
    })
      .then((result) => result)
      .catch((e) => console.log(e.message));
  };

  return { getMyNFTHands, NFTHands, error, isLoading, handsFetched };
};
