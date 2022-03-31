import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./style.scss";
import AnimateButton from "../../components/AnimateButton";
import Timeline from "../../components/Timeline";
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo";
import { useMyNFTHands } from "../../hooks/useMyNFTHands";
import { useChainData } from "../../hooks/useChainData";
import Countdown from "react-countdown";
import { useFiatBuy, useMoralis } from "react-moralis";
import abis from "../../helpers/contracts";
import { getHoldemHeroesAddress } from "../../helpers/networks";
import {
  extractErrorMessage,
  openNotification,
} from "../../helpers/notifications";
import { Roadmap } from "../../roadmap";
import { BigNumber } from "@ethersproject/bignumber";
import { getGameIsLive, getHehIsLive } from "../../helpers/networks";
import { Spin } from "antd";
import { MAX_TOTAL_SUPPLY } from "../../helpers/constant";
import PriceChart from "../../components/Sale/PriceChart";

export default function HomeL2() {
  const {
    startBlockNum,
    revealTime,
    startingIndex,
    maxPerTxOrOwner,
    pricePerToken,
    totalSupply,
    dataInitialised: nftSaleDataInitialised,
    refresh: refreshNftData,
  } = useNFTSaleInfo();

  const { Moralis, chainId, account, isAuthenticated, isWeb3Enabled } =
    useMoralis();
  const { currentBlock, refresh: refreshCurrentBlock } = useChainData();
  const { NFTHands, isLoading: nftBalanceIsLoading } = useMyNFTHands();

  const [saleStartBlockDiff, setSaleStartBlockDiff] = useState(null);
  const [revealTimeDiff, setRevealTimeDiff] = useState(null);
  const [saleStartTime, setSaleStartTime] = useState(0);
  const [saleTimeInitialised, setSaleTimeInitialised] = useState(false);

  const [maxNumToMint, setMaxNumToMint] = useState(0);
  const [hehContractAddress, setHehContractAddress] = useState(null);
  const [hehContract, setHehContract] = useState(null);

  const startIdx = parseInt(startingIndex, 10);
  const hehIsLive = getHehIsLive(chainId);
  const abi = abis.heh_nft;

  useEffect(() => {
    if (currentBlock > 0 && startBlockNum && !saleTimeInitialised) {
      const now = Math.floor(Date.now() / 1000);
      const blockDiff = startBlockNum.toNumber() - currentBlock;
      const start = now + blockDiff * 15;
      setSaleStartTime(start); // estimate based on 1 block every 15 seconds
      setSaleStartBlockDiff(blockDiff);
      setRevealTimeDiff(revealTime - now);
      setSaleTimeInitialised(true);
    }
  }, [currentBlock, startBlockNum, saleTimeInitialised, revealTime]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!nftSaleDataInitialised) {
        refreshNftData();
      }
      refreshCurrentBlock();
      const now = Math.floor(Date.now() / 1000);
      if (startBlockNum && currentBlock > 0) {
        setSaleStartBlockDiff(startBlockNum.toNumber() - currentBlock);
      }
      if (revealTime > 0) {
        setRevealTimeDiff(revealTime - now);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  });

  useEffect(() => {
    setMaxNumToMint(
      Math.min(
        maxPerTxOrOwner - NFTHands.length,
        MAX_TOTAL_SUPPLY - totalSupply,
        6
      )
    );
  }, [maxPerTxOrOwner, NFTHands, totalSupply]);

  useEffect(() => {
    (async () => {
      if (
        chainId &&
        !hehContract &&
        !hehContractAddress &&
        isAuthenticated &&
        isWeb3Enabled
      ) {
        try {
          const hehAddr = getHoldemHeroesAddress(chainId);
          setHehContractAddress(hehAddr);
          const ethers = Moralis.web3Library;
          const web3Provider = await Moralis.enableWeb3();
          const contract = new ethers.Contract(
            hehAddr,
            abi,
            web3Provider.getSigner()
          );
          setHehContract(contract);
        } catch (e) {
          console.log(e);
        }
      }
    })();
  }, [
    chainId,
    hehContract,
    hehContractAddress,
    isAuthenticated,
    isWeb3Enabled,
  ]);

  // if (
  //   !nftSaleDataInitialised ||
  //   nftBalanceIsLoading ||
  //   !saleTimeInitialised ||
  //   revealTimeDiff === null
  // ) {
  //   return <Spin className="spin_loader" />;
  // }

  async function preRevealMint(event) {
    event.preventDefault();
    const formData = new FormData(event.target),
      formDataObj = Object.fromEntries(formData.entries());
    const numToMint = parseInt(formDataObj.mint_amount, 10);
    const cost = BigNumber.from(pricePerToken).mul(BigNumber.from(numToMint));

    hehContract.estimateGas
      .mintNFTPreReveal(numToMint, { value: cost, from: account })
      .then(function (estimate) {
        return estimate;
      })
      .then(function (estimate) {
        // increase gas limit to compensate for NFT price fluctuations
        const gasLimit = estimate.add(BigNumber.from("10000"));
        hehContract
          .mintNFTPreReveal(numToMint, { value: cost, from: account, gasLimit })
          .then(function (tx) {
            openNotification({
              message: "🔊 New Transaction",
              description: `📃 Tx Hash: ${tx.hash}`,
              type: "success",
            });
          })
          .catch(function (e) {
            openNotification({
              message: "🔊 Error",
              description: `📃 ${extractErrorMessage(e)}`,
              type: "error",
            });
            console.log(e);
          });
      })
      .catch(function (e) {
        openNotification({
          message: "🔊 Error",
          description: `📃 ${extractErrorMessage(e)}`,
          type: "error",
        });
        console.log(e);
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
                Mint the {MAX_TOTAL_SUPPLY} Hole Card combinations as NFTs.
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
                  {nftSaleDataInitialised ? (
                    <form onSubmit={(e) => preRevealMint(e)} name="mint-form">
                      <p>Mint Poker Hands</p>
                      <div>
                        <select id="mint_num" name={"mint_amount"}>
                          {Array.from(
                            { length: maxNumToMint },
                            (_, i) => i + 1
                          ).map((item, i) => (
                            <option value={item} key={i}>
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
                        disabled={
                          !hehIsLive ||
                          chainId === null ||
                          !maxNumToMint ||
                          !(
                            saleStartBlockDiff <= 0 &&
                            revealTimeDiff > 0 &&
                            startIdx === 0 &&
                            totalSupply < MAX_TOTAL_SUPPLY
                          )
                        }
                      />
                    </form>
                  ) : (
                    <Spin />
                  )}
                </div>
                <p>{`Total NFTs minted: ${
                  totalSupply !== null ? totalSupply : "0"
                }/${MAX_TOTAL_SUPPLY}`}</p>
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

          <div className="price_chart_area">
            {saleStartBlockDiff <= 0 &&
              revealTimeDiff > 0 &&
              startIdx === 0 &&
              totalSupply < MAX_TOTAL_SUPPLY && <PriceChart />}
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
                The 52 cards and {MAX_TOTAL_SUPPLY} card pair NFTs are available
                for open source use.
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
                    blockchains, can start at any time, and include up to{" "}
                    {MAX_TOTAL_SUPPLY}
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
