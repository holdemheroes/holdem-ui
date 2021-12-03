import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useMoralisDapp } from "../providers/MoralisDappProvider/MoralisDappProvider";
import { useIPFS } from "./useIPFS";
import { getHoldemHeroesAddress, getTexasHoldemV1Address } from "../helpers/networks";
import abis from "../helpers/contracts";

export const useMyNFTHands = (options) => {
  const { account } = useMoralisWeb3Api();
  const { Moralis } = useMoralis();
  const { chainId, walletAddress } = useMoralisDapp();
  const hehContractAddress = getHoldemHeroesAddress(chainId);
  const texasHoldemAddress = getTexasHoldemV1Address(chainId)
  const thAbi = abis.texas_holdem_v1;
  const { resolveLink } = useIPFS();
  const [NFTHands, setNFTHands] = useState([]);
  const {
    fetch: getMyNFTHands,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(account.getNFTsForContract, { chain: chainId, token_address: hehContractAddress, address: walletAddress, ...options });

  useEffect(() => {
    if (data?.result) {
      const NFTs = data.result;
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
        }
        if (NFT?.token_id) {
          fetchHandData(NFT.token_id)
            .then((d) => {
              if (d?.card1 && d?.card2 && d?.handId) {
                NFT.card1 = parseInt(d.card1, 10);
                NFT.card2 = parseInt(d.card2, 10);
                NFT.handId = parseInt(d.handId, 10);
              }
            })
            .catch((e) => console.log(e.message));
        }
      }
      setNFTHands(NFTs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

  return { getMyNFTHands, NFTHands, error, isLoading };
};
