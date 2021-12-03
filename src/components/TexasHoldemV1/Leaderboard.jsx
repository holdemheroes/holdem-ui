import React, { useEffect, useState } from "react";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisSubscription } from "react-moralis";
import { Spin, Table } from "antd";
import { PlayingCard } from "../PlayingCards/PlayingCard";
import { getEllipsisTxt, sortFinalHand } from "../../helpers/formatters";
import { RankName } from "./RankName";
import { getExplorer } from "../../helpers/networks";
import Moment from "react-moment";

export const Leaderboard = ({ gameId, showWinnings = false }) => {
  const { walletAddress } = useMoralisDapp();
  const { Moralis } = useMoralis();
  const { chainId } = useMoralisDapp();

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardTableData, setLeaderboardTableData] = useState([]);
  const [leaderboardInitialised, setLeaderboardInitialised] = useState(false);

  const [winnings, setWinnings] = useState({});
  const [winningsInitialised, setWinningsInitialised] = useState(false);

  const columns = [
    {
      title: '#',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Hand',
      dataIndex: 'hand',
      key: 'hand',
    },
    {
      title: 'Player',
      dataIndex: 'player',
      key: 'player',
    },
    {
      title: 'Tx',
      dataIndex: 'tx_hash',
      key: 'tx_hash',
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
    },
    {
      title: 'Rank Name',
      dataIndex: 'rank_name',
      key: 'rank_name',
    },
  ];

  if (showWinnings) {
    columns.push(
      {
        title: 'Winnings',
        dataIndex: 'winnings',
        key: 'winnings',
      }
    );
  }

  function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }

      const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }

  const sortLeaderboard = (lb) => {
    let newLb = []
    if (lb.length > 0) {
      newLb = [...lb].sort(compareValues("rank", "asc"));
    }
    return newLb;
  }

  useEffect(() => {
    async function getLeaderboard() {
      const THFinalHandPlayed = Moralis.Object.extend("THFinalHandPlayed");
      const queryTHFinalHandPlayed = new Moralis.Query(THFinalHandPlayed);
      queryTHFinalHandPlayed
        .equalTo("gameId", String(gameId));
      const resultsTHFinalHandPlayed = await queryTHFinalHandPlayed.find();

      const lb = [];
      for (let i = 0; i < resultsTHFinalHandPlayed.length; i += 1) {
        const res = resultsTHFinalHandPlayed[i];
        const fh = {};
        const cTmp = sortFinalHand(
          res.get("card1"), res.get("card2"), res.get("card3"), res.get("card4"), res.get("card5")
        );
        fh.player = res.get("player");
        fh.card1 = cTmp[0];
        fh.card2 = cTmp[1];
        fh.card3 = cTmp[2];
        fh.card4 = cTmp[3];
        fh.card5 = cTmp[4];
        fh.rank = parseInt(res.get("rank"), 10);
        fh.txHash = res.get("transaction_hash");
        fh.timestamp = res.get("block_timestamp");
        lb.push(fh);
      }

      setLeaderboard(sortLeaderboard(lb));
    }

    if (!leaderboardInitialised) {
      setLeaderboardInitialised(true);
      getLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, leaderboardInitialised]);

  useEffect(() => {
    async function getWinnings() {
      const THWinningsCalculated = Moralis.Object.extend("THWinningsCalculated");
      const queryTHWinningsCalculated = new Moralis.Query(THWinningsCalculated);
      queryTHWinningsCalculated
        .equalTo("gameId", String(gameId));
      const resultsTHWinningsCalculated = await queryTHWinningsCalculated.find();

      const w = {};
      for (let i = 0; i < resultsTHWinningsCalculated.length; i += 1) {
        const res = resultsTHWinningsCalculated[i];
        const player = res.get("player");
        const amount = res.get("amount");
        w[player] = amount;
      }
      setWinnings(w);
    }

    if (!winningsInitialised) {
      setWinningsInitialised(true);
      if (showWinnings) {
        getWinnings();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, winningsInitialised, showWinnings]);

  function handleFinalHandPlayed(data) {

    const gId = parseInt(data.attributes.gameId, 10);
    const newLb = [...leaderboard];

    if (gId === parseInt(gameId, 10)) {
      const fh = {};
      const cTmp = sortFinalHand(
        data.attributes.card1,
        data.attributes.card2,
        data.attributes.card3,
        data.attributes.card4,
        data.attributes.card5
      );
      fh.player = data.attributes.player;
      fh.card1 = cTmp[0];
      fh.card2 = cTmp[1];
      fh.card3 = cTmp[2];
      fh.card4 = cTmp[3];
      fh.card5 = cTmp[4];
      fh.rank = parseInt(data.attributes.rank, 10);

      newLb.push(fh);
    }
    setLeaderboard(sortLeaderboard(newLb));
  }

  useEffect(() => {

    const data = [];
    if (winningsInitialised && leaderboardInitialised) {
      for (let i = 0; i < leaderboard.length; i += 1) {
        const h = <>
          <PlayingCard cardId={leaderboard[i].card1} key={`leaderboard_${i}_${leaderboard[i].player}_${gameId}_card1`} width={35} />
          <PlayingCard cardId={leaderboard[i].card2} key={`leaderboard_${i}_${leaderboard[i].player}_${gameId}_card2`} width={35} />
          <PlayingCard cardId={leaderboard[i].card3} key={`leaderboard_${i}_${leaderboard[i].player}_${gameId}_card3`} width={35} />
          <PlayingCard cardId={leaderboard[i].card4} key={`leaderboard_${i}_${leaderboard[i].player}_${gameId}_card4`} width={35} />
          <PlayingCard cardId={leaderboard[i].card5} key={`leaderboard_${i}_${leaderboard[i].player}_${gameId}_card5`} width={35} />
        </>;

        const player = getEllipsisTxt(leaderboard[i].player, 6);
        const rankName = <RankName rank={leaderboard[i].rank} key={`${gameId}_${leaderboard[i].rank}`} />;

        const d = {
          key: i,
          position: leaderboard[i].player === walletAddress ? <strong>{i + 1}</strong> : i + 1,
          hand: h,
          player: leaderboard[i].player === walletAddress ?
            <strong>
              <a
                href={`${getExplorer(chainId)}/address/${leaderboard[i].player}`}
                target={"_blank"}
                rel={"noreferrer"}>
                {player}
              </a>
            </strong>
            : <a
              href={`${getExplorer(chainId)}/address/${leaderboard[i].player}`}
              target={"_blank"}
              rel={"noreferrer"}>
              {player}
            </a>,
          rank: leaderboard[i].player === walletAddress ? <strong>{leaderboard[i].rank}</strong> : leaderboard[i].rank,
          rank_name: leaderboard[i].player === walletAddress ? <strong>{rankName}</strong> : rankName,
          tx_hash: leaderboard[i].player === walletAddress ?
            <strong>
              <a
                href={`${getExplorer(chainId)}/tx/${leaderboard[i].txHash}`}
                target={"_blank"}
                rel={"noreferrer"}>
                {getEllipsisTxt(leaderboard[i].txHash, 4)}
              </a>
            </strong>
            : <a
              href={`${getExplorer(chainId)}/address/${leaderboard[i].txHash}`}
              target={"_blank"}
              rel={"noreferrer"}>
              {getEllipsisTxt(leaderboard[i].txHash, 4)}
            </a>,
          timestamp: <Moment format="YYYY/MM/DD HH:mm:ss">{leaderboard[i].timestamp.toString()}</Moment>,
        };

        if (showWinnings) {
          const w = Moralis.Units.FromWei(winnings[leaderboard[i].player], 18);
          d.winnings = leaderboard[i].player === walletAddress ? <strong>{w} ETH</strong> : <>{w} ETH</>;
        }

        data.push(d);
      }
    }
    setLeaderboardTableData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboard, winnings, leaderboardInitialised, winningsInitialised]);

  // subscribe to FinalHandPlayed events - THFinalHandPlayed
  useMoralisSubscription("THFinalHandPlayed",
    q => q.equalTo("gameId", String(gameId)),
    [gameId, walletAddress],
    {
      onCreate: data => handleFinalHandPlayed(data),
    });

  if (!leaderboardInitialised || !winningsInitialised) {
    return <Spin className="spin_loader" />;
  }

  return (
    <>
      <Table
        dataSource={leaderboardTableData}
        columns={columns}
        pagination={false}
        bordered
        size={"small"}
      />
    </>
  );
}