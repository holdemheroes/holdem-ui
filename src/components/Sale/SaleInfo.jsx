import React from "react"
import Countdown from 'react-countdown';


export default function SaleInfo(
  { startTime, revealTime, startingIndex }
) {

  const now = Math.floor(Date.now() / 1000)

  const saleStartDiff = startTime - now
  const revealTimeDiff = revealTime - now

  if(saleStartDiff > 0) {
    return (
      <div>
        Pre-reveal Sale starts in: <Countdown date={startTime * 1000} />
        <br/>
        Revealed in: <Countdown date={revealTime * 1000} />
      </div>
    )
  }

  if(revealTimeDiff > 0) {
    return (
      <div>
        Revealed & distributed in: <Countdown date={revealTime * 1000} />
      </div>
    )
  }

  if(revealTimeDiff <= 0 && startingIndex === 0) {
    return (
      <div>
        pre-reveal sale ended. Waiting for distribution
      </div>
    )
  }

  return (
    <div>
      Hands distributed!
    </div>
  )
}
