import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Form, Input, Button, Spin } from 'antd';
import { openNotification } from "../../helpers/notifications";
import abis from "../../helpers/contracts";
import { getCurrencySymbol, getTexasHoldemV1Address } from "../../helpers/networks"

export default function StartNewGame({ gameIdsInProgress, maxConcurrentGames }) {
  const { Moralis, chainId } = useMoralis();
  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);
  const currencySymbol = getCurrencySymbol(chainId)
  const [started, setStarted] = useState(false);

  if (!gameIdsInProgress || !maxConcurrentGames) {
    return <Spin className="spin_loader" />;
  }

  async function startNewCustomGame(values) {
    const roundTime = parseInt(values.round_timer, 10) * 60;
    const round1Price = Moralis.Units.ETH(values.round_1_price.trim());
    const round2Price = Moralis.Units.ETH(values.round_2_price.trim());

    if (roundTime <= 0) {
      openNotification({
        message: "🔊 Error",
        description: "round time cannot be 0",
        type: "error"
      });
      return;
    }
    if (round1Price === "0") {
      openNotification({
        message: "🔊 Error",
        description: "flop bet cannot be 0",
        type: "error"
      });
      return;
    }
    if (round2Price === "0") {
      openNotification({
        message: "🔊 Error",
        description: "turn bet cannot be 0",
        type: "error"
      });
      return;
    }

    const options = {
      contractAddress,
      functionName: "startCustomGame",
      abi,
      params: {
        _gameRoundTimeSeconds: roundTime,
        _round1Price: round1Price,
        _round2Price: round2Price,
      }
    };

    try {
      const tx = await Moralis.executeFunction({ awaitReceipt: false, ...options });
      openNotification({
        message: "🔊 New Transaction",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success"
      });
      setStarted(false);
    } catch (e) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Receipt: ${e.message}`,
        type: "error"
      });
      console.log(e);
    }
  }

  if (gameIdsInProgress.length === maxConcurrentGames) {
    return (
      <p>Max number of concurrent games already in progress</p>
    );
  }

  return (
    <>
      <button onClick={() => { setStarted(started => !started) }} style={{ display: started ? "none" : "block" }} className="start_btn btn-shadow">Start New Game</button>
      <div style={{ display: started ? "block" : "none", width: "340px", margin: "0 auto" }} className="game_start_card">
        <p className="title">Start New Game</p>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={startNewCustomGame}
          autoComplete="off"
        >
          <Form.Item
            initialValue={"60"}
            label="Round Time"
            name="round_timer"
            rules={[{ required: true, message: 'Please input round time' }]}
          >
            <Input addonAfter={"Minutes"} />
          </Form.Item>

          <Form.Item
            initialValue={"0.1"}
            label="Flop bet"
            name="round_1_price"
            rules={[{ required: true, message: 'Please input flop bet' }]}
          >
            <Input addonAfter={`${currencySymbol} Per NFT`} />
          </Form.Item>

          <Form.Item
            initialValue={"0.2"}
            label="Turn bet"
            name="round_2_price"
            rules={[{ required: true, message: 'Please input turn bet' }]}
          >
            <Input addonAfter={`${currencySymbol} Per NFT`} />
          </Form.Item>

          <Form.Item className="start_btn-wrapper">
            <Button type="primary" htmlType="submit">
              Start!
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}
