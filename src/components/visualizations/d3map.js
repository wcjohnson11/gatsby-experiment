import React from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { withParentSize } from "@vx/responsive";
import topology from "../../../static/world-topology.json";

class D3Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.containerRef = React.createRef();
    this.legendRef = React.createRef();
    this.mapRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, parentWidth } = nextProps;

    const width = parentWidth;
    const height = parentWidth * 0.75;

    // Create Value Map
    const valueMap = {};
    data.forEach(country => (valueMap[country.code] = {value: country.y, name: country.name}));

    // Add value to Topojson
    // topology.objects.geometries.forEach((geography, i) => {
    //   const continentCode = geography.properties.iso_a3;
    //   geography.properties.mapValue = valueMap[continentCode];
    // });
    console.log(topology)
    // Create world countries object
    const countryFeatures = topojson.feature(topology, topology.objects.countries).features;

    // Declare Projection
    const projection = d3
      .geoEqualEarth()
      .rotate([-10, 0])
      .fitExtent([[1, 1], [width - 1, height - 51]], { type: "Sphere" })
      .precision(0.1);
    // Declare Scales
    const color = d3
      .scaleSequential(d3.interpolateSpectral)
      .domain(d3.extent(data, d => d.y));

    const x = d3
      .scaleLinear()
      .domain(d3.extent(color.domain()))
      .rangeRound([width / 2 - 120, width / 2 + 120]);

    // Declare Ticks
    const extent = d3.extent(data, d => d.y);
    const ticks = d3.ticks(extent[0], extent[1], 4);

    // Declare Axis
    const axisBottom = d3
      .axisBottom(x)
      .tickSize(13)
      .tickValues(ticks);

    // Declare path
    const geoPath = d3.geoPath().projection(projection);
    // Update D3
    // Update Domain of Scale
    // Recenter Map on windowResize
    return {
      width,
      height,
      projection,
      color,
      x,
      geoPath,
      ticks,
      axisBottom,
      countryFeatures,
      valueMap
    };
  }

  componentDidMount() {
    const { geoPath, color, ticks, countryFeatures, colorScale, valueMap } = this.state;
    const { mapValue } = this.props;

    // Create Circle
    d3.select(this.containerRef.current)
      .datum({ type: "Sphere" })
      .attr("d", geoPath);

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
    d3.select(".caption").text(`${mapValue}`);
        

    console.log('1', countryFeatures)
    // Add Country fills
    d3.select(this.mapRef.current)
        .append('g')
      .selectAll("path")
      .data(countryFeatures)
      .enter()
      .append("path")
      .attr("fill", (d) => {
          console.log(d.id, valueMap,valueMap[d.id])
          return colorScale(valueMap[`${d.id}`].value)
        })
      .attr("path", geoPath)
      .append("title")
      .text(d => valueMap[d.id].name);
  }

  componentDidUpdate() {
    const { axisBottom } = this.state;

    // Get Legend
    const xAxis = d3.select(this.legendRef.current);
    // Draw xAxis
    xAxis
      .call(axisBottom)
      .select(".domain")
      .remove();
  }

  render() {
    const { width, height, x, ticks } = this.state;

    // const paths = countryFeatures.map((d) => {
    //     console.log(d)
    // })

    return (
      <svg width={width} height={height}>
        <path
          fill="none"
          stroke="#ccc"
          strokeLinejoin="round"
          ref={this.containerRef}
        />
        <defs>
          <linearGradient id="linear-gradient" />
        </defs>
        <g ref={this.legendRef} transform={`translate(0, ${height - 100})`}>
          <rect
            height="8"
            width={x(ticks[ticks.length - 1]) - x(ticks[0])}
            x={x(ticks[0])}
            fill={`url(#linear-gradient)`}
          />
          <text
            className="caption"
            x={x.range()[0]}
            y={-6}
            fill="#000"
            textAnchor="start"
            fontWeight="bold"
          />
        </g>
        <g ref={this.mapRef}></g>
      </svg>
    );
  }
}

const D3MapWithSize = withParentSize(D3Map);
export default D3MapWithSize;
