import React from "react";
import { Spin, Tabs } from "antd";
import StartNewGame from "./StartNewGame";
import Game from "./Game";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useGameMetadata } from "../../hooks/useGameMetadata";

export default function GamesV1() {
  const { walletAddress } = useMoralisDapp();

  const { maxConcurrentGames, gamesInProgress } = useGameMetadata();

  if (!maxConcurrentGames) {
    return <Spin className="spin_loader" />;
  }

  return (
    <div className="play-wrapper">
      <h2>Play Holdem Heroes</h2>
      <StartNewGame gameIdsInProgress={gamesInProgress} maxConcurrentGames={maxConcurrentGames} />

      <Tabs>
        {
          gamesInProgress && gamesInProgress.map((item) => (
            <Tabs.TabPane tab={`Game #${item}`} key={`game_tab_${item}_${walletAddress}`}>
              <div>
                <Game gameId={item} key={`game_outer_container_${item}_${walletAddress}`} />
              </div>
            </Tabs.TabPane>
          ))
        }
      </Tabs>
    </div>
  );
}