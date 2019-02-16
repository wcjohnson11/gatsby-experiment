import React from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { withParentSize } from "@vx/responsive";
import style from './d3map.module.css';
import topology from "../../../static/world-topology.json";

// Color function for updating topoCountries
const colorFunction = (id, data, color, mapMetric) => {
  const matchedCountry = data.find(country => {
    return country.code === id
  })

  if (matchedCountry && matchedCountry[mapMetric]) {
    return color(matchedCountry[mapMetric]);
  } else {
    return "#eee";
  }
}

// Text function for updating text in the hover
const textFunction = (id, data) => {
  const text = data.find(country => country.code === id)
  if (text) return text.name;
  return 'Unknown';
}

class D3Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.legendRef = React.createRef();
    this.svgRef = React.createRef();
    this.gradientRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { mapMetric, data, parentWidth } = nextProps;

    const width = parentWidth;
    const height = parentWidth * 0.75;

    // Create world countries object
    const topoCountries = topojson.feature(topology, topology.objects.countries).features;
    const mesh = topojson.mesh(topology, topology.objects.countries, (a, b) => a !== b)

    // Declare Projection
    const projection = d3
      .geoEqualEarth()
      .rotate([-10, 0])
      .fitExtent([[1, 1], [width - 1, height - 51]], { type: "Sphere" })
      .precision(0.1);

    // Declare Scales
    const color = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d[mapMetric]))
      .range(['white', 'orange']);

    // Declare X Scale
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(color.domain()))
      .rangeRound([width / 2 - 120, width / 2 + 120]);

    // Declare Ticks
    const extent = d3.extent(data, d => d[mapMetric]);
    const ticks = d3.ticks(extent[0], extent[1], 4);

    // Declare Axis
    const axisBottom = d3
      .axisBottom(xScale)
      .tickSize(13)
      .tickValues(ticks);

    // Declare path
    const geoPath = d3.geoPath().projection(projection);

    return {
      width,
      height,
      projection,
      color,
      xScale,
      ticks,
      geoPath,
      axisBottom,
      topoCountries,
      mesh
    };
  }

  componentDidMount() {
    const { geoPath, color, ticks, topoCountries, topoMesh } = this.state;
    const { mapMetric, data } = this.props;

    // Update #legend
    d3.select("#linear-gradient")
      .selectAll("stop")
      .data(
        ticks.map((t, i, n) => ({
          offset: `${(100 * i) / n.length}%`,
          color: color(t)
        }))
      )
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    // Add caption
    d3.select(".caption").text(`${mapMetric}`);

    // Create Border
    d3.select(this.svgRef.current)
      .append("path")
      .datum({ type: "Sphere" })
      .attr("fill", "lightblue")
      .attr("fill-rule", 'nonzero')
      .attr("stroke", "#ccc")
      .attr("stroke-linejoin", "round")
      .attr("d", geoPath);

    // Add Country Features
    const features = d3.select(this.svgRef.current)
      .append('g')
      .selectAll("path")
      .data(topoCountries)
      .enter()
      .append("path")
      .classed(`mapValues ${style.countryShapes}`, true)
      .attr("fill", (d) => colorFunction(d.id, data, color, mapMetric))
      .attr("d", geoPath)

    // Append text label
    features.append("rect")
    features.append("title")
      .text(d => textFunction(d.id, data))




    // Add Country Mesh
    d3.select(this.svgRef.current)
      .append("path")
      .datum(topoMesh)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", geoPath);

  }

  componentDidUpdate() {
    const { axisBottom, color, topoCountries, ticks } = this.state;
    const { mapMetric, data } = this.props;

    // Get Legend
    const xAxis = d3.select(this.legendRef.current);
    // Draw xAxis
    xAxis
      .call(axisBottom)
      .select(".domain")
      .remove();

    // Update Country Colors
    d3.selectAll(".mapValues")
      .data(topoCountries)
      .transition()
      .attr("fill", (d) => colorFunction(d.id, data, color, mapMetric))

    // Update Caption
    d3.select(".caption").text(`${mapMetric}`);

    // Update #legend
    d3.select("#linear-gradient")
      .selectAll("stop")
      .data(
        ticks.map((t, i, n) => ({
          offset: `${(100 * i) / n.length}%`,
          color: color(t)
        }))
      )
      .append("stop")
      .transition()
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
  }

  render() {
    const { width, height, xScale, ticks } = this.state;

    return (
      <svg ref={this.svgRef} width={width} height={height}>
        <defs>
          <linearGradient id="linear-gradient" />
        </defs>
        <g ref={this.legendRef} transform={`translate(0, ${height - 100})`}>
          <rect
            height="8"
            width={xScale(ticks[ticks.length - 1]) - xScale(ticks[0])}
            x={xScale(ticks[0])}
            fill={`url(#linear-gradient)`}
          />
          <text
            className="caption"
            x={xScale.range()[0]}
            y={-6}
            fill="#000"
            textAnchor="start"
            fontWeight="bold"
          />
        </g>
      </svg>
    );
  }
}

const D3MapWithSize = withParentSize(D3Map);
export default D3MapWithSize;
