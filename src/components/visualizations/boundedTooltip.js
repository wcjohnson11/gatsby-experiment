import React from "react";
import { TooltipWithBounds } from "@vx/tooltip";
import style from "./styles/boundedTooltip.module.css";

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
              Country
            </p>
            <p><span>{data.name}</span></p>
            <p>
              {data.labels.x}
            </p>
            <p><span>{data.x}</span></p>
            { data.y &&
              <p>
                {data.labels.y} <span>{data.y}</span>
              </p>
            }
          </div>
        )}
      </TooltipWithBounds>
    );
  }
}

export default BoundedToolTip;
