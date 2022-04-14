import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";
import { getGameIsLive, getHoldemHeroesAddress, getTexasHoldemV1Address } from "../helpers/networks"
import abis from "../helpers/contracts";
import { useNFTSaleInfo } from "./useNFTSaleInfo"

export const useMyNFTHands = (options) => {
  const { account } = useMoralisWeb3Api();
  const { Moralis, chainId, account: walletAddress } = useMoralis();
  const { startingIndex } = useNFTSaleInfo();

  const thAbi = abis.texas_holdem_v1;
  const { resolveLink } = useIPFS();

  const [NFTHands, setNFTHands] = useState([]);
  const [handsFetched, setHandsFetched] = useState(false);
  const [hehContractAddress, setHehContractAddress] = useState(null);
  const [texasHoldemAddress, setTexasHoldemAddress] = useState(null);
  const [gameIsLive, setGameIsLive] = useState(false);

  const {
    fetch: getMyNFTHands,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(
    account.getNFTsForContract,
    { chain: chainId, token_address: hehContractAddress, address: walletAddress, ...options },
    { autoFetch: false }
  );

  useEffect(() => {
    if(chainId && !hehContractAddress && !texasHoldemAddress) {
      setHehContractAddress( getHoldemHeroesAddress( chainId ) )
      setTexasHoldemAddress( getTexasHoldemV1Address( chainId ) )
      setGameIsLive( getGameIsLive( chainId ) )
    }
  }, [chainId, hehContractAddress, texasHoldemAddress]);

  useEffect(() => {
    if(hehContractAddress && startingIndex && walletAddress) {
      if(startingIndex?.toNumber() > 0) {
        // Tokens and hands have been revealed. Load from Moralis's parsed & cached list
        getMyNFTHands();
      } else {
        // Still in pre-reveal phase. Get user's balance and set null values.
        // This should prevent Moralis trying to cache pre-reveal tokens, which will
        // result in null values, and manual requests to refresh NFT metadata (similar to OpenSea).
        fetchPreRevealTokens(walletAddress)
          .then((d) => {
            const myNfts = []
            for(let i = 0; i < d.length; i += 1) {
              const nft = {
                token_address: hehContractAddress,
                token_id: d[i].get("tokenId"),
                owner_of: walletAddress,
                name: "Holdem Heroes",
                symbol: "HEH",
                token_uri: null,
                metadata: null,
                image: null,
              }
              myNfts.push(nft);
            }
            setNFTHands(myNfts);
            setHandsFetched(true);
          })
          .catch((e) => console.log(e.message));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hehContractAddress, startingIndex, walletAddress]);

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

  // used prior to hand reveal. This will get the user's minted tokens, but
  // not cause Moralis to cache null metadata.
  const fetchPreRevealTokens = async(addr) => {
    // no need to set prefix, as this will only be used during blind mint phase on L1
    const EthHEHTransfer = Moralis.Object.extend("EthHEHTransfer");
    const query = new Moralis.Query(EthHEHTransfer);
    query.equalTo("from", "0x0000000000000000000000000000000000000000");
    query.equalTo("to", addr);
    return await query.find().then((result) => result)
      .catch((e) => console.log(e.message));
  }

  return { getMyNFTHands, NFTHands, error, isLoading, handsFetched };
};
