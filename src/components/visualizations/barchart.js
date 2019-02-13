import React from "react";
import * as d3 from "d3";
import { localPoint } from "@vx/event";
import { withParentSize } from "@vx/responsive";
import { withTooltip } from "@vx/tooltip";
import BoundedToolTip from "./boundedTooltip";
import style from "./barchart.module.css";
const margin = { top: 20, right: 105, bottom: 20, left: 125 };

// TODO
// Create Legend
// Style

class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bars: []
    };
    this.barRef = React.createRef();
  }

  xAxis = d3.axisTop();
  yAxis = d3.axisLeft();

  static getDerivedStateFromProps(nextProps, prevState) {
    const { currentContinent, data, zScale, parentWidth, sortType } = nextProps;
    if (!data) return {};

    // Create Data Labels
    const labels = {
      x: data.x,
      y: data.y
    };
    // If currentContinent is set,
    const formattedData = currentContinent
      ? data.filter(d => d.continent === currentContinent)
      : data;

    // Set Height of Div according to datalength
    const formattedHeight = formattedData.length * 15;

    // Sort Data
    const sortedData = formattedData.sort((a, b) => {
      if (sortType === "lowHigh") {
        if (a.y < b.y) return 1;
        if (a.y > b.y) return -1;
      } else if (sortType === "highLow") {
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
      } else if (sortType === "alphabetical") {
        if (a.name < b.name) return 1;
        if (a.name > b.name) return -1;
      } else if (sortType === "continent") {
        if (a.continent < b.continent) return 1;
        if (a.continent > b.continent) return -1;
      }
      return 0;
    });

    // Map the xScale to [0,Y Value max]
    const dataYMax = d3.max(data, d => d.y);
    const xScale = d3
      .scaleLinear()
      .domain([0, dataYMax])
      .range([margin.left, parentWidth - margin.right]);

    // Get array of names in dataset
    const dataNames = sortedData.reduce((result, d) => {
      result.push(d.name);
      return result;
    }, []);

    // Map Names to Y-position
    const yScale = d3
      .scaleBand()
      .domain(dataNames)
      .range([formattedHeight - margin.bottom, margin.top])
      .paddingInner([0.4])
      .paddingOuter([0.2]);

    // Create bars component
    // Not sure why width needs to have marginRight subtracted from it
    const bars = sortedData.map(d => {
      return {
        x: `${margin.left}`,
        y: yScale(d.name),
        height: yScale.bandwidth(),
        width: xScale(d.y) - margin.right,
        fill: zScale(d.continent),
        name: d.name,
        xRaw: d.x,
        yRaw: d.y
      };
    });

    // Get dataMedian value for medianLine
    const dataMedian = d3.median(sortedData, d => d.y);

    return {
      bars,
      dataMedian,
      labels,
      formattedHeight,
      xScale,
      yScale,
      parentWidth
    };
  }

  componentDidUpdate() {
    // Set xAxis to use xScale
    this.xAxis.scale(this.state.xScale);
    // Call xAxis on xAxis group element to draw it
    d3.select(this.refs.xAxis).call(this.xAxis);
    // Set yAxis to use yScale
    this.yAxis.scale(this.state.yScale);
    // Call yAxis on yAxis group element to draw it
    d3.select(this.refs.yAxis).call(this.yAxis);

    // Set up transition for bars
    d3.select(this.barRef.current)
      .selectAll("rect")
      .data(this.state.bars)
      .transition()
      .attr("y", d => d.y)
      .attr("height", d => d.height)
      .attr("width", d => d.width)
      .attr("fill", d => d.fill);
  }

  handleMouseOverBar(event, datum) {
    const coords = localPoint(event.target.ownerSVGElement, event);
    this.props.showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: {
        name: datum.name,
        x: datum.xRaw,
        y: datum.yRaw,
        labels: this.state.labels
      }
    });
  }

  render() {
    const {
      tooltipData,
      tooltipLeft,
      tooltipOpen,
      tooltipTop,
      hideTooltip
    } = this.props;
    const { dataMedian, formattedHeight, parentWidth, xScale } = this.state;
    return (
      <React.Fragment>
        <svg width={parentWidth} height={formattedHeight}>
          <line
            className={style.medianLine}
            x1={xScale(dataMedian)}
            y1={margin.top}
            x2={xScale(dataMedian)}
            y2={formattedHeight - margin.bottom}
          />
          <g ref={this.barRef}>
            {this.state.bars.map(d => (
              <rect
                key={d.name}
                x={d.x}
                onMouseOver={e => this.handleMouseOverBar(e, d)}
                onMouseOut={() => hideTooltip()}
              />
            ))}
          </g>
          <g ref="xAxis" transform={`translate(0, ${margin.top})`} />
          <g ref="yAxis" transform={`translate(${margin.left}, 0)`} />
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

const BarChartWithTooltip = withTooltip(BarChart);
const BarChartWithSize = withParentSize(BarChartWithTooltip);

export default BarChartWithSize;
