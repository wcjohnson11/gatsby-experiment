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
      markdownData: props.data.allMarkdownRemark.edges,
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
    Promise.all([csv("countrycodes.csv"), csv("happy2.csv")]).then(allData => {
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
          return code.Three_Letter_Country_Code === country["ISO Country Code"];
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
    console.log(markdownData);
    return (
      <Layout>
        <h1 className={style.title}>Measuring Wellbeing for a Better World</h1>
        <div dangerouslySetInnerHTML={{ __html: markdownData[0].node.html }} />
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
                yVar={"Economic Freedom Score"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                colorScale={colorScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
            <p>
              The below metrics are structured in such a way that lower values
              are better. A similar correlation with GDP per capita can be seen
              for these metrics.
            </p>
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
            <div className="pure-u-1-2 pure-u-md-1-3">
              <VxScatterplotWithSize
                data={happyData}
                xVar={"GDP Per Capita"}
                yVar={"Civil Liberties Score"}
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
                yVar={"Political Rights Score"}
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
        <div className="pure-g">
          <div className="pure-u-1">
            {metricVariables && (
              <VariableForm
                handleFieldSelect={this.handleVariableFieldSelect}
                variableValues={metricVariables}
                active={currentMetric}
              />
            )}
          </div>
        </div>
        <h4>GINI index</h4>
        <p>
          One of the oldest measurements of wellbeing is The GINI index,
          developed by Italian Statistician Corrado Gini in 1912, measures
          inequality in income distribution in family income, with 0
          representing perfect equality (everyone earns exactly the same) and 1
          representing perfect inequality (one family earns everything, everyone
          else earns nothing). The GINI index is an imperfect measurement
          because it focuses on income, rather than wealth, which is much harder
          to measure because of unreliable GDP and income data. Shadow economies
          and tax havens make it hard to measure income and wealth, particularly
          in developing countries. Despite this, it appears to be fairly well
          correlated to GDP per capita, meaning that countries with a higher GDP
          per capita tend to have less inequality, at least as far as it can be
          measured.
        </p>
        {isPromiseResolved && (
          <React.Fragment>
            <div className="pure-g">
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
                  xVar={"GINI Index"}
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
                  yVar={"GINI Index"}
                  colorScale={colorScale}
                />
              </div>
            </div>
          </React.Fragment>
        )}
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
