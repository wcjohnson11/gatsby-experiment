import React from "react";
import { graphql } from "gatsby";
import { csv } from "d3";
import Layout from "../components/layout";
import VariableForm from "../components/variableForm";
import VxScatterplotWithSize from "../components/visualizations/vxscatterplot";
import D3Map from "../components/visualizations/d3map";
import Scatterplot from "../components/visualizations/scatterplot";
import Legend from "../components/visualizations/legend";
import { scaleOrdinal } from "@vx/scale";
import style from "./happiness.module.css";
import BarChart from "../components/visualizations/barchart";

const cleanNumbers = string => {
  return parseFloat(string.replace(/,/g, ""));
};

const colors = [
  "#e41a1c",
  "#377eb8",
  "#4daf4a",
  "#984ea3",
  "#ff7f00",
  "#ffff33"
];

class Happiness extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markdownData: props.data && props.data.allMarkdownRemark.edges,
      datasets: {},
      currentCountry: false,
      currentContinent: false,
      isPromiseResolved: false,
      currentMetric: "GINI Index",
      barChartVariables: [
        { name: "Low to High" },
        { name: "High to Low" },
        { name: "Group by Continent" },
        { name: "Alphabetical" }
      ],
      currentBarChart: "Group by Continent"
    };

    this.handleCircleOver = this.handleCircleOver.bind(this);
    this.handleLegendClick = this.handleLegendClick.bind(this);
    this.handleVariableFieldSelect = this.handleVariableFieldSelect.bind(this);
  }

  componentDidMount() {
    Promise.all([csv("countrycodes.csv"), csv("happy2.csv")])
      .then(allData => {
        // Get countrycodes data
        const countryCodes = allData[0];
        // Get happy data
        const happy = allData[1];

        // Get column Info for happiness dataset
        const columnInfo = [];
        for (var i = 0; i < 4; i++) {
          columnInfo.push(happy.shift());
        }

        // Add Country data to happiness data on ISO Country Code
        happy.forEach(country => {
          const result = countryCodes.filter(code => {
            return (
              code.Three_Letter_Country_Code === country["ISO Country Code"]
            );
          });
          if (result[0]) {
            country["Continent Name"] = result[0].Continent_Name;
            country["Continent Code"] = result[0].Continent_Code;
          }
        });

        // Clean data for visualization components
        const newHappy = happy.map(country => {
          const newCountryData = Object.keys(country).reduce((result, key) => {
            if (
              key === "name" ||
              key === "code" ||
              key === "ISO Country Code" ||
              key === "Continent Name" ||
              key === "Continent Code"
            ) {
              result[key] = country[key];
            } else {
              result[key] = cleanNumbers(country[key]);
            }
            return result;
          }, {});

          return newCountryData;
        });

        // Create list of columns for variable Forms
        // Add information to columns
        const columns = happy.columns
          .filter(
            column =>
              column !== "name" &&
              column !== "code" &&
              column !== "ISO Country Code" &&
              column !== "Continent Name" &&
              column !== "Continent Code"
          )
          .map(column => {
            return {
              name: column,
              source: columnInfo[0][column],
              url: columnInfo[1][column],
              description: columnInfo[2][column]
            };
          });

        // Get list of Continent Names for color scale
        const continentNames = newHappy.reduce((result, country) => {
          const continentName = country["Continent Name"];
          if (result.indexOf(continentName) < 0 && continentName) {
            result.push(continentName);
          }
          return result;
        }, []);

        // Create ColorScale
        const colorScale = scaleOrdinal({
          domain: continentNames,
          range: colors
        });

        this.setState({
          colorScale: colorScale,
          isPromiseResolved: true,
          happyData: newHappy,
          metricVariables: columns,
          currentMetric: this.state.currentMetric,
          barChartVariables: this.state.barChartVariables,
          currentBarChart: this.state.currentBarChart
        });
      })
      .catch(err => {
        console.log("woops", err);
      });
  }

  handleCircleOver(country) {
    // Country will be the name of a country or null
    // This sets the currentCountry
    // VxScatterplot will handle the rest
    this.setState({ currentCountry: country });
  }

  handleLegendClick(label) {
    const { currentContinent } = this.state;
    const continentName = label.datum;
    if (continentName === currentContinent) {
      this.setState({ currentContinent: false });
    } else {
      this.setState({ currentContinent: continentName });
    }
  }

  handleVariableFieldSelect(variable) {
    const { metricVariables } = this.state;
    if (metricVariables.find(metric => metric.name === variable)) {
      this.setState({ currentMetric: variable });
    } else {
      this.setState({ currentBarChart: variable });
    }
  }

  render() {
    const {
      currentContinent,
      colorScale,
      isPromiseResolved,
      metricVariables,
      currentMetric,
      barChartVariables,
      currentBarChart,
      currentCountry,
      happyData,
      markdownData
    } = this.state;

    const markdownDict = {
      "GINI Index": markdownData[0].node.html,
      "Happy Planet Index": markdownData[1].node.html,
      "Human Development Index": markdownData[2].node.html,
      "Sustainable Economic Development Index": markdownData[3].node.html,
      "World Happiness Report Score": markdownData[4].node.html,
      Intro: markdownData[5].node.html
    };

    return (
      <Layout>
        <div className={style.happiness}>
          <h1 className={style.title}>
            Measuring Wellbeing for a Better World
          </h1>
          <div dangerouslySetInnerHTML={{ __html: markdownDict["Intro"] }} />
          {isPromiseResolved && (
            <div className={`pure-g ${style.wrapper}`}>
              <Legend scale={colorScale} legendClick={this.handleLegendClick} />
              <div className="pure-u-1-2 pure-u-md-1-3">
                <VxScatterplotWithSize
                  data={happyData}
                  xVar={"GDP Per Capita"}
                  yVar={"Happy Planet Index"}
                  currentCountry={currentCountry}
                  currentContinent={currentContinent}
                  colorScale={colorScale}
                  handleCircleOver={this.handleCircleOver}
                  useGrid={false}
                  linkHighlighting={false}
                />
              </div>
              <div className="pure-u-1-2 pure-u-md-1-3">
                <VxScatterplotWithSize
                  data={happyData}
                  xVar={"GDP Per Capita"}
                  yVar={"Human Development Index"}
                  currentCountry={currentCountry}
                  currentContinent={currentContinent}
                  colorScale={colorScale}
                  handleCircleOver={this.handleCircleOver}
                  useGrid={false}
                  linkHighlighting={false}
                />
              </div>
              <div className="pure-u-1-2 pure-u-md-1-3">
                <VxScatterplotWithSize
                  data={happyData}
                  xVar={"GDP Per Capita"}
                  yVar={"Sustainable Economic Development Index"}
                  currentCountry={currentCountry}
                  currentContinent={currentContinent}
                  colorScale={colorScale}
                  handleCircleOver={this.handleCircleOver}
                  useGrid={false}
                  linkHighlighting={false}
                />
              </div>
              <div className="pure-u-1-2 pure-u-md-1-3">
                <VxScatterplotWithSize
                  data={happyData}
                  xVar={"GDP Per Capita"}
                  yVar={"Happy Planet Index"}
                  currentCountry={currentCountry}
                  currentContinent={currentContinent}
                  colorScale={colorScale}
                  handleCircleOver={this.handleCircleOver}
                  useGrid={false}
                  linkHighlighting={false}
                />
              </div>
              <div className="pure-u-1-2 pure-u-md-1-3">
                <VxScatterplotWithSize
                  data={happyData}
                  xVar={"GDP Per Capita"}
                  yVar={"GINI Index"}
                  currentCountry={currentCountry}
                  currentContinent={currentContinent}
                  colorScale={colorScale}
                  handleCircleOver={this.handleCircleOver}
                  useGrid={false}
                  linkHighlighting={false}
                />
              </div>
            </div>
          )}
          {isPromiseResolved && (
            <React.Fragment>
              <div className="pure-g">
                <div className="pure-u-1">
                  <h2>Explore the Individual Metrics in Greater Detail</h2>
                  {metricVariables && (
                    <VariableForm
                      handleFieldSelect={this.handleVariableFieldSelect}
                      variableValues={metricVariables}
                      active={currentMetric}
                    />
                  )}
                </div>
                <div
                  className={style.metricDescription}
                  dangerouslySetInnerHTML={{
                    __html: markdownDict[currentMetric]
                  }}
                />
                <div className="pure-u-1">
                  <D3Map data={happyData} mapMetric={currentMetric} />
                </div>
                <div className="pure-u-1">
                  {barChartVariables && (
                    <VariableForm
                      handleFieldSelect={this.handleVariableFieldSelect}
                      variableValues={barChartVariables}
                      active={currentBarChart}
                    />
                  )}
                  <BarChart
                    data={happyData}
                    xVar={currentMetric}
                    yVar={"name"}
                    sortType={currentBarChart}
                    currentContinent={currentContinent}
                    colorScale={colorScale}
                  />
                </div>
                <div className="pure-u-1">
                  <Scatterplot
                    data={happyData}
                    xVar={"GDP Per Capita"}
                    yVar={currentMetric}
                    colorScale={colorScale}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </Layout>
    );
  }
}

export default Happiness;

export const query = graphql`
  {
    allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/happiness/" } }) {
      edges {
        node {
          html
        }
      }
    }
  }
`;
