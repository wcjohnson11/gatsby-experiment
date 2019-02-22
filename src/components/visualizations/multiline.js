import React from "react";
import {
  axisBottom,
  axisLeft,
  bisectLeft,
  curveCatmullRom,
  extent,
  line,
  nest,
  select,
  scaleLinear,
  scaleTime
} from "d3";
import { event as currentEvent } from "d3-selection";
import { withParentSize } from "@vx/responsive";

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
class MultiLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      lines: [],
      activeCountries: [
        "United States",
        "England",
        "Australia",
        "Japan",
        "India",
        "Germany",
        "Switzerland",
        "China",
        "Brazil"
      ]
    };
    this.mulitilineXRef = React.createRef();
    this.multilineYRef = React.createRef();
  }

  xAxis = axisBottom().tickSizeOuter(0);
  yAxis = axisLeft().tickSizeOuter(0);

  // Hover function for country paths
  hover(svg, path, xScale, yScale, nestedData) {
    // Create Range of dates
    const dateRange = nestedData[0].values.map(d => d.Year);
    svg.style("position", "relative");

    // handle mobile touch events
    if ("ontouchstart" in document) {
      svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("touchstart", entered)
        .on("touchend", left);
    } else {
      svg
        .on("mousemove", moved)
        .on("mousenter", entered)
        .on("mouseleave", left);
    }

    // Handle mouse move
    function moved() {
      currentEvent.preventDefault();
      // Get yAxis input value from mouse event
      const ym = yScale.invert(currentEvent.layerY);
      // Get xAxis input value from mouse event
      const xm = xScale.invert(currentEvent.layerX);
      // Get index of xAxis Value
      const i1 = bisectLeft(dateRange, xm, 1);
      const i0 = i1 - 1;
      // Get fixed index of xAxis variable
      const i = xm - dateRange[i0] > dateRange[i1] - xm ? i1 : i0;
      // Get current country
      const s = nestedData.reduce((a, b) => {
        // Handle Shorter Date Ranges
        const aValue = a.values[i]
          ? a.values[i]["GDP per capita"]
          : a.values[a.values.length - 1];
        const bValue = b.values[i]
          ? b.values[i]["GDP per capita"]
          : b.values[b.values.length - 1];
        return Math.abs(aValue - ym) < Math.abs(bValue - ym) ? a : b;
      });

      // Current Country becomes blue and comes to top
      // Other countries become grey
      path
        .attr("stroke", d => (d === s ? "steelblue" : "#ddd"))
        .filter(d => d === s)
        .raise();
    }

    // Handle mouse enter
    function entered() {
      // Countries become gray
      path.style("mix-blend-mode", "multiply").attr("stroke", "#ddd");
    }

    // Handle mouse leave
    function left() {
      // Countries become blue
      path.style("mix-blend-mode", "multiply").attr("stroke", "steelblue");
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { activeCountries } = prevState;
    const { data, parentWidth } = nextProps;
    if (!data) return {};

    const height = parentWidth * 0.6;
    const width = parentWidth;

    // Filter out nonActive countries
    const filteredData = data.filter(
      d => activeCountries.indexOf(d.Entity) >= 0
    );

    // Declare xScale
    const xScale = scaleTime()
      .domain(extent(filteredData, d => d.Year))
      .range([margin.left, width - margin.right * 4]);

    // Declare yScale
    const yScale = scaleLinear()
      .domain(extent(filteredData, d => d["GDP per capita"]))
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Declare line function
    const lineFn = line()
      .curve(curveCatmullRom)
      .x(d => xScale(d.Year))
      .y(d => yScale(d["GDP per capita"]));

    // Nest data under country name
    const nestedData = nest()
      .key(d => d.Entity)
      .entries(filteredData);

    return {
      activeCountries,
      height,
      lineFn,
      nestedData,
      width,
      xScale,
      yScale
    };
  }

  componentDidUpdate() {
    const { lineFn, nestedData, xScale, yScale } = this.state;

    // Add axis and attributes to xAxis
    this.xAxis.scale(xScale);
    select(this.mulitilineXRef.current)
      .call(this.xAxis)
      .selectAll("text")
      .attr("y", 3)
      .attr("x", margin.right / 2)
      .attr("font-weight", "bold")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    // Add axis and attributes to yAxis
    this.yAxis.scale(yScale);
    select(this.multilineYRef.current)
      .call(this.yAxis)
      .selectAll("text")
      .attr("dy", ".35em")
      .attr("font-weight", "bold");

    // Add data and G for each country
    const country = select("#multiLine")
      .selectAll(".country")
      .data(nestedData)
      .enter()
      .append("g")
      .attr("class", "country")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    // Add country line paths to each country
    country
      .append("path")
      .attr("class", "line")
      .style("mix-blend-mode", "multiply")
      .attr("d", d => lineFn(d.values));

    // Add text label for each line path
    country
      .append("text")
      .datum(d => {
        return {
          name: d.key,
          value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", d => {
        const yValue = yScale(d.value["GDP per capita"]);
        const xValue = xScale(d.value.Year);
        return `translate(${xValue}, ${yValue})`;
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .attr("fill", "black")
      .attr("stroke-width", 0)
      .style("font-size", "10px")
      .style("font-style", "sans-serif")
      .style("font-weight", "normal")
      .text(d => d.name);

    // Add Hover functionality to chart
    select("#multiLine").call(this.hover, country, xScale, yScale, nestedData);
  }

  render() {
    const { height, width } = this.state;
    return (
      <svg id="multiLine" height={height} width={width}>
        <g
          ref={this.mulitilineXRef}
          transform={`translate(0, ${height - margin.bottom})`}
        />
        <g
          ref={this.multilineYRef}
          transform={`translate(${margin.left}, 0)`}
        />
      </svg>
    );
  }
}

const MultiLineWithSize = withParentSize(MultiLine);

export default MultiLineWithSize;
