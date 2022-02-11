import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./style.scss";
import AnimateButton from "../../components/AnimateButton";
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo";
import Countdown from 'react-countdown';
import { Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis } from "react-moralis";
import abis from "../../helpers/contracts";
import { getHoldemHeroesAddress } from "../../helpers/networks";
import { openNotification } from "../../helpers/notifications";

const BN = require('bn.js');

export default function Home() {
  const {
    startTime,
    revealTime,
    startingIndex,
    maxPerTxOrOwner,
    pricePerToken,
    totalSupply,
    dataInitialised
  } = useNFTSaleInfo();

  // const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  // useEffect(() => {
  //   const timerId = setInterval(() => {
  //     setNow(Math.floor(Date.now() / 1000));
  //   }, 1000);

  //   return () => clearInterval(timerId);
  // }, [now]);

  const now = Math.floor(Date.now() / 1000);

  const saleStartDiff = startTime - now;
  const revealTimeDiff = revealTime - now;
  const startIdx = parseInt(startingIndex, 10);

  console.log("----", { saleStartDiff })
  console.log("----", { revealTimeDiff })
  console.log("----", { startIdx })

  const { chainId } = useMoralisDapp();
  const { Moralis } = useMoralis();
  const abi = abis.heh_nft;
  const contractAddress = getHoldemHeroesAddress(chainId);

  const MAX_TOTAL_SUPPLY = 1326;

  console.log({ totalSupply })

  async function preRevealMint(event) {
    event.preventDefault();
    const formData = new FormData(event.target),
      formDataObj = Object.fromEntries(formData.entries());
    const numToMint = parseInt(formDataObj.mint_amount, 10);
    const cost = new BN(pricePerToken).mul(new BN(numToMint));

    const options = {
      contractAddress,
      functionName: "mintNFTPreReveal",
      abi,
      msgValue: cost.toString(),
      params: {
        numberOfNfts: numToMint
      },
    };

    const tx = await Moralis.executeFunction({ awaitReceipt: false, ...options });
    tx.on("transactionHash", (hash) => {
      openNotification({
        message: "🔊 New Transaction",
        description: `📃 Tx Hash: ${hash}`,
        type: "success"
      });
    })
      .on("receipt", (receipt) => {
        openNotification({
          message: "🔊 New Receipt",
          description: `📃 Receipt: ${receipt.transactionHash}`,
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
  }

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return null;
    } else {
      // Render a countdown
      return (
        <div className="time_card-wrapper">
          <div className="time_card">
            <p>{days < 10 ? "0" + days : days}</p>
            <p>days</p>
          </div>
          <div className="time_card">
            <p>{hours < 10 ? "0" + hours : hours}</p>
            <p>hours</p>
          </div>
          <div className="time_card">
            <p>{minutes < 10 ? "0" + minutes : minutes}</p>
            <p>minutes</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="main-wrapper">
      <div className="section--nft_poker-wrapper" id="section--nft_poker">
        <div className="section--nft_poker">
          <div>
            <p>NFT Poker</p>
            <p>Holdem Heroes is the on-chain NFT Poker game.<br />Mint the 1326 Hole Card combinations as NFTs.<br />Then play Texas Hold&#x27;em with them!</p>
            <div className="mint_poker_hands-wrapper">
              <div className="mint_poker_hands">
                <form onSubmit={(e) => preRevealMint(e)} name="mint-form">
                  <p>Mint Poker Hands</p>
                  <div>
                    <select id="mint_num" name={"mint_amount"}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="3">4</option>
                      <option value="3">5</option>
                      <option value="3">6</option>
                      <option value="3">7</option>
                    </select>
                    <p>Ξ {Moralis.Units.FromWei(pricePerToken)}</p>
                  </div>
                  <p>* Max 7 NFTs per address</p>
                  <input className="btn-shadow btn-hover-pointer" type="submit" value="Mint" />
                </form>
              </div>
              <p>Total NFTs minted: {totalSupply}/1326</p>
            </div>
          </div>
          <div>
            <img src="../assets/images/cards2.png" alt="" />
            {revealTimeDiff > 0 ? <><p>NFT Distribution and Reveal in</p><Countdown date={revealTime * 1000} renderer={renderer} /></> : null}
          </div>
        </div>
      </div>

      <div className="section--game_play">
        <img src="../assets/images/tablehq.png" loading="lazy" srcSet="../assets/images/tablehq-p-1080.png 1080w, ../assets/images/tablehq-p-1600.png 1600w, ../assets/images/tablehq.png 1659w" sizes="(max-width: 479px) 100vw, (max-width: 767px) 90vw, (max-width: 991px) 650px, (max-width: 2765px) 60vw, 1659px" alt="" />
        <div>
          <p>Gameplay</p>
          <div>
            <p>
              Poker gameplay starts immediately after the NFT sale concludes. We are proud to be one of few projects with NFT gaming ready at time of launch.
            </p>
            <p>
              In Holdem Heroes, every NFT is a pair of Hole Cards.<br />
              By owning an NFT, you hold these Hole Cards and can play poker games with them.
            </p>
            <p>
              Games take place on the Ethereum blockchain, can start at any time, and include up to 1326 players.
            </p>
            <p>
              You can choose your game duration, bet size, and play multiple games in parallel.</p>
          </div>
          <div>
            <NavLink to="/Play" className="btn-play">Play Now</NavLink>
            <NavLink to="/Rules" className="btn-learn">Learn More</NavLink>
          </div>
        </div>
      </div>

      <div className="section--open_source-wrapper">
        <div className="section--open_source">
          <div>
            <div>
              <p>Open Source Poker NFTs</p>
              <div>
                <p>The 52 cards and 1326 card pair NFTs are available for open source use.</p>
                <p>They can be used freely in any way.<br />For example, for private games, for Texas Hold’em with higher stakes, for different variants of poker such as Omaha Hold’em, or indeed for distinct card games such as Blackjack.</p>
                <p>While NFT games such as Axie Infinity have recently gained in popularity, a gap exists to serve casual gamers &amp; more traditional games.<br />The Holdem Heroes card deck fulfills this need by providing the cards and contracts to offer Poker as well as a plethora of other card games. These can be be played by thousands of people at the same time, who share in a common and accumulating jackpot.</p>
                <p>People can design their own card sets, games, betting systems and more...</p>
                <p>Please see the <a href="https://github.com/holdemheroes/holdem-ui" target="_blank" rel="noreferrer">documentation</a> for full details, as well as card provenance and proof of randomn.</p>
              </div>
            </div>
            <div>
              <img src="../../assets/images/cardshq.png" alt="" />
            </div>
          </div>

          <div>
            <AnimateButton><a href='#section--nft_poker' rel="noreferrer">Mint Poker Nfts</a></AnimateButton>
            <AnimateButton><a href='https://discord.gg/wqZdRNruHG' target='_blank' rel="noreferrer">Join Our Community</a></AnimateButton>
            <AnimateButton><NavLink to='/Play'>Play Hold&#x27;em Heroes</NavLink></AnimateButton>
          </div>
        </div>

        <div className="vor-wrapper">
          <p>Powered by <a href="https://vor.unification.io" target="_blank" rel="noreferrer">VOR (xFUND)</a></p>
        </div>
      </div>
    </div>
  );
}
