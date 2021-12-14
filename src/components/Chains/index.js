import { useEffect, useState } from "react";
import useChain from "../../hooks/useChain";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { ETHLogo } from "./Logos";
import "./style.scss";

const menuItems = [
  {
    key: "0x1",
    value: "Ethereum Mainnet",
    icon: <ETHLogo size="S" />,
    iconL: <ETHLogo size="L" />,
  },
  {
    key: "0x539",
    value: "Local Chain",
    icon: <ETHLogo size="S" />,
    iconL: <ETHLogo size="L" />,
  },
  {
    key: "0xaa289",
    value: "VorDev Chain",
    icon: <ETHLogo size="S" />,
    iconL: <ETHLogo size="L" />,
  },
  {
    key: "0x4",
    value: "Rinkeby Testnet",
    icon: <ETHLogo size="S" />,
    iconL: <ETHLogo size="L" />,
  },
];

function Chains() {
  const { switchNetwork } = useChain();
  const { chainId } = useMoralisDapp();
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);
    setSelected(newSelected);
    console.log("current chainId: ", chainId);
  }, [chainId]);

  const handleMenuClick = (e) => {
    console.log("switch to: ", e.target.closest("li").getAttribute("chain_key"));
    switchNetwork(e.target.closest("li").getAttribute("chain_key"));
  };

  // const menu = (
  //   <Menu onClick={handleMenuClick}>
  //     {menuItems.map((item) => (
  //       <Menu.Item key={item.key} icon={item.icon} style={styles.item}>
  //         <span style={{ marginLeft: "5px" }}>{item.value}</span>
  //       </Menu.Item>
  //     ))}
  //   </Menu>
  // );

  return (
    // <div>
    //   <Dropdown overlay={menu} trigger={["click"]}>
    //     <button
    //       key={selected?.key}
    //       icon={selected?.icon}
    //       // style={{ ...styles.button, ...styles.item }}
    //       className="btn btn-connect-wallet btn-shadow"
    //     >
    //       <span style={{ marginLeft: "5px", marginRight: "5px" }}>{selected?.iconL}</span>
    //       <DownOutlined />
    //     </button>
    //   </Dropdown>
    // </div>
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