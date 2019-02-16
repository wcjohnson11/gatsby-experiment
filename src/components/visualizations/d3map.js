import React from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { withParentSize } from "@vx/responsive";
import topology from "../../../static/world-topology.json";

const colorFunction = (d, valueMap, color) => {
  if (!valueMap[d.id]) {
    return '#eee';
  }
  const value = valueMap[d.id].value;
  if (value === "absent") {
    return '#eee';
  } else {
    return color(value);
  }
}

const textFunction = (d, valueMap) => {
  if (!valueMap[d.id]) {
    return 'Unknown';
  }
  return valueMap[d.id].name;
}

class D3Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.legendRef = React.createRef();
    this.svgRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { mapMetric, data, parentWidth } = nextProps;

    const width = parentWidth;
    const height = parentWidth * 0.75;

    // Create Value Map
    const valueMap = {};
    data.forEach(country => {
      const value = country[mapMetric] || 'absent';
      const name = country.name;
      return valueMap[country.code] = {value: value, name: name}
    });

    // Add value to Topojson
    // topology.objects.geometries.forEach((geography, i) => {
    //   const continentCode = geography.properties.iso_a3;
    //   geography.properties.mapValue = valueMap[continentCode];
    // });

    // Create world countries object
    const countryFeatures = topojson.feature(topology, topology.objects.countries).features;
    const mesh = topojson.mesh(topology, topology.objects.countries, (a,b) => a !==b)

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

    const x = d3
      .scaleLinear()
      .domain(d3.extent(color.domain()))
      .rangeRound([width / 2 - 120, width / 2 + 120]);

    // Declare Ticks
    const extent = d3.extent(data, d => d[mapMetric]);
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
      mesh,
      valueMap
    };
  }

  componentDidMount() {
    const { geoPath, color, ticks, countryFeatures, valueMap, mesh } = this.state;
    const { mapMetric } = this.props;

    
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
      
      // Create Circle
      d3.select(this.svgRef.current)
        .append("path")
        .datum({ type: "Sphere" })
        .attr("fill", "lightblue")
        .attr("fill-rule", 'nonzero')
        .attr("stroke", "#ccc")
        .attr("stroke-linejoin", "round")
        .attr("d", geoPath);
      
      // Add Country fills
      d3.select(this.svgRef.current)
      .append('g')
      .selectAll("path")
      .data(countryFeatures)
      .enter()
      .append("path")
      .attr("fill", (d) => colorFunction(d, valueMap, color))
      .attr("d", geoPath)
      .append("title")
      .text(d => textFunction(d, valueMap));
      
      d3.select(this.svgRef.current)
      .append("path")
      .datum(mesh)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", geoPath)
      
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
      <svg ref={this.svgRef} width={width} height={height}>
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
      </svg>
    );
  }
}

const D3MapWithSize = withParentSize(D3Map);
export default D3MapWithSize;
