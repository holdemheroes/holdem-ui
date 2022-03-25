import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./style.scss";
import AnimateButton from "../../components/AnimateButton";
import Timeline from "../../components/Timeline";
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo";
import Countdown from "react-countdown";
import { useMoralis } from "react-moralis";
import abis from "../../helpers/contracts";
import { getHoldemHeroesAddress } from "../../helpers/networks";
import { openNotification } from "../../helpers/notifications";
import { Roadmap } from "../../roadmap";
import { BigNumber } from "@ethersproject/bignumber";
import { getGameIsLive, getHehIsLive } from "../../helpers/networks";

export default function Home() {
  const {
    // startTime,
    revealTime,
    // startingIndex,
    // maxPerTxOrOwner,
    pricePerToken,
    totalSupply,
    dataInitialised,
    refresh: refreshNftData
  } = useNFTSaleInfo();



  const now = Math.floor(Date.now() / 1000);

  // const saleStartDiff = startTime - now;
  const revealTimeDiff = revealTime - now;
  // const startIdx = parseInt(startingIndex, 10);

  const { Moralis, chainId } = useMoralis();
  const gameIsLive = getGameIsLive(chainId);
  const hehIsLive = getHehIsLive(chainId);

  const abi = abis.heh_nft;
  const contractAddress = getHoldemHeroesAddress(chainId);
  const [maxNumToMint, setMaxNumToMint] = useState(6);

  // const MAX_TOTAL_SUPPLY = 1326;

  async function preRevealMint(event) {
    event.preventDefault();
    const formData = new FormData(event.target),
      formDataObj = Object.fromEntries(formData.entries());
    const numToMint = parseInt(formDataObj.mint_amount, 10);
    const cost = BigNumber.from(pricePerToken).mul(BigNumber.from(numToMint));

    const options = {
      contractAddress,
      functionName: "mintNFTPreReveal",
      abi,
      msgValue: cost.toString(),
      params: {
        _numberOfNfts: numToMint,
      },
    };

    try {
      const tx = await Moralis.executeFunction({
        awaitReceipt: false,
        ...options,
      });
      openNotification({
        message: "🔊 New Transaction",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success",
      });
    } catch (error) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Receipt: ${error.message}`,
        type: "error",
      });
      console.log(error);
    }
  }
  useEffect(() => {
    const timeout = setTimeout(() => {
      if(dataInitialised) {
        refreshNftData();
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  });

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
    <>
      <div className="header-background"></div>
      <div className="main-wrapper">
        <div className="section--nft_poker-wrapper" id="section--nft_poker">
          <div className="section--nft_poker">
            <div>
              <p>NFT Poker</p>
              <p>
                Holdem Heroes is the on-chain NFT Poker game.
                <br />
                Mint the 1326 Hole Card combinations as NFTs.
                <br />
                Then play Texas Hold&#x27;em with them!
                <br />
                Mint price is dynamic with{" "}
                <a
                  href="http://dynamicdrops.xyz"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dynamic Drops
                </a>
                .
              </p>
              <div className="mint_poker_hands-wrapper">
                <div className="mint_poker_hands">
                  <form onSubmit={(e) => preRevealMint(e)} name="mint-form">
                    <p>Mint Poker Hands</p>
                    <div>
                      <select id="mint_num" name={"mint_amount"}>
                        {Array.from(
                          { length: maxNumToMint },
                          (_, i) => i + 1
                        ).map((item, i) => (
                          <option value="1" key={i}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <p>
                        Ξ{" "}
                        {Moralis.Units.FromWei(
                          pricePerToken !== null ? pricePerToken : "0"
                        )}
                      </p>
                    </div>
                    <p>* Max {maxNumToMint} NFTs per address</p>
                    <input
                      className="btn-shadow btn-hover-pointer"
                      type="submit"
                      value={
                        hehIsLive && chainId !== null ? "Mint" : "Coming Soon"
                      }
                      disabled={!hehIsLive || chainId === null}
                    />
                  </form>
                </div>
                <p>{`Total NFTs minted: ${
                  totalSupply !== null ? totalSupply : "0"
                }/1326`}</p>
              </div>
            </div>
            <div>
              <div className="video-container--16x9">
                <div className="inner-wrapper">
                  <iframe
                    src="https://www.youtube.com/embed/IRiglLJ_1Ak"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="video"
                  />
                </div>
              </div>
              {revealTimeDiff > 0 ? (
                <>
                  <p>NFT Distribution and Reveal in</p>
                  <Countdown date={revealTime * 1000} renderer={renderer} />
                </>
              ) : null}
            </div>
          </div>

          <div style={{ marginTop: "160px" }}>
            <Timeline />
          </div>
        </div>

        <div className="section--open_source">
          <div>
            <p>Open Source Poker NFTs</p>
            <div>
              <p>
                The 52 cards and 1326 card pair NFTs are available for open
                source use.
              </p>
              <p>
                They can be used freely in any way.
                <br />
                For example, for private games, for Texas Hold’em with higher
                stakes, for different variants of poker such as Omaha Hold’em,
                or indeed for distinct card games such as Blackjack.
              </p>
              <p>
                While NFT games such as Axie Infinity have recently gained in
                popularity, a gap exists to serve casual gamers &amp; more
                traditional games.
                <br />
                The Holdem Heroes card deck fulfills this need by providing the
                cards and contracts to offer Poker as well as a plethora of
                other card games. These can be be played by thousands of people
                at the same time, who share in a common and accumulating
                jackpot.
              </p>
              <p>
                People can design their own card sets, games, betting systems
                and more...
              </p>
              <p>
                Please see the{" "}
                <a
                  href="https://docs.holdemheroes.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  documentation
                </a>{" "}
                for full details, as well as card provenance and proof of
                randomness.
              </p>
            </div>
          </div>
          <div>
            <img src="../../assets/images/cardshq.png" alt="" />
          </div>
        </div>

        <div className="section--rest-wrapper">
          <div className="section--rest">
            <div className="game_play">
              <img
                src="../assets/images/tablehq.png"
                loading="lazy"
                srcSet="../assets/images/tablehq-p-1080.png 1080w, ../assets/images/tablehq-p-1600.png 1600w, ../assets/images/tablehq.png 1659w"
                sizes="(max-width: 479px) 100vw, (max-width: 767px) 90vw, (max-width: 991px) 650px, (max-width: 2765px) 60vw, 1659px"
                alt=""
              />
              <div>
                <p>Gameplay</p>
                <div>
                  <p>
                    Poker gameplay starts immediately after the NFT sale
                    concludes. We are proud to be one of few projects with NFT
                    gaming ready at time of launch.
                  </p>
                  <p>
                    In Holdem Heroes, every NFT is a pair of Hole Cards.
                    <br />
                    By owning an NFT, you hold these Hole Cards and can play
                    poker games with them.
                  </p>
                  <p>
                    Games take place on both the Ethereum and Polygon
                    blockchains, can start at any time, and include up to 1326
                    players.
                  </p>
                  <p>
                    You can choose your game duration, bet size, and play
                    multiple games in parallel.
                  </p>
                </div>
                <div>
                  <NavLink to="/Play" className="btn-play">
                    Play Now
                  </NavLink>
                  <NavLink to="/Rules" className="btn-learn">
                    Learn More
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="roadmap-wrapper">
              <div className="roadmap-text">
                <p className="title">Roadmap</p>
                <p className="sub_title">MORE GAMES</p>
                <p className="desc">
                  Further games of poker and other card games with the
                  open-source card contract
                </p>
                <p className="sub_title">MORE CHAINS</p>
                <p className="desc">
                  Deploying games to EVM chains by community vote (AVAX, BSC,
                  Fantom...)
                </p>
                <p className="sub_title">MORE DECKS</p>
                <p className="desc">
                  Whitelisting card decks for custom-branded poker games
                </p>
                <p className="sub_title">GOVERNANCE BY DAO</p>
                <p className="desc">
                  Decentralizing governance to community ownership by
                  formalizing the DAO structure
                </p>
              </div>

              <div className="roadmap-img">
                <Roadmap />
              </div>
            </div>

            <div>
              <AnimateButton>
                <a href="#section--nft_poker" rel="noreferrer">
                  Mint Poker Nfts
                </a>
              </AnimateButton>
              <AnimateButton>
                <a
                  href="https://discord.gg/dmgga7b72Y"
                  target="_blank"
                  rel="noreferrer"
                >
                  Join Our Community
                </a>
              </AnimateButton>
              <AnimateButton>
                <NavLink to="/Play">Play Hold&#x27;em Heroes</NavLink>
              </AnimateButton>
            </div>
          </div>

          <div className="vor-wrapper">
            <p>
              Powered by{" "}
              <a
                href="https://vor.unification.io"
                target="_blank"
                rel="noreferrer"
              >
                VOR (xFUND)
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
