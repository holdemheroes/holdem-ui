import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import { useMoralis } from "react-moralis";
import "antd/dist/antd.css";
import Account from "./components/Account";
import Chains from "./components/Chains";
import Community from "./components/Community";
import NFTBalance from "./components/NFTBalance/";
import Blockie from "./components/Blockie";
import Sale from "./components/Sale";
import GamesV1 from "./components/TexasHoldemV1";
import Withdrawable from "./components/Withdrawable";
import RefundableGames from "./components/TexasHoldemV1/RefundableGames";
import { History } from "./components/TexasHoldemV1/History/History";
import Home from "./pages/Home";
import HomeL2 from "./pages/HomeL2";
import GamePlay from "./pages/GamePlay";
import GameComingSoon from "./components/TexasHoldemV1/GameComingSoon";
import "./App.scss";
import { getEllipsisTxt } from "./helpers/formatters";
import Logout from "./components/Logout";
import { logo } from "./logo";
import { getChainType, getGameIsLive } from "./helpers/networks";
import ScrollToTop from "./ScrollToTop";

const App = () => {
  const {
    isWeb3Enabled,
    enableWeb3,
    isAuthenticated,
    isWeb3EnableLoading,
    chainId,
    account,
  } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  const chainType = getChainType(chainId);
  const gameIsLive = getGameIsLive(chainId);

  return (
    <Router>
      <div className={`header-wrapper`}>
        <div className="header">
          <Logo />
          <div className="topnav">
            <div>
              <NavLink to="/Marketplace">Marketplace</NavLink>
              <NavLink to="/NFTwallet">NFT Wallet</NavLink>
              <NavLink to="/Rules">Rules</NavLink>
              <Community />
            </div>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/Play"
                  className="btn-play"
                  style={{ marginRight: "35px" }}
                >
                  Play
                </NavLink>
                <div
                  className="dropdown-wrapper account"
                  style={{ marginRight: "15px" }}
                >
                  <button className="dropdown-btn address_btn">
                    <Blockie
                      className="circle"
                      currentWallet
                      size={5}
                      scale={5}
                    />
                    {getEllipsisTxt(account, 6)}
                  </button>
                  <ul className="dropdown-body">
                    {gameIsLive && (
                      <>
                        <li className="dropdown-item">
                          <Withdrawable />
                        </li>
                        <li className="dropdown-item">
                          <NavLink to="/History">Game History</NavLink>
                        </li>
                        <li className="dropdown-item">
                          <NavLink to="/Refunds">Refunds</NavLink>
                        </li>
                      </>
                    )}
                    <li className="dropdown-item">
                      <Logout />
                    </li>
                  </ul>
                </div>
                <Chains />
              </>
            )}
            {!isAuthenticated && <Account />}
          </div>
        </div>
      </div>
      <>
        <ScrollToTop>
          <Switch>
            <Route exact path="/">
              {(!chainType || chainType === "l1") && <Home />}
              {chainType === "l2" && <HomeL2 />}
            </Route>
            <Route path="/Marketplace">
              {/* {gameIsLive && <Sale />}
                  {!gameIsLive && <GameComingSoon />} */}
              <GameComingSoon />
            </Route>
            <Route path="/Rules">
              <GamePlay />
            </Route>
            <Route path="/NFTwallet">
              {/* {gameIsLive && <Sale />}
                  {!gameIsLive && <GameComingSoon />} */}
              <GameComingSoon />
            </Route>
            {isAuthenticated && (
              <>
                <Route path="/Play">
                  {gameIsLive && <GamesV1 />}
                  {!gameIsLive && <GameComingSoon />}
                </Route>
                <Route path="/Refunds">
                  {gameIsLive && <RefundableGames />}
                  {!gameIsLive && <GameComingSoon />}
                </Route>
                <Route path="/History">
                  {gameIsLive && <History />}
                  {!gameIsLive && <GameComingSoon />}
                </Route>
              </>
            )}
          </Switch>
        </ScrollToTop>
      </>
    </Router>
  );
};

export const Logo = () => <NavLink to="/">{logo()}</NavLink>;

export default App;
