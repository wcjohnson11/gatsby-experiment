import React from "react";
import * as d3 from "d3";
import { withParentSize } from "@vx/responsive";
import topology from "../../../static/world-geo-pop.json";

class D3Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.containerRef = React.createRef();
    this.legendRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, parentWidth } = nextProps;

    const width = parentWidth;
    const height = parentWidth * 0.75;

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
    return { width, height, projection, color, x, geoPath, ticks, axisBottom };
  }

  componentDidMount() {
    const { geoPath, color, ticks } = this.state;
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

    // Update caption
    d3.select(".caption").text(`${mapValue}`);
  }

  componentDidUpdate() {
    const { axisBottom } = this.state;
    // axisBottom(this.legendRef.current).select('.domain').remove();
    const xAxis = d3.select(this.legendRef.current);

    xAxis
      .call(axisBottom)
      .select(".domain")
      .remove();
    // d3.select(this.legendRef.current)
    //   .call(axisBottom)
    //   .select(".domain")
    //   .remove();
  }

  render() {
    const { width, height, x, ticks } = this.state;
    console.log(x(ticks[ticks.length - 1]), x(ticks[0]));
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
      </svg>
    );
  }
}

const D3MapWithSize = withParentSize(D3Map);
export default D3MapWithSize;
