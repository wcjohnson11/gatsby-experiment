import React from "react";
import {
  axisBottom,
  axisLeft,
  extent,
  line,
  nest,
  select,
  scaleLinear,
  scaleTime
} from "d3";
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
        "China",
        "Brazil"
      ]
    };
    this.mulitilineXRef = React.createRef();
    this.multilineYRef = React.createRef();
  }

  xAxis = axisBottom().tickSizeOuter(0);
  yAxis = axisLeft().tickSizeOuter(0);

  static getDerivedStateFromProps(nextProps, prevState) {
    const { activeCountries } = prevState;
    const { data, parentWidth } = nextProps;
    if (!data) return {};

    const height = parentWidth * 0.8;
    const width = parentWidth;

    const filteredData = data.filter(
      d => activeCountries.indexOf(d.Entity) >= 0
    );

    const xScale = scaleTime()
      .domain(extent(filteredData, d => d.Year))
      .range([margin.left, width - margin.right]);

    const yScale = scaleLinear()
      .domain(extent(filteredData, d => d["GDP per capita"]))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineFn = line()
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

    const pathsG = select(".multiLineChart")
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "lightgray")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");
    nestedData.forEach((country, i) => {
      pathsG
        .append("path")
        .datum(country.values)
        .style("mix-blend-mode", "multiply")
        .attr("d", lineFn);
    });
  }

  render() {
    const { height, width } = this.state;
    return (
      <svg className="multiLineChart" height={height} width={width}>
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
