import React from "react";
import Countdown from 'react-countdown';


export default function SaleInfo(
  { startTime, revealTime, startingIndex }
) {
  const now = Math.floor(Date.now() / 1000);

  const saleStartDiff = startTime - now;
  const revealTimeDiff = revealTime - now;

  let saleInfo = null;

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return null;
    } else {
      // Render a countdown
      return (
        <div className="countdown">
          <div>
            <div>{days < 10 ? "0" + days : days}</div>
            <div>day</div>
          </div>
          <div>
            <div>{hours < 10 ? "0" + hours : hours}</div>
            <div>hrs</div>
          </div>
          <div>
            <div>{minutes < 10 ? "0" + minutes : minutes}</div>
            <div>min</div>
          </div>
          <div>
            <div>{seconds < 10 ? "0" + seconds : seconds}</div>
            <div>sec</div>
          </div>
        </div>
      );
    }
  };

  if (saleStartDiff > 0) {
    saleInfo = <>
      <div>Pre-reveal Sale starts in: <Countdown date={startTime * 1000} renderer={renderer} /></div>
      <div>Revealed in: <Countdown date={revealTime * 1000} renderer={renderer} /></div>
    </>;
  }

  if (saleStartDiff <= 0 && revealTimeDiff > 0) {
    saleInfo = <div>
      Revealed & distributed in: <Countdown date={revealTime * 1000} renderer={renderer} />
    </div>;
  }

  if (revealTimeDiff <= 0 && startingIndex === 0) {
    saleInfo = <div>
      pre-reveal sale ended. Waiting for distribution
    </div>;
  }

  return (
    <div className="sale_info">
      {saleInfo ? saleInfo : <div>{"Hands distributed!"}</div>}
    </div>
  );
}
