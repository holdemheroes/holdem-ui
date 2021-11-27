import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import './style.scss';

function Account() {
  const { authenticate, isAuthenticated, logout } = useMoralis();
  const { walletAddress } = useMoralisDapp();

  return (
    <button className={`btn btn-connect-wallet btn-shadow`} onClick={!isAuthenticated ? () => authenticate({ signingMessage: "HoldemHeroes!" }) : () => logout()}>
      {!isAuthenticated ? "Connect Wallet" : getEllipsisTxt(walletAddress, 6)}
    </button>
  )
}

export default Account;
