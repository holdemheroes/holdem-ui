import "./style.scss";
import { DiscordLogo, TwitterLogo, OpenSeaLogo, DocumentationLogo, MediumLogo } from "./Logos.jsx";

const menuItems = [
  {
    key: "discord",
    value: "Discord",
    icon: <DiscordLogo />,
    link: "https://discord.gg/dmgga7b72Y",
  },
  {
    key: "twitter",
    value: "Twitter",
    icon: <TwitterLogo />,
    link: "https://twitter.com/holdemheroes",
  },
  {
    key: "opensea",
    value: "OpenSea",
    icon: <OpenSeaLogo />,
    link: "https://opensea.io/collection/holdemheroes",
  },
  {
    key: "blog",
    value: "Blog",
    icon: <MediumLogo />,
    link: "https://medium.com/holdem-heroes",
  },
  {
    key: "documentation",
    value: "Documentation",
    icon: <DocumentationLogo />,
    link: "https://docs.holdemheroes.com/",
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
              <a href={item.link} target="_blank">
                {item.icon}
                <span>{item.value}</span>
              </a>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default Community;