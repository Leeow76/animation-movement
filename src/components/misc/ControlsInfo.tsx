import React from 'react'

const ControlsInfo = () => {
  return (
    <div className="controls-info__box">
      <p className="controls-info__row">
        <span>Movement controls:</span>
        <span>W, A, S, D keys</span>
      </p>
      <p className="controls-info__row">
        <span>Run:</span>
        <span>Shift + movement key</span>
      </p>
      <p className="controls-info__row">
        <span>Move camera:</span>
        <span>click-drag screen</span>
      </p>
    </div>
  )
}

export default ControlsInfo
