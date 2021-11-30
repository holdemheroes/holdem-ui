import React from "react"
import { getRoundStatusText } from "../../helpers/formatters"
import { Spin } from "antd"

export const GameStatus = ({ status, gameHasEnded }) => {

  let spinner = <></>
  if (status === 1 || status === 3 || status === 5) {
    spinner = <Spin />
  }
  return (
    <>
      {
        gameHasEnded ? <strong>Game Ended!</strong> : <span>{spinner}{getRoundStatusText(status)}</span>
      }
    </>
  )

}