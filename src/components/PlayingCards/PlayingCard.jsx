import React, { useEffect, useState } from "react"
import { useWeb3ExecuteFunction } from "react-moralis"
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider"
import abis from "../../helpers/contracts"
import { getHoldemHeroesAddress } from "../../helpers/networks"
import { svgToImgSrc } from "../../helpers/nft"
import { Image, Spin } from 'antd'

export const PlayingCard = ({ cardId, width = 50 }) => {

  const { chainId } = useMoralisDapp();
  const abi = abis.heh_nft;
  const contractAddress = getHoldemHeroesAddress(chainId);

  const [cardSvg, setCardSvg] = useState(null)

  const { data, fetch } = useWeb3ExecuteFunction({
    abi,
    contractAddress,
    functionName: "getCardAsSvg",
    params: {
      "cardId": String(cardId),
    },
  });

  useEffect(() => {
    if (!data) {
      fetch()
    } else {
      setCardSvg(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!cardSvg) {
    return <Spin className="spin_loader" />
  }

  return (
    <Image src={svgToImgSrc(cardSvg)} alt={`Card #${cardId}`} width={width} />
  )

}