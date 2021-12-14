import { useMoralis } from "react-moralis";
import './style.scss';

function Logout() {
  const { logout } = useMoralis();

  return (
    <button onClick={() => { logout(); }}>
      Disconnect
    </button>
  );
}

export default Logout;
