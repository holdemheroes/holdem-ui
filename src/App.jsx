import { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect } from "react-router-dom";
import { useMoralis } from "react-moralis";
import "antd/dist/antd.css";
import Account from "./components/Account";
import Chains from "./components/Chains";
import NFTBalance from "./components/NFTBalance";
import Blockie from "./components/Blockie";
import Sale from "./components/Sale";
import GamesV1 from "./components/TexasHoldemV1";
import Withdrawable from "./components/Withdrawable";
import RefundableGames from "./components/TexasHoldemV1/RefundableGames";
import { History } from "./components/TexasHoldemV1/History/History";
import Home from "./pages/Home";
import GamePlay from "./pages/GamePlay";
import "./App.scss";
import logo from "./assets/images/hhlogo.png";
import { useMoralisDapp } from "./providers/MoralisDappProvider/MoralisDappProvider";
import { getEllipsisTxt } from "./helpers/formatters";
import Logout from "./components/Logout";

const App = () => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();
  const { walletAddress } = useMoralisDapp();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Router>
      <div className="header">
        <Logo />
        <div className="topnav">
          {
            !isAuthenticated && <>
              <a href='https://discord.gg/wqZdRNruHG' target='_blank' rel="noreferrer" className="color-white discord_btn mr-40">Discord</a>
              <Account />
            </>
          }
          {
            isAuthenticated && <>
              <div>
                <NavLink to="/sale">Marketplace</NavLink>
                <NavLink to="/nftBalance">NFT Wallet</NavLink>
                <NavLink to="/game-play">Rules</NavLink>
              </div>
              <NavLink to="/play-v1" className="hover-expand" className="btn-play" style={{ marginRight: "35px" }}>Play</NavLink>
              <div className="dropdown-wrapper account" style={{ marginRight: "15px" }}>
                <button className="dropdown-btn address_btn">
                  <Blockie className="circle" currentWallet size={5} scale={5} />
                  {getEllipsisTxt(walletAddress, 6)}
                </button>
                <ul className="dropdown-body">
                  <li className="dropdown-item"><Withdrawable /></li>
                  <li className="dropdown-item"><NavLink to="history">Game History</NavLink></li>
                  <li className="dropdown-item"><NavLink to="refundable">Refunds</NavLink></li>
                  <li className="dropdown-item"><Logout /></li>
                </ul>
              </div>
              <Chains />
            </>
          }
        </div>
      </div>
      <>
        <Switch>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route path="/home">
            <Home />
          </Route>
          {
            isAuthenticated && <>
              <Route path="/sale">
                <Sale />
              </Route>
              <Route path="/game-play">
                <GamePlay />
              </Route>
              <Route path="/nftBalance">
                <NFTBalance />
              </Route>
              <Route path="/play-v1">
                <GamesV1 />
              </Route>
              <Route path="/refundable">
                <RefundableGames />
              </Route>
              <Route path="/history">
                <History />
              </Route>
            </>
          }
          {
            !isAuthenticated && <Redirect to="/home" />
          }
        </Switch>
      </>
    </Router>
  );
};

export const Logo = () => (
  <NavLink to="/home"><img src={logo} alt="Site logo comes here" /></NavLink>
);

export default App;
