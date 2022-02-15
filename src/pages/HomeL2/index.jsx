import React from "react";
import { NavLink } from "react-router-dom";
import "./style.scss";
import AnimateButton from "../../components/AnimateButton";
import Timeline from "../../components/Timeline";

export default function HomeL2() {
  return (
    <div className="main-wrapper">
      <div className="section--nft_poker-wrapper" id="section--nft_poker">
        <div className="section--nft_poker">
          <div>
            <p>NFT Poker</p>
            <p>Holdem Heroes is the on-chain NFT Poker game.<br />Mint the 1326 Hole Card combinations as NFTs.<br />Then play Texas Hold&#x27;em with them!</p>
          </div>
        </div>

        <div style={{ marginTop: "160px" }}>
          <Timeline />
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
              Games take place on both the Ethereum and Polygon blockchains, can start at any time, and include up to 1326 players.
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