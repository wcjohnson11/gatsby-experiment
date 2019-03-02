import React from "react";
import { Group } from "@vx/group";
import { Grid } from "@vx/grid";
import { Circle } from "@vx/shape";
import { scaleLinear } from "@vx/scale";
import { AxisLeft, AxisBottom } from "@vx/axis";
import { withParentSize } from "@vx/responsive";
import * as chroma from "chroma-js";
import { max, select } from "d3";
import acronymize from "../../utils/acronymize";
import formatMoney from "../../utils/formatMoney";
import numTicksForHeight from "../../utils/numTicksForHeight";
import numTicksForWidth from "../../utils/numTicksForWidth";
import style from "./styles/scatterplot.module.css";

const margin = 30;

const colorFunction = (d, currentCountry) => {
  if (currentCountry) {
    if (currentCountry === d.key) {
      return d.color;
    } else {
      return chroma(d.color).brighten(3);
    }
  } else {
    return d.color;
  }
};

const radiusFunction = (d, currentCountry, currentContinent) => {
  // If there's a current continent that doesn't match the circle return 0
  // Else, return normal radius value
  if (currentContinent && currentContinent !== d.continent) {
    return 0;
  } else {
    if (currentCountry) {
      if (currentCountry === d.key) {
        return 4;
      } else {
        return 2.5;
      }
    } else {
      return d.r;
    }
  }
};

const strokeWidthFunction = (d, currentCountry) => {
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
    const { data, parentWidth, colorScale, xVar, yVar } = nextProps;

    const parentHeight = parentWidth;
    if (!data) return {};

    const labels = {
      x: xVar,
      y: yVar
    };

    const xScale = scaleLinear({
      domain: [0, max(data, d => d[xVar])],
      range: [margin, parentWidth]
    });

    const yScale = scaleLinear({
      domain: [0, max(data, d => d[yVar])],
      range: [parentHeight, margin]
    });

    const circles = data
      .filter(d => {
        // return if d has valid y and x values
        return d[yVar] && d[xVar];
      })
      .map(d => {
        return {
          cx: xScale(d[xVar]),
          cy: yScale(d[yVar]),
          x: `$${formatMoney(d[xVar], 2)}`,
          y: d[yVar],
          color: colorScale(d["Continent Name"]),
          r: 3,
          key: d.name,
          continent: d["Continent Name"]
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
    const { handleCircleOver, yVar } = this.props;

    // Bind data to circle elements in circleRef
    const circleSelection = select(this.circleRef.current)
      .selectAll("circle")
      .data(circles);

    // Add attributes and mouseover events
    circleSelection
      .attr("fill", d => d.color)
      .attr("r", d => d.r)
      .attr("strokeWidth", d => 1)
      .on("mouseenter", d => {
        select(this).raise()
        handleCircleOver(d.key, yVar)
      })
      .on("mouseleave", () => handleCircleOver(false))
  }

  componentDidUpdate() {
    const { circles } = this.state;
    const { currentCircleY, currentCountry, currentContinent, handleCircleOver, yVar } = this.props;

    // Update circles with new Data
    const circleSelection = select(this.circleRef.current)
      .selectAll("circle")
      .data(circles)
      .on("mouseenter", d => {
        select(this).raise()
        handleCircleOver(d.key, yVar)
      })
      .on("mouseleave", () => handleCircleOver(false));

      // Update attributes and event handlers of circles
      circleSelection
      .transition()
      .duration(250)
      .attr("fill", d => colorFunction(d, currentCountry))
      .attr("r", d => radiusFunction(d, currentCountry, currentContinent))
      .attr("strokeWidth", d => strokeWidthFunction(d, currentCountry));
      
      // If currentCountry (country is being hovered over)
      // And it doesn't belong to the hovered scatterplot
      // Raise country
      if (currentCountry && currentCircleY !== yVar) {
        circleSelection
          .filter(d => d.key === currentCountry)
          .raise()
      }
  }

  render() {
    const {
      parentWidth,
      useGrid
    } = this.props;

    const { xScale, yScale, labels, circles, parentHeight } = this.state;

    return (
      <React.Fragment>
        <svg width={parentWidth} height={parentHeight + margin + margin + margin}>
          <Group top={margin} left={margin / 5}>
            {useGrid && (
              <Grid
                top={0}
                left={0}
                className={style.grid}
                xScale={xScale}
                yScale={yScale}
                stroke="rgba(142, 32, 95, 0.3)"
                width={parentWidth - margin}
                height={parentHeight - margin}
                numTicksRows={numTicksForHeight(parentHeight)}
                numTicksColumns={numTicksForWidth(parentWidth)}
              />
            )}
            <AxisLeft
              scale={yScale}
              axisClassName={style.axis}
              labelClassName={style["axis-label"]}
              label={
                labels.y.length < 10
                  ? labels.y
                  : acronymize(labels.y, [
                      { input: "GINI Index", output: "GINI" }
                    ])
              }
              labelOffset={18}
              left={margin}
              tickClassName={style["tick-label"]}
              stroke="#8490A7"
              tickStroke="#8490A7"
              numTicks={numTicksForHeight(parentHeight)}
            />
            <AxisBottom
              scale={xScale}
              axisClassName={style.axis}
              labelClassName={style["axis-label"]}
              label={labels.x}
              top={parentHeight}
              tickClassName={style["tick-label"]}
              stroke="#8490A7"
              tickStroke="#8490A7"
              numTicks={numTicksForWidth(parentWidth)}
            />
            <g ref={this.circleRef}>
              {circles.map(d => {
                return (
                  <Circle
                    key={d.key}
                    stroke={chroma(d.color).darken(2)}
                    cx={d.cx}
                    cy={d.cy}
                    x={d.x}
                    y={d.y}
                  />
                );
              })}
            </g>
          </Group>
        </svg>
      </React.Fragment>
    );
  }
}

const VxScatterplotWithSize = withParentSize(VxScatterplot);

export default VxScatterplotWithSize;
