import React from "react";
import {
  axisBottom,
  axisLeft,
  bisectLeft,
  curveCatmullRom,
  voronoi,
  extent,
  line,
  nest,
  select as d3Select,
  selectAll,
  set,
  scaleLinear,
  scaleTime
} from "d3";
import { merge } from "d3-array";
import Select from "react-select";
import { event as currentEvent } from "d3-selection";
import { withParentSize } from "@vx/responsive";

const margin = { top: 20, right: 20, bottom: 40, left: 40 };
class MultiLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      lines: [],
      selectedOptions: [
        { label: "United States", value: "United States" },
        { label: "England", value: "England" },
        { label: "Japan", value: "Japan" },
        { label: "India", value: "India" },
        { label: "China", value: "China" },
        { label: "Germany", value: "Germany" },
        { label: "Switzerland", value: "Switzerland" }
      ]
    };
    this.mulitilineXRef = React.createRef();
    this.multilineYRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.mouseover = this.mouseover.bind(this);
    this.mouseout = this.mouseout.bind(this);
  }

  xAxis = axisBottom().tickSizeOuter(0);
  yAxis = axisLeft().tickSizeOuter(0);

  mouseover(d, xScale, yScale) {
    d3Select(d.data.line).classed("hover", true);
    d.data.line.parentNode.appendChild(d.data.line);
    d3Select(".focus")
      .attr(
        "transform",
        `translate(${xScale(d.data.Year)}, ${yScale(d.data["GDP per capita"])})`
      )
      .select("text")
      .text(d.data.Entity);
  }

  mouseout(d) {
    d3Select(d.data.line).text("hover", false);
    d3Select(".focus").attr("transform", "translate(-100,-100)");
  }

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
    const { selectedOptions } = prevState;
    const { data, parentWidth } = nextProps;
    if (!data) return {};

    const height = parentWidth * 0.6 - margin.top - margin.bottom;
    const width = parentWidth - margin.left - margin.right;

    // Get list of countries
    const countries = set(data.map(d => d.Entity)).values();
    // Create array of options for multiselect
    const countryOptions = countries.map(d => {
      return {
        label: d,
        value: d
      };
    });

    // Get list of activeCountries from selectedOptions
    const activeCountries = selectedOptions.map(d => d.value);

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

    // Declare Voronoi Function
    const voronoiFn = voronoi()
      .x(d => xScale(d.Year))
      .y(d => yScale(d["GDP per capita"]))
      .extent([
        [-margin.left, -margin.top],
        [width + margin.right, height + margin.bottom]
      ]);

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
      countryOptions,
      selectedOptions,
      height,
      lineFn,
      nestedData,
      voronoiFn,
      width,
      xScale,
      yScale
    };
  }

  handleChange(selectedOptions) {
    this.setState({ selectedOptions });
  }

  componentDidMount() {
    const { lineFn, nestedData, voronoiFn, xScale, yScale } = this.state;

    // Add axis and attributes to xAxis
    this.xAxis.scale(xScale);
    d3Select(this.mulitilineXRef.current)
      .call(this.xAxis)
      .selectAll("text")
      .attr("y", 3)
      .attr("x", margin.right / 2)
      .attr("font-weight", "bold")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    // Add axis and attributes to yAxis
    this.yAxis.scale(yScale);
    d3Select(this.multilineYRef.current)
      .call(this.yAxis)
      .selectAll("text")
      .attr("dy", ".35em")
      .attr("font-weight", "bold");

    // Add data and G for each country
    const country = d3Select("#multiLine")
      .selectAll(".country")
      .data(nestedData, d => d.key)
      .join("g")
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
      .attr("d", function(d) {
        d.values.forEach(country => {
          country.line = this;
          return country;
        });
        return lineFn(d.values);
      });

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

    // Add Voronoi paths for handling mouse events
    // Uncomment stroke to show voronoi
    d3Select(".voronoi")
      .selectAll("path")
      .data(voronoiFn.polygons(merge(nestedData.map(d => d.values))))
      .enter()
      .append("path")
      .classed("voronoi-path", true)
      .style("pointer-events", "all")
      .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
      //   .attr("stroke", "red")
      // .attr("stroke-width", "0.2")
      .attr("fill", "none")
      .on("mouseover", d => this.mouseover(d, xScale, yScale))
      .on("mouseout", d => this.mouseout(d));
  }

  componentDidUpdate() {
    const { lineFn, nestedData, voronoiFn, xScale, yScale } = this.state;

    const svg = d3Select("#multiLine").transition();

    // Add axis and attributes to Axes
    this.xAxis.scale(xScale);
    svg
      .select(".xAxis")
      .duration(750)
      .call(this.xAxis);

    this.yAxis.scale(yScale);
    svg
      .select(".yAxis")
      .duration(750)
      .call(this.yAxis);

    // Bind data to .country elements
    const countries = d3Select("#multiLine")
      .selectAll(".country")
      .data(nestedData, d => d.key);

    // Remove exiting elements
    countries
      .exit()
      .attr("class", "exit")
      .transition(750)
      .remove();

    // Adding new elements
    const newCountries = countries
      .enter()
      .append("g")
      .attr("class", "country")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    newCountries.append("path");
    newCountries.append("text");

    // Merge g values
    countries
      .merge(newCountries)
      .select("g")
      .attr("class", "country")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    // Merge paths and draw
    countries
      .merge(newCountries)
      .select("path")
      .attr("class", "line")
      .style("mix-blend-mode", "multiply")
      .attr("d", function(d) {
        d.values.forEach(country => {
          country.line = this;
          return country;
        });
        return lineFn(d.values);
      });

    // Merge text and add text
    countries
      .merge(newCountries)
      .select("text")
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

    // Remove old voronoi
    selectAll(".voronoi-path").remove();

    // Add new voronoi
    d3Select(".voronoi")
      .selectAll("path")
      .data(voronoiFn.polygons(merge(nestedData.map(d => d.values))))
      .enter()
      .append("path")
      .classed("voronoi-path", true)
      .style("pointer-events", "all")
      .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
      //   .attr("stroke", "red")
      //   .attr("stroke-width", "0.2")
      .attr("fill", "none")
      .on("mouseover", d => this.mouseover(d, xScale, yScale))
      .on("mouseout", d => this.mouseout(d));
  }

  render() {
    const { countryOptions, height, selectedOptions, width } = this.state;
    return (
      <React.Fragment>
        <Select
          value={selectedOptions}
          onChange={this.handleChange}
          options={countryOptions}
          isMulti={true}
          isSearchable={true}
        />
        <svg id="multiLine" height={height} width={width}>
          <g
            className="xAxis"
            ref={this.mulitilineXRef}
            transform={`translate(0, ${height - margin.bottom})`}
          />
          <g
            className="yAxis"
            ref={this.multilineYRef}
            transform={`translate(${margin.left}, 0)`}
          />
          <g className="focus" transform={`translate(-100, -100)`}>
            <circle r={3.5} />
            <text y={-10} />
          </g>
          <g className="voronoi" fill="none" />
        </svg>
      </React.Fragment>
    );
  }
}

const MultiLineWithSize = withParentSize(MultiLine);

export default MultiLineWithSize;
