import React from "react"

export const flipCardRenderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    return null;
  } else {
    // Render a countdown
    return (
      <div className="time_card-wrapper">
        <div className="time_card">
          <p>{days < 10 ? "0" + days : days}</p>
          <p>days</p>
        </div>
        <div className="time_card">
          <p>{hours < 10 ? "0" + hours : hours}</p>
          <p>hours</p>
        </div>
        <div className="time_card">
          <p>{minutes < 10 ? "0" + minutes : minutes}</p>
          <p>minutes</p>
        </div>
      </div>
    );
  }
};

export const largeTextRenderer = ({ days, hours, minutes, seconds, completed }) => {
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

export const simpleTextRenderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    return null;
  } else {
    // Render a countdown
    return (
      <>
        {days < 10 ? "0" + days : days}d, {hours < 10 ? "0" + hours : hours}:{minutes < 10 ? "0" + minutes : minutes}:{seconds < 10 ? "0" + seconds : seconds}
      </>
    );
  }
};
