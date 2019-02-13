import React from "react";
import * as d3 from "d3";
import { withParentSize } from "@vx/responsive";
import { withTooltip } from "@vx/tooltip";
import * as chroma from "chroma-js";
import BoundedToolTip from "./boundedTooltip";
import styles from "./scatterplot.module.css";

const padding = 50;

class Scatterplot extends React.Component {
  state = {
    circles: []
  };
  circleRef = React.createRef();

  // Initialize Axes
  xAxis = d3.axisBottom().ticks(5);
  yAxis = d3.axisLeft();

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, className, handleMouseOver, zScale, parentWidth } = nextProps;
    if (!data) return {};
    const width = parentWidth;
    const height = parentWidth * 0.75;

    // Create data labels
    const labels = {
      x: data.x,
      y: data.y
    };
    // Get min, max of x value
    // and map to X-position
    const xScale = d3
      .scaleLinear()
      .domain([-1000, d3.max(data, d => d.x)])
      .range([padding, width - padding]);

    // 2. Initialize scale of Y Position
    // and map to Y-position
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .range([height - padding, padding]);

    // Create circle elements
    const circles = data.map(d => {
      return {
        cx: xScale(d.x),
        x: d.x,
        cy: yScale(d.y),
        y: d.y,
        key: d.name,
        fill: zScale(d.continent)
      };
    });

    return {
      circles,
      xScale,
      yScale,
      labels,
      className,
      handleMouseOver,
      width,
      height
    };
  }

  componentDidUpdate() {
    const { hideTooltip, showTooltip } = this.props;
    const { circles, xScale, yScale, labels } = this.state;
    // Set xAxis to use xScale
    this.xAxis.scale(xScale);
    // Call xAxis on xAxis group element to draw it
    d3.select(this.refs.xAxis).call(this.xAxis);
    // Set yAxis to use yScale
    this.yAxis.scale(yScale);
    // Call yAxis on yAxis group element to draw it
    d3.select(this.refs.yAxis).call(this.yAxis);
    d3.select(this.refs.xAxisLabel).text(labels.x);
    d3.select(this.refs.yAxisLabel).text(labels.y);

    // Create D3 color functions
    const circleSelection = d3
      .select(this.circleRef.current)
      .selectAll("circle")
      .data(circles);

    circleSelection.attr("fill", d => d.fill);

    // Handle Mouseover
    circleSelection.on("mouseover", function(d) {
      // Turn all circles gray
      circleSelection
        .transition()
        .duration(450)
        .attr("fill", d => chroma("gray").brighten(1));
      // Turn highlighted circle red
      d3.select(this)
        .transition()
        .duration(450)
        .attr("fill", chroma(d.fill).darken(2));

      // Show Tooltip
      showTooltip({
        tooltipLeft: d.cx,
        tooltipTop: d.cy,
        tooltipData: {
          name: d.name,
          x: d.x,
          y: d.y,
          labels: labels
        }
      });
    });

    circleSelection.on("mouseout", function(d) {
      d3.select(this)
        .transition()
        .duration(450)
        .attr("fill", d => d.fill);

      hideTooltip();
    });
  }

  render() {
    const { tooltipData, tooltipLeft, tooltipOpen, tooltipTop } = this.props;
    const { className, circles, width, height } = this.state;
    return (
      <React.Fragment>
        <svg className={className} width={width} height={height}>
          <g ref={this.circleRef}>
            {circles.map((d, i) => (
              <circle
                key={d.key}
                className={styles.circle}
                cx={d.cx}
                x={d.x}
                cy={d.cy}
                y={d.y}
                r={width / 200}
                strokeWidth={1}
                stroke={chroma(d.fill).darken(4)}
              />
            ))}
          </g>
          <g
            ref="xAxis"
            className={styles.axis}
            transform={`translate(0, ${height - padding})`}
          />
          <text
            className={styles.axisLabel}
            ref="xAxisLabel"
            transform={`translate(${width / 2 - padding}, ${height - 10})`}
          />
          <g
            ref="yAxis"
            className={styles.axis}
            transform={`translate(${padding}, 0)`}
          />
          <text
            className={styles.axisLabel}
            ref="yAxisLabel"
            transform={`rotate(-90)`}
            dy="1em"
            x={0 - height / 2}
            y={0}
            textAnchor="middle"
          />
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

const ScatterplotWithTooltip = withTooltip(Scatterplot);
const ScatterplotWithSize = withParentSize(ScatterplotWithTooltip);
export default ScatterplotWithSize;
