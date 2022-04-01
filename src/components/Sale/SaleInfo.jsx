import React from "react";
import Countdown from "react-countdown";
import { largeTextRenderer } from "../../helpers/timers"

export default function SaleInfo({
  startBlockNum,
  revealTime,
  startingIndex,
  currentBlock,
  saleStartTime,
  saleStartBlockDiff,
}) {
  const now = Math.floor(Date.now() / 1000);
  const revealTimeDiff = revealTime - now;

  let saleInfo = null;

  if (saleStartBlockDiff > 0) {
    saleInfo = (
      <>
        <div>
          Pre-reveal Sale starts at block #{startBlockNum.toNumber()}:{" "}
          <Countdown date={saleStartTime * 1000} renderer={largeTextRenderer} />
        </div>
        <div style={{ marginBottom: "50px" }}>
          Current block: {currentBlock}
        </div>
        <div>
          Revealed in:{" "}
          <Countdown date={revealTime * 1000} renderer={largeTextRenderer} />
        </div>
      </>
    );
  }

  if (saleStartBlockDiff <= 0 && revealTimeDiff > 0) {
    saleInfo = (
      <div>
        Reveal and Airdrop in:{" "}
        <Countdown date={revealTime * 1000} renderer={largeTextRenderer} />
      </div>
    );
  }

  if (revealTimeDiff <= 0 && startingIndex === 0) {
    saleInfo = <div>pre-reveal sale ended. Waiting for distribution</div>;
  }

  return (
    <div className="sale_info">
      {saleInfo ? saleInfo : <div>{"Hands distributed!"}</div>}
    </div>
  );
}
