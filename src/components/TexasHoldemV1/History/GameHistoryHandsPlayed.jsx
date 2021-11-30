import { useMoralis } from "react-moralis"
import React, { useEffect, useState } from "react"
import { getDealRequestedText, getEllipsisTxt } from "../../../helpers/formatters"
import { Col, Row, Spin, Table } from "antd"
import { PlayingCard } from "../../PlayingCards/PlayingCard"
import BN from "bn.js"
import Moment from "react-moment"
import { getExplorer } from "../../../helpers/networks"
import { useMoralisDapp } from "../../../providers/MoralisDappProvider/MoralisDappProvider"

export const GameHistoryHandsPlayed = ({ gameId, round1Price, round2Price, finished = false }) => {

  const { Moralis } = useMoralis()
  const { chainId } = useMoralisDapp();

  const [totalFeesPaidFlop, setTotalFeesPaidFlop] = useState("0")
  const [totalFeesPaidTurn, setTotalFeesPaidTurn] = useState("0")
  const [totalFeesPaid, setTotalFeesPaid] = useState("0")
  const [totalWinnings, setTotalWinnings] = useState("0")
  const [houseCut, setHouseCut] = useState("0")
  const [totalWinningsInitialised, setTotalWinningsInitialised] = useState(false)
  const [handsPlayedFlop, setHandsPlayedFlop] = useState([])
  const [handsPlayedInitialisedFlop, setHandsPlayedInitialisedFlop] = useState(false)
  const [handsPlayedTurn, setHandsPlayedTurn] = useState([])
  const [handsPlayedInitialisedTurn, setHandsPlayedInitialisedTurn] = useState(false)
  const [highestRoundPlayed, setHighestRoundPlayed] = useState(0)

  const columns = [
    {
      title: '#',
      dataIndex: 'hand_num',
      key: 'hand_num',
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
      title: 'Bet',
      dataIndex: 'bet',
      key: 'bet',
    },
    {
      title: 'Time (UTC)',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Tx Hash',
      dataIndex: 'tx_hash',
      key: 'tx_hash',
    },
  ]

  const fetchHandsPlayedInRound = async (round) => {
    const THHandAdded = Moralis.Object.extend("THHandAdded")
    const queryTHHandAdded = new Moralis.Query(THHandAdded)
    queryTHHandAdded
      .equalTo("gameId", String(gameId))
      .equalTo("round", round)
      .ascending(["block_timestamp", "transaction_index"])
    return queryTHHandAdded.find()
  }

  async function getHandsPlayed(round) {
    const resultsTHHandAdded = await fetchHandsPlayedInRound(round)
    const roundPrice = round === "2" ? round1Price : round2Price

    let roundTotal = new BN("0")

    const hands = []
    for (let i = 0; i < resultsTHHandAdded.length; i += 1) {
      if (parseInt(round, 10) > highestRoundPlayed) {
        setHighestRoundPlayed(parseInt(round, 10))
      }
      roundTotal = roundTotal.add(new BN(roundPrice))
      const res = resultsTHHandAdded[i]
      const player = res.get("player")
      const txHash = res.get("transaction_hash")
      const date = res.get("block_timestamp")

      const hand = <>
        <PlayingCard cardId={res.get("card1")} key={`flop_${i}_${player}_${gameId}_card1`} width={35} />
        <PlayingCard cardId={res.get("card2")} key={`flop_${i}_${player}_${gameId}_card2`} width={35} />
      </>
      const hd = {
        key: `hands_played_history_${round}_${i}`,
        hand_num: i + 1,
        hand: hand,
        player: <a
          href={`${getExplorer(chainId)}/address/${player}`}
          target={"_blank"}
          rel={"noreferrer"}>
          {getEllipsisTxt(player, 8)}
        </a>,
        tx_hash: <a
          href={`${getExplorer(chainId)}/tx/${txHash}`}
          target={"_blank"}
          rel={"noreferrer"}>
          {getEllipsisTxt(txHash, 8)}
        </a>,
        timestamp: <Moment format="YYYY/MM/DD HH:mm:ss">{date.toString()}</Moment>,
        bet: Moralis.Units.FromWei(roundPrice, 18),
      }

      hands.push(hd)
    }

    if (resultsTHHandAdded.length > 0) {
      hands.push({
        key: resultsTHHandAdded.length,
        player: <strong>Total</strong>,
        bet: <strong>{Moralis.Units.FromWei(roundTotal.toString(), 18)}</strong>
      })
    }

    if (round === "2") {
      setHandsPlayedFlop(hands)
      setTotalFeesPaidFlop(roundTotal.toString())
    }
    if (round === "4") {
      setHandsPlayedTurn(hands)
      setTotalFeesPaidTurn(roundTotal.toString())
    }
  }

  useEffect(() => {
    if (!handsPlayedInitialisedFlop) {
      setHandsPlayedInitialisedFlop(true)
      getHandsPlayed("2")
    }

    if (!handsPlayedInitialisedTurn) {
      setHandsPlayedInitialisedTurn(true)
      getHandsPlayed("4")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, handsPlayedInitialisedFlop, handsPlayedInitialisedTurn])

  useEffect(() => {

    async function getTotalWinnings() {
      const THWinningsCalculated = Moralis.Object.extend("THWinningsCalculated")
      const query = new Moralis.Query(THWinningsCalculated)
      query
        .equalTo("gameId", String(gameId))
      const results = await query.find()

      let total = new BN("0")
      for (let i = 0; i < results.length; i += 1) {
        total = total.add(new BN(results[i].get("amount")))
      }
      setTotalWinnings(total.toString())

      if (finished) {
        const house = totalFees.sub(total)
        setHouseCut(house.toString())
      }
    }

    if (!totalWinningsInitialised && totalFeesPaidFlop !== "0" && totalFeesPaidTurn !== "0") {
      setTotalWinningsInitialised(true)
      getTotalWinnings()
    }

    const totalFees = new BN(totalFeesPaidFlop).add(new BN(totalFeesPaidTurn))
    setTotalFeesPaid(totalFees.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalWinningsInitialised, totalFeesPaidFlop, totalFeesPaidTurn])

  if (!handsPlayedInitialisedFlop && !handsPlayedInitialisedTurn && !totalWinningsInitialised) {
    return <Spin className="spin_loader" />
  }

  return (
    <div>
      <h3>Bets, Winnings and House summary</h3>

      <Row>
        <Col>
          Total Flop Bets: {Moralis.Units.FromWei(totalFeesPaidFlop, 18)} ETH
        </Col>
      </Row>
      <Row>
        <Col>
          Total Turn Bets: {Moralis.Units.FromWei(totalFeesPaidTurn, 18)} ETH
        </Col>
      </Row>
      <Row>
        <Col>
          Total Bets: {Moralis.Units.FromWei(totalFeesPaid, 18)} ETH
        </Col>
      </Row>
      {finished && <>
        <Row>
          <Col>
            Total Winnings: {Moralis.Units.FromWei(totalWinnings, 18)} ETH
          </Col>
        </Row>
        <Row>
          <Col>
            House Cut: {Moralis.Units.FromWei(houseCut, 18)} ETH
          </Col>
        </Row>
      </>
      }

      {
        !finished && <Row>
          <Col>
            Highest Round Played: {getDealRequestedText(highestRoundPlayed)}
          </Col>
        </Row>
      }



      <h3>Hands played in Flop</h3>

      <Table
        dataSource={handsPlayedFlop}
        columns={columns}
        pagination={false}
        bordered
        size={"small"}
      />


      <h3>Hands played in Turn</h3>

      {handsPlayedTurn.length > 0 ?
        <Table
          dataSource={handsPlayedTurn}
          columns={columns}
          pagination={false}
          bordered
          size={"small"}
        />
        : <p style={{ color: "white" }}>No hands played in Turn</p>
      }
    </div>
  )

}