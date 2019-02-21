import React from "react";
import { axisLeft, axisTop, select, scaleBand } from "d3";

const height = 450;
const width = 400;
const margin = { left: 90, top: 90 };

class Heatmap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.xAxisRef = React.createRef();
    this.yAxisRef = React.createRef();
  }

  xAxis = axisTop();
  yAxis = axisLeft();

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, columns } = nextProps;
    if (!data) return {};

    const xValues = [
      "economics",
      "healthLifeExpectancy",
      "inequality",
      "sustainability",
      "reportedHappiness"
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
          console.log(key);
          if (xValues.indexOf(key) >= 0 && d[key] == "TRUE") {
            console.log(key, xScale(key), yValue, yScale(yValue));
            result.push({
              x: xScale(key),
              y: yScale(yValue),
              width: xScale.bandwidth(),
              height: yScale.bandwidth(),
              fill: "black"
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
      .style("text-anchor", "start");
    this.yAxis.scale(yScale);
    select(this.yAxisRef.current)
      .call(this.yAxis)
      .selectAll("text")
      .attr("y", -9)
      .attr("x", -9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

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
  }

  render() {
    return (
      <svg
        viewBox={`-${margin.left} -${margin.top} ${width} ${height}`}
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
