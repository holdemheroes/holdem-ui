import React, { useState, useEffect } from "react";
import { Spin, Tabs } from "antd";
import StartNewGame from "./StartNewGame";
import Game from "./Game";
import { useGameMetadata } from "../../hooks/useGameMetadata";
import { getBakendObjPrefix } from "../../helpers/networks"
import { useMoralis } from "react-moralis"

export default function GamesV1() {

  const { chainId, account } = useMoralis();
  const backendPrefix = getBakendObjPrefix(chainId)

  const { maxConcurrentGames, gamesInProgress } = useGameMetadata(backendPrefix);

  const [gamesInProgress_r, setGamesInProgress_r] = useState([]);

  useEffect(() => {
    let tmp = [];
    tmp = [...gamesInProgress];
    tmp.reverse();
    setGamesInProgress_r([...tmp]);
  }, [gamesInProgress]);

  if (!maxConcurrentGames) {
    return <Spin className="spin_loader" />;
  }

  return (
    <div className="play-wrapper">
      <p className="title">Play Holdem Heroes</p>
      <StartNewGame gameIdsInProgress={gamesInProgress} maxConcurrentGames={maxConcurrentGames} />

      <Tabs>
        {
          gamesInProgress && gamesInProgress_r.map((item) => (
            <Tabs.TabPane tab={`Game #${item}`} key={`game_tab_${item}_${account}`}>
              <Game gameId={item.toNumber()} key={`game_outer_container_${item}_${account}`} />
            </Tabs.TabPane>
          ))
        }
      </Tabs>
    </div>
  );
}
