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

  hover(svg, path, xScale, yScale, nestedData) {
    const dateRange = nestedData[0].values.map(d => d.Year);
    svg.style("position", "relative");

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

    const dot = svg.append("g").attr("display", "none");

    dot.append("circle").attr("r", 2.5);

    dot
      .append("text")
      .style("font", "10px sans-serif")
      .attr("text-anchor", "middle")
      .attr("y", -8);

    function moved() {
      currentEvent.preventDefault();
      const ym = yScale.invert(currentEvent.layerY);
      const xm = xScale.invert(currentEvent.layerX);
      const i1 = bisectLeft(dateRange, xm, 1);
      const i0 = i1 - 1;
      const i = xm - dateRange[i0] > dateRange[i1] - xm ? i1 : i0;

      const s = nestedData.reduce((a, b) => {
        return Math.abs(a.values[i]["GDP per capita"] - ym) <
          Math.abs(b.values[i]["GDP per capita"] - ym)
          ? a
          : b;
      });

      path
        .attr("stroke", d => (d === s ? "steelblue" : "#ddd"))
        .filter(d => d === s)
        .raise();

      dot.attr(
        "transform",
        `translate(${xScale(dateRange[i])},${yScale(
          s.values[i]["GDP per capita"]
        )})`
      );
      dot.select("text").text(s.name);
    }

    function entered() {
      path.style("mix-blend-mode", "multiply").attr("stroke", "#ddd");
      dot.attr("display", null);
    }

    function left() {
      path.style("mix-blend-mode", "multiply").attr("stroke", "steelblue");
      dot.attr("display", "none");
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { activeCountries } = prevState;
    const { data, parentWidth } = nextProps;
    if (!data) return {};

    const height = parentWidth * 0.6;
    const width = parentWidth;

    const filteredData = data.filter(
      d => activeCountries.indexOf(d.Entity) >= 0
    );

    const xScale = scaleTime()
      .domain(extent(filteredData, d => d.Year))
      .range([margin.left, width - margin.right * 4]);

    const yScale = scaleLinear()
      .domain(extent(filteredData, d => d["GDP per capita"]))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineFn = line()
      .curve(curveCatmullRom)
      .x(d => xScale(d.Year))
      .y(d => yScale(d["GDP per capita"]));

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

    this.xAxis.scale(xScale);
    select(this.mulitilineXRef.current)
      .call(this.xAxis)
      .selectAll("text")
      .attr("y", 3)
      .attr("x", margin.right / 2)
      .attr("font-weight", "bold")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    this.yAxis.scale(yScale);
    select(this.multilineYRef.current)
      .call(this.yAxis)
      .selectAll("text")
      .attr("dy", ".35em")
      .attr("font-weight", "bold");

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

    country
      .append("path")
      .attr("class", "line")
      .style("mix-blend-mode", "multiply")
      .attr("d", d => lineFn(d.values));

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
