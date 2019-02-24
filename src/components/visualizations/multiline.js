import React from "react";
import {
  axisBottom,
  axisLeft,
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
    selectAll(".line").attr("stroke", el => {
      if (d.data.Entity == el.key) {
        return "steelblue";
      }
      return "#ddd";
    });
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
    selectAll(".line").attr("stroke", "#ddd");
    d3Select(".focus").attr("transform", "translate(-100,-100)");
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { selectedOptions } = prevState;
    const { data, parentWidth } = nextProps;
    if (!data) return {};

    const height = parentWidth * 0.6 - margin.top - margin.bottom;
    const width = parentWidth - margin.left - margin.right;

    const isMobile = parentWidth < 600 ? true : false;
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
      .range([margin.left, width - margin.right * 5]);

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
      isMobile,
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
    const {
      isMobile,
      lineFn,
      nestedData,
      voronoiFn,
      xScale,
      yScale,
      width,
      height
    } = this.state;

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

    d3Select(".xAxisTitle")
      .attr("text-anchor", "end")
      .style("font-size", isMobile ? ".5em" : ".8em")
      .attr(
        "transform",
        `translate(${width - margin.left - margin.right * 2},${height -
          margin.bottom -
          margin.top / 2})`
      )
      .text("Years");

    d3Select(".yAxisTitle")
      .attr("text-anchor", "end")
      .style("font-size", isMobile ? ".5em" : ".8em")
      .attr(
        "transform",
        `translate(${margin.right + margin.left}, ${margin.top +
          margin.bottom / 5}) rotate(-90)`
      )
      .text("Adujusted GDP Per Capita");

    // Add data and G for each country
    const country = d3Select("#multiLine")
      .selectAll(".country")
      .data(nestedData, d => d.key)
      .join("g")
      .attr("class", "country")
      .attr("fill", "none")
      .attr("stroke", "#ddd")
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
    const {
      lineFn,
      nestedData,
      voronoiFn,
      xScale,
      yScale,
      width,
      height
    } = this.state;

    const svg = d3Select("#multiLine").transition();

    // Add axis and attributes to Axes
    this.xAxis.scale(xScale);
    svg
      .select(".xAxis")
      .duration(200)
      .call(this.xAxis);

    this.yAxis.scale(yScale);
    svg
      .select(".yAxis")
      .duration(200)
      .call(this.yAxis);

    // Bind data to .country elements
    const countries = d3Select("#multiLine")
      .selectAll(".country")
      .data(nestedData, d => d.key);

    // Remove exiting elements
    countries
      .exit()
      .attr("class", "exit")
      .attr("opacity", 1)
      .transition(200)
      .attr("opacity", 0)
      .remove();

    const focus = d3Select(".focus");

    if (nestedData.length === 0) {
      focus.select("circle").attr("r", 0);

      focus
        .attr("transform", `translate(${width / 2.5}, ${height / 2})`)
        .select("text")
        .text("Add some countries!");
    } else {
      focus.attr("transform", "translate(-100,-100)");
      focus.select("circle").attr("r", 3);
    }

    // Adding new elements
    const newCountries = countries
      .enter()
      .append("g")
      .attr("class", "country")
      .attr("fill", "none")
      .attr("stroke", "#ddd")
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
          <g>
            <text className="xAxisTitle" />
          </g>
          <g
            className="yAxis"
            ref={this.multilineYRef}
            transform={`translate(${margin.left}, 0)`}
          />
          <g>
            <text className="yAxisTitle" />
          </g>
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
