import React from "react";
import acronymize from "../../utils/acronymize";
import { axisLeft, axisTop, select, scaleBand } from "d3";

const height = 350;
const width = 350;
const margin = { top: 120, left: 100 };

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
    const { columns, data } = nextProps;
    if (!data) return {};

    const xValues = [
      "Economics",
      "Health Expectancy",
      "Inequality",
      "Sustainability",
      "Happiness"
    ];

    const yValues = [
      "Happy Planet Index",
      "Human Development Index",
      "Sustainable Economic Development Index",
      "GINI Index",
      "World Happiness Report Score"
    ];

    const xScale = scaleBand()
      .domain(xValues)
      .range([0, width - margin.left])
      .padding(0.1);

    const yScale = scaleBand()
      .domain(yValues)
      .range([0, height - margin.top])
      .padding(0.1);

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

    return { data, rects, xScale, yScale };
  }

  componentDidUpdate() {
    const { rects, xScale, yScale } = this.state;

    // Apply xScale and set text value
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
    
    // Apply yScale and set text value
    this.yAxis.scale(yScale);
    select(this.yAxisRef.current)
      .call(this.yAxis)
      .selectAll("text")
      .text(d => acronymize(d, [{ input: "GINI Index", output: "GINI" }]))
      .attr("dy", ".35em")
      .style("font-size", "16px");

      
      // add X gridlines
      select("#heatmap")
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
        select("#heatmap")
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${width - margin.left}, 0)`)
        .call(
          axisLeft(yScale)
          .ticks(yScale.domain().length)
          .tickSize(width - margin.left)
          .tickFormat("")
          );
          
          // Mount rects and set attr
          select("#heatmap")
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
          id="heatmap"
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
