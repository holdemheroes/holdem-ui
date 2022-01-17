import "./style.scss";
import { DiscordLogo, TwitterLogo, OpenSeaLogo, DocumentationLogo } from "./Logos.jsx";

const menuItems = [
  {
    key: "discord",
    value: "Discord",
    icon: <DiscordLogo />,
  },
  {
    key: "twitter",
    value: "Twitter",
    icon: <TwitterLogo />,
  },
  {
    key: "opensea",
    value: "OpenSea",
    icon: <OpenSeaLogo />,
  },
  {
    key: "documentation",
    value: "Documentation",
    icon: <DocumentationLogo />,
  },
];

function Community() {
  return (
    <div className="dropdown-wrapper community">
      <button className="dropdown-btn">Community</button>
      <ul className="dropdown-body">
        {
          menuItems.map((item) => (
            <li key={item.key} className="dropdown-item">
              {item.icon}
              <span>{item.value}</span>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default Community;