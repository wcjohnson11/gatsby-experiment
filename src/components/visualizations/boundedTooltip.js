import React from "react";
import { TooltipWithBounds } from "@vx/tooltip";
import style from "./boundedTooltip.module.css";

class BoundedToolTip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      top: props.tooltipTop,
      left: props.tooltipLeft,
      data: props.tooltipData
    };
  }

  render() {
    const { top, left, data } = this.state;
    return (
      <TooltipWithBounds
        key="tooltip"
        top={top}
        left={left}
        style={{
          letterSpacing: "normal"
        }}
      >
        {data && (
          <div className={style.tooltip}>
            <p>
              Country <span>{data.name}</span>
            </p>
            <p>
              {data.labels.x} <span>{data.x}</span>
            </p>
            <p>
              {data.labels.y} <span>{data.y}</span>
            </p>
          </div>
        )}
      </TooltipWithBounds>
    );
  }
}

export default BoundedToolTip;
