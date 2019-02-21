import React from "react";
import { axisLeft, axisTop, select, scaleBand } from "d3";

const height = 400;
const width = 400;
const margin = { top: 160, left: 175 };
const yMap = {
  "GINI Index": "GINI",
  "Happy Planet Index": "Happy Planet",
  "Human Development Index": "Human Development",
  "Sustainable Economic Development Index": "SEDA",
  "World Happiness Report Score": "World Happiness"
};

class Heatmap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.xAxisRef = React.createRef();
    this.yAxisRef = React.createRef();
  }

  xAxis = axisTop().tickSizeOuter(0);
  yAxis = axisLeft().tickSizeOuter(0);

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, columns } = nextProps;
    if (!data) return {};

    const xValues = [
      "Economics",
      "Health Expectancy",
      "Inequality",
      "Sustainability",
      "Happiness"
    ];

    const yValues = [
      "GINI Index",
      "Happy Planet Index",
      "Human Development Index",
      "Sustainable Economic Development Index",
      "World Happiness Report Score"
    ];

    const xScale = scaleBand()
      .domain(xValues)
      .range([0, width - margin.left])
      .padding(0.2);

    const yScale = scaleBand()
      .domain(yValues)
      .range([0, height - margin.top])
      .padding(0.2);

    const rects = columns
      .filter(d => yValues.indexOf(d.name) >= 0)
      .reduce((result, d) => {
        const yValue = d.name;
        for (var key in d) {
          if (
            (xValues.indexOf(key) >= 0 && d[key] === "TRUE") ||
            d[key] === "CAVEAT"
          ) {
            result.push({
              x: xScale(key),
              y: yScale(yValue),
              width: xScale.bandwidth(),
              height: yScale.bandwidth(),
              fill: d[key] === "TRUE" ? "#0D030D" : "#592037"
            });
          }
        }
        return result;
      }, []);

    return { data, columns, rects, xScale, yScale };
  }

  componentDidUpdate() {
    const { rects, xScale, yScale } = this.state;

    this.xAxis.scale(xScale);
    select(this.xAxisRef.current)
      .call(this.xAxis)
      .selectAll("text")
      .attr("y", -9)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "start")
      .style("font-size", "16px");
    this.yAxis.scale(yScale);
    select(this.yAxisRef.current)
      .call(this.yAxis)
      .selectAll("text")
      .text(d => yMap[d])
      .attr("dy", ".35em")
      .style("font-size", "16px");

    select("svg")
      .selectAll("rect")
      .data(rects)
      .enter()
      .append("rect")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", d => d.fill);

    // add X gridlines
    select("svg")
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height - margin.top})`)
      .call(
        axisTop(xScale)
          .ticks(xScale.domain().length)
          .tickSize(height - margin.top)
          .tickFormat("")
      );

    // add Y Gridlines
    select("svg")
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${width - margin.left}, 0)`)
      .call(
        axisLeft(yScale)
          .ticks(yScale.domain().length)
          .tickSize(width - margin.left)
          .tickFormat("")
      );
  }

  render() {
    return (
      <svg
        viewBox={`-${margin.left} -${margin.top} ${width +
          margin.left} ${height + margin.top}`}
        height={height}
        width={width}
      >
        <g ref={this.xAxisRef} />
        <g ref={this.yAxisRef} />
      </svg>
    );
  }
}

export default Heatmap;
