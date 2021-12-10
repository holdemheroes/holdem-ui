import { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { Menu, Layout } from "antd";
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

const { Header } = Layout;

const App = () => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Router>
      <Layout>
        <Header className="header">
          <Logo />
          <div className="header_chain-btn-wrapper">
            <Chains />
            {
              isAuthenticated && <>
                <Withdrawable />
                <Blockie currentWallet size={10} scale={5} />
              </>
            }
            <Account />
          </div>
          {
            isAuthenticated && <Menu
              defaultSelectedKeys={["home"]}
              mode="horizontal"
            >
              <Menu.Item key="home">
                <NavLink to="/home">Home</NavLink>
              </Menu.Item>
              <Menu.Item key="sale">
                <NavLink to="/sale">HEH Mint Sale</NavLink>
              </Menu.Item>
              <Menu.Item key="nft">
                <NavLink to="/nftBalance">HEH Wallet</NavLink>
              </Menu.Item>
              <Menu.Item key="gameplay">
                <NavLink to="/game-play">Game Play</NavLink>
              </Menu.Item>
              <Menu.Item key="play-v1">
                <NavLink to="/play-v1" className="hover-expand">Play</NavLink>
              </Menu.Item>
              <Menu.Item key="refundable">
                <NavLink to="/refundable">Refundable</NavLink>
              </Menu.Item>
              <Menu.Item key="history">
                <NavLink to="/history">History</NavLink>
              </Menu.Item>
            </Menu>
          }
        </Header>
        <>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/home">
              <Home />
            </Route>
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
            <Route path="/nonauthenticated">
              <>Please login using the "Authenticate" button</>
            </Route>
            {/* <Redirect from="/" to="/wallet" /> */}
          </Switch>
          {/* {isAuthenticated ? <Redirect to="/home" /> : <Redirect to="/nonauthenticated" />} */}
          {/* <Redirect to="/home" /> */}
        </>
      </Layout>
    </Router>
  );
};

export const Logo = () => (
  <NavLink to="/home"><img src={logo} alt="Site logo comes here" /></NavLink>
);

export default App;
