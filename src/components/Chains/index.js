import { useEffect, useState } from "react";
import useChain from "../../hooks/useChain";
import { ETHLogo, PolygonLogo } from "./Logos";
import "./style.scss";
import { useMoralis } from "react-moralis"

const menuItems = [
  {
    key: "0x4",
    value: "Rinkeby",
    icon: <ETHLogo size="S" />,
    iconL: <ETHLogo size="L" />,
  },
  {
    key: "0x13881",
    value: "Polygon Mumbai",
    icon: <PolygonLogo />,
    iconL: <PolygonLogo />,
  },
];

function Chains() {
  const { switchNetwork } = useChain();
  const { chainId } = useMoralis();
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);
    setSelected(newSelected);
  }, [chainId]);

  const handleMenuClick = (e) => {
    switchNetwork(e.target.closest("li").getAttribute("chain_key"));
  };

  return (
    <div className="dropdown-wrapper select_chain">
      <button className="dropdown-btn">{selected?.iconL}</button>
      <ul className="dropdown-body" onClick={handleMenuClick}>
        {
          menuItems.map((item) => (
            <li key={item.key} className="dropdown-item" chain_key={item.key}>
              {item.icon}
              <span>{item.value}</span>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default Chains;
