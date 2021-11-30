import React from "react"
import Countdown from 'react-countdown';


export default function SaleInfo(
  { startTime, revealTime, startingIndex }
) {

  const now = Math.floor(Date.now() / 1000)

  const saleStartDiff = startTime - now
  const revealTimeDiff = revealTime - now

  let saleInfo = null;

  if (saleStartDiff > 0) {
    saleInfo = <>
      Pre-reveal Sale starts in: <Countdown date={startTime * 1000} />
      <br />
      Revealed in: <Countdown date={revealTime * 1000} />
    </>;
  }

  if (revealTimeDiff > 0) {
    saleInfo = <>
      Revealed & distributed in: <Countdown date={revealTime * 1000} />
    </>;
  }

  if (revealTimeDiff <= 0 && startingIndex === 0) {
    saleInfo = <>
      pre-reveal sale ended. Waiting for distribution
    </>;
  }

  return (
    <div className="sale_info">
      {saleInfo ? saleInfo : "Hands distributed!"}
    </div>
  )
}
