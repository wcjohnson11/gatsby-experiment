import React from "react";
import { Group } from "@vx/group";
import { Grid } from "@vx/grid";
import { Circle } from "@vx/shape";
import { scaleLinear } from "@vx/scale";
import { AxisLeft, AxisBottom } from "@vx/axis";
import { localPoint } from "@vx/event";
import BoundedToolTip from "./boundedTooltip";
import { withTooltip } from "@vx/tooltip";
import { withParentSize } from "@vx/responsive";
import * as chroma from "chroma-js";
import { max, select } from "d3";
import formatMoney from "../../utils/formatMoney";
import numTicksForHeight from "../../utils/numTicksForHeight";
import numTicksForWidth from "../../utils/numTicksForWidth";
import style from "./scatterplot.module.css";

const margin = 30;

const colorFunction = (currentCountry, d) => {
  if (currentCountry) {
    if (currentCountry === d.key) {
      return d.color;
    } else {
      return "gray";
    }
  } else {
    return d.color;
  }
};

const radiusFunction = (currentCountry, d) => {
  if (currentCountry) {
    if (currentCountry === d.key) {
      return 4;
    } else {
      return d.r;
    }
  } else {
    return d.r;
  }
};

const strokeWidthFunction = (currentCountry, d) => {
  if (currentCountry) {
    if (currentCountry === d.key) {
      return 2;
    } else {
      return 1;
    }
  } else {
    return 2;
  }
};

class VxScatterplot extends React.Component {
  state = {
    cicles: [],
    labels: {},
    xScale: false,
    yScale: false,
    currentContinent: false,
    currentCountry: false
  };
  circleRef = React.createRef();

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      data,
      parentWidth,
      zScale,
      currentContinent,
      currentCountry,
      linkHighlighting
    } = nextProps;
    const parentHeight = parentWidth;
    if (!data) return {};

    const labels = {
      x: data.x,
      y: data.y
    };

    const xScale = scaleLinear({
      domain: [0, max(data, d => d.x)],
      range: [margin, parentWidth - margin - margin]
    });

    const yScale = scaleLinear({
      domain: [0, max(data, d => d.y)],
      range: [parentHeight - margin, margin]
    });

    if (currentContinent) {
      const filteredData = data.filter(d => currentContinent === d.continent);
      const circles = filteredData.map(d => {
        return {
          cx: xScale(d.x),
          cy: yScale(d.y),
          x: `$${formatMoney(d.x, 2)}`,
          y: d.y,
          color: zScale(d.continent),
          r: 3,
          key: d.name
        };
      });
      return {
        labels,
        circles,
        currentCountry,
        xScale,
        yScale,
        parentHeight,
        linkHighlighting
      };
    }

    const circles = data.map(d => {
      return {
        cx: xScale(d.x),
        cy: yScale(d.y),
        x: `$${formatMoney(d.x, 2)}`,
        y: d.y,
        color: zScale(d.continent),
        r: 3,
        key: d.name
      };
    });

    return {
      labels,
      circles,
      xScale,
      yScale,
      parentHeight
    };
  }

  componentDidMount() {
    const { circles } = this.state;
    const { currentCountry } = this.props;

    const circleSelection = select(this.circleRef.current)
      .selectAll("circle")
      .data(circles);

    circleSelection
      .attr("fill", d => d.color)
      .attr("r", d => d.r)
      .attr("strokeWidth", d => 1);
  }

  componentDidUpdate() {
    const { circles, linkHighlighting } = this.state;
    const { currentCountry } = this.props;
    if (linkHighlighting) {
      const circleSelection = select(this.circleRef.current)
        .selectAll("circle")
        .data(circles);

      circleSelection
        .transition()
        .duration(450)
        .attr("fill", d => colorFunction(currentCountry, d))
        .attr("r", d => radiusFunction(currentCountry, d))
        .attr("strokeWidth", d => strokeWidthFunction(currentCountry, d));
    }
  }

  handleMouseOver(event, datum) {
    const { handleCircleOver } = this.props;
    handleCircleOver(datum.key);
    const coords = localPoint(event.target.ownerSVGElement, event);
    this.props.showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: {
        name: datum.key,
        x: datum.x,
        y: datum.y,
        labels: this.state.labels
      }
    });
  }

  handleMouseOut() {
    // TODO: create animation w opacity
    const { handleCircleOver } = this.props;
    handleCircleOver(false);
    setTimeout(() => this.props.hideTooltip(), 300);
  }

  render() {
    const {
      parentWidth,
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      useGrid
    } = this.props;

    const {
      xScale,
      yScale,
      labels,
      circles,
      parentHeight,
      currentCountry
    } = this.state;

    return (
      <React.Fragment>
        <svg width={parentWidth} height={parentHeight + margin + margin}>
          {circles && (
            <Group top={margin} left={margin}>
              {useGrid && (
                <Grid
                  top={0}
                  left={0}
                  className={style.grid}
                  xScale={xScale}
                  yScale={yScale}
                  stroke="rgba(142, 32, 95, 0.3)"
                  width={parentWidth - margin * 2}
                  height={parentHeight - margin}
                  numTicksRows={numTicksForHeight(parentHeight)}
                  numTicksColumns={numTicksForWidth(parentWidth)}
                />
              )}
              <AxisLeft
                scale={yScale}
                axisClassName={style.axis}
                labelClassName={style["axis-label"]}
                label={labels.y}
                left={margin}
                tickClassName={style["tick-label"]}
                stroke="#333333"
                tickStroke="#333333"
                numTicks={numTicksForHeight(parentHeight)}
              />
              <AxisBottom
                scale={xScale}
                axisClassName={style.axis}
                labelClassName={style["axis-label"]}
                label={labels.x}
                top={parentHeight - margin}
                tickClassName={style["tick-label"]}
                stroke="#333333"
                tickStroke="#333333"
                numTicks={numTicksForWidth(parentWidth)}
              />
              <g ref={this.circleRef}>
                {circles.map(d => {
                  return (
                    <Circle
                      key={d.key}
                      stroke={chroma("gray").darken(2)}
                      cx={d.cx}
                      cy={d.cy}
                      x={d.x}
                      y={d.y}
                      onMouseEnter={e => this.handleMouseOver(e, d)}
                      onMouseLeave={() => this.handleMouseOut()}
                    />
                  );
                })}
              </g>
            </Group>
          )}
        </svg>
        {tooltipOpen && (
          <BoundedToolTip
            tooltipTop={tooltipTop}
            tooltipLeft={tooltipLeft}
            tooltipData={tooltipData}
          />
        )}
      </React.Fragment>
    );
  }
}

const VxScatterplotWithTooltip = withTooltip(VxScatterplot);
const VxScatterplotWithSize = withParentSize(VxScatterplotWithTooltip);

export default VxScatterplotWithSize;
