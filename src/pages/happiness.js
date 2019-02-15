import React from "react";
import { csv } from "d3";
import Layout from "../components/layout";
import VariableForm from "../components/variableForm";
import VxScatterplotWithSize from "../components/visualizations/vxscatterplot";
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
  constructor() {
    super();
    this.state = {
      categories: [],
      categoryInfo: [],
      datasets: {},
      currentCountry: false,
      currentContinent: false,
      isPromiseResolved: false,
      metricVariables: [
        {
          value: "HappyPlanet",
          label: "Happy Planet Index",
          description:
            "Wellbeing, Life Expectancy, Inequality, Ecological Footprint"
        },
        {
          value: "HumanDevIndex",
          label: "Human Development Index",
          description: "Healthy Life, Education, Standard of Living"
        },
        {
          value: "Seda",
          label: "Sustainable Economic Development Index",
          description: "Sustainability, Economics, Investments"
        },
        {
          value: "WorldHappiness",
          label: "World Happiness Report",
          description: "Quality of Life Survey"
        },
        {
          value: "Gini",
          label: "GINI Index",
          description: "Inequality in Distribution of Family Income"
        },
        {
          value: "EconomicFreedom",
          label: "Economic Freedom Score",
          description:
            "Rule of Law, Government Size, Regulatory Efficiency, Open Markets"
        }
      ],
      activeMetric: "Gini",
      barChartVariables: [
        { value: "lowHigh", label: "Low to High" },
        { value: "highLow", label: "High to Low" },
        { value: "continent", label: "Group by Continent" },
        { value: "alphabetical", label: "Alphabetical" }
      ],
      activeBarChart: "lowhigh"
    };

    this.handleCircleOver = this.handleCircleOver.bind(this);
    this.handleLegendClick = this.handleLegendClick.bind(this);
    this.handleVariableFieldSelect = this.handleVariableFieldSelect.bind(this);
  }

  componentDidMount() {
    Promise.all([csv("countrycodes.csv"), csv("happy2.csv")]).then(allData => {
      const countryCodes = allData[0];
      const happy = allData[1];

      const categoryInfo = [];
      for (var i = 0; i < 4; i++) {
        categoryInfo.push(happy.shift());
      }

      happy.forEach(country => {
        const result = countryCodes.filter(code => {
          return code.Three_Letter_Country_Code === country["ISO Country code"];
        });
        if (result[0]) {
          country.continentName = result[0].Continent_Name;
          country.continentCode = result[0].Continent_Code;
        }
      });

      const newHappy = happy.map(country => {
        return {
          "name": country.indicator,
          "code": country["ISO Number"],
          "Continent Name": country.continentName,
          "Continent Code": country.continentCode,
          "GDP" : cleanNumbers(
          country["GDP  (billions PPP)"]),
          "GDP Per Capita": cleanNumbers(
          country["GDP per capita (PPP)"]),
          "GDP Annual Growth(2018)": country["GDP growth (annual %"],
          "Health Expenditure Per Person": cleanNumbers(
          country["health expenditure  per person"]),
          "Population": cleanNumbers(country["population"]),
          "GINI Index": cleanNumbers(country["GINI index"]),
          "World Happiness Report Score": cleanNumbers(
          country["world happiness report score"]),
            "Happy Planet Index": cleanNumbers(country["happy planet index"]),
            "Human Development Index": cleanNumbers(country["human development index"]),
            "Sustainable Economic Development Index": cleanNumbers(country["sustainable economic development assessment (SEDA)"]),
            "Economic Freedom Score": cleanNumbers(country["overall economic freedom score"]),
            "Civil Liberties Score": cleanNumbers(country["civil liberties score"]),
            "Political Rights Score": cleanNumbers(country["political rights score"])
        }
      })

      happy.columns.push("Continent Code", "Continent Name");

      const continentNames = newHappy.reduce((result, country) => {
        const continentName = country["Continent Name"];
        if (result.indexOf(continentName) < 0 && continentName) {
          result.push(continentName);
        }
        return result;
      } ,[])

      const zScale = scaleOrdinal({
        domain: continentNames,
        range: colors
      });

      // Set X and Y values for world happiness
      const worldHappinessData = happy.reduce((result, d) => {
        if (d["world happiness report score"] && d["GDP per capita (PPP)"]) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["world happiness report score"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      worldHappinessData.x = "GDP per Capita";
      worldHappinessData.y = "World Happiness Report Score";
      const GINIData = happy.reduce((result, d) => {
        if (d["GINI index"] && d["GDP per capita (PPP)"]) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["GINI index"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      GINIData.x = "GDP per Capita";
      GINIData.y = "GINI index";

      const happyPlanet = happy.reduce((result, d) => {
        if (d["happy planet index"] !== "FALSE" && d["GDP per capita (PPP)"]) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["happy planet index"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      happyPlanet.x = "GDP per Capita";
      happyPlanet.y = "happy planet index";

      const humanDevIndex = happy.reduce((result, d) => {
        if (
          d["human development index"] !== "FALSE" &&
          d["GDP per capita (PPP)"]
        ) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["human development index"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      humanDevIndex.x = "GDP per Capita";
      humanDevIndex.y = "Human Development Index";

      const Seda = happy.reduce((result, d) => {
        if (
          d["sustainable economic development assessment (SEDA)"] !== "FALSE" &&
          d["GDP per capita (PPP)"]
        ) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["sustainable economic development assessment (SEDA)"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      Seda.x = "GDP per Capita";
      Seda.y = "SEDA";

      const EconomicFreedom = happy.reduce((result, d) => {
        if (
          d["overall economic freedom score"] !== "FALSE" &&
          d["GDP per capita (PPP)"]
        ) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["overall economic freedom score"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      EconomicFreedom.x = "GDP per Capita";
      EconomicFreedom.y = "Overall Economic Freedom Score";

      const CivilLiberties = happy.reduce((result, d) => {
        if (
          d["civil liberties score"] !== "FALSE" &&
          d["GDP per capita (PPP)"]
        ) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["civil liberties score"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      CivilLiberties.x = "GDP per Capita";
      CivilLiberties.y = "Civil Liberties Score";

      const PoliticalRights = happy.reduce((result, d) => {
        if (
          d["political rights score"] !== "FALSE" &&
          d["GDP per capita (PPP)"]
        ) {
          result.push({
            name: d.indicator,
            code: d["ISO Number"],
            y: d["political rights score"],
            x: d["GDP per capita (PPP)"],
            continent: d.continentName
          });
        }
        return result;
      }, []);
      PoliticalRights.x = "GDP per Capita";
      PoliticalRights.y = "Political Rights";

      this.setState({
        categories: happy.columns,
        categoryInfo: categoryInfo,
        zScale: zScale,
        isPromiseResolved: true,
        happyData: newHappy,
        datasets: {
          happiness: worldHappinessData,
          gini: GINIData,
          happyPlanet: happyPlanet,
          humanDevIndex: humanDevIndex,
          economicFreedom: EconomicFreedom,
          civilLiberties: CivilLiberties,
          politicalRights: PoliticalRights,
          Seda: Seda
        },
        metricVariables: this.state.metricVariables,
        activeMetric: this.state.activeMetric,
        barChartVariables: this.state.barChartVariables,
        activeBarChart: this.state.activeBarChart
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
    if (metricVariables.find(metric => metric.value === variable)) {
      this.setState({ activeMetric: variable });
    } else {
      this.setState({ activeBarChart: variable });
    }
  }

  render() {
    const {
      currentContinent,
      zScale,
      isPromiseResolved,
      metricVariables,
      activeMetric,
      barChartVariables,
      activeBarChart,
      currentCountry,
      happyData
    } = this.state;
    const {
      happiness,
      gini,
      happyPlanet,
      humanDevIndex,
      Seda,
      economicFreedom,
      civilLiberties,
      politicalRights
    } = this.state.datasets;

    const metricMap = {
      HappyPlanet: happyPlanet,
      HumanDevIndex: humanDevIndex,
      Seda: Seda,
      WorldHappiness: happiness,
      Gini: gini,
      EconomicFreedom: economicFreedom
    };

    return (
      <Layout>
        <h1 className={style.title}>Measuring Wellbeing for a Better World</h1>
        <h3>The history of measuring human wellbeing</h3>
        <p>
          The history of attempting to measure human wellbeing on a global scale
          is still relatively new. After World War 2 and the Great Depression,
          when countries were attempting to find ways to measure their
          recoveries, economist Simon Kuznets developed the concept of a Gross
          Domestic Product (GDP) to capture all economic production by
          individuals, companies and the government in a single statistic. He
          theorized that it should correlate to wellbeing since it would rise in
          good times and fall in bad.
        </p>
        <p>
          This was easily measurable and served as the primary measure of a
          country's wellbeing for many years but over time, criticism arose that
          growth in a country's economic output doesn't necessarily mean a
          better life for it's citizens.
        </p>
        <p>
          In 1990, UN economist Mahbub ul Haq created the Human Development
          Index (HDI) to more accurately measure human wellbeing, which focused
          on education, health expectancy, gender equality, and standard of
          living. In 2012, UN Secretary General Ban Ki Moon recognized the
          importance of making happiness a goal of public policy.
        </p>
        <h3>What is Happiness anyway?</h3>
        <blockquote>
          <p>
            Happiness is the experience of joy, contentment, or positive
            well-being, combined with a sense that one’s life is good,
            meaningful, and worthwhile.
          </p>
          <footer>
            Psychologist Sonja Lyubomirsky in her book{" "}
            <cite>
              <a href="https://www.amazon.com/gp/product/0143114956">
                The How of Happiness
              </a>
            </cite>
          </footer>
        </blockquote>
        <p>
          This definition clearly seperates happiness into two main parts, the
          first, happiness as positive emotions such as joy, contentment,
          interest and love and the second, as an evaluation of human wellbeing,
          a sense of fulfillment and satisfaction that comes from living a good
          life.
        </p>
        <p>
          The emotional aspect is universal while the second depends on a
          person's culture and life experiences. For example, when Sonja
          Lyubomirsky did a research project asking people in America and Russia
          to define happiness,American people said money, family, success,
          having fun while Russian people said spiritual salvation, a world of
          peace and beauty, mutual understanding among people.
        </p>
        <p>
          Happiness is difficult to measure but if there is a strong
          corrollation between happiness and quality of life, then if we can
          find a way to model happiness in a society, then we can measure it's
          quality of life, observe changes over time, refine our models and
          maximize for policies that lead to more happiness and avoid policies
          that lead to less happiness.
        </p>
        <h3>Different Ways of Measuring Wellbeing</h3>
        <p>
          There have been different attempts at measuring wellbeing and they
          will be described below. By visualizing these metrics of wellbeing
          alongside the GDP per capita, we can see that there is a rough
          correlation between increased GDP per capita and improved scores on
          these wellbeing metrics.
        </p>
        {isPromiseResolved && (
          <div className={`pure-g ${style.wrapper}`}>
            <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"Happy Planet Index"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
                        <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"Human Development Index"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
                        <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"Sustainable Economic Development Index"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
                        <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"Happy Planet Index"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
                        <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"Economic Freedom Score"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
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
            <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"GINI Index"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
            <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"Civil Liberties Score"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
            <div className="pure-u-1 pure-u-md-1-5">
              <VxScatterplotWithSize
                data={happyData}
                xAxis={"GDP Per Capita"}
                yAxis={"Political Rights Score"}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                zScale={zScale}
                handleCircleOver={this.handleCircleOver}
                useGrid={false}
                linkHighlighting={false}
              />
            </div>
          </div>
        )}
        <div className="pure-g">
          <div className="pure-u-1">
            <VariableForm
              handleFieldSelect={this.handleVariableFieldSelect}
              variableValues={metricVariables}
              active={activeMetric}
            />
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
              <VariableForm
                handleFieldSelect={this.handleVariableFieldSelect}
                variableValues={metricVariables}
                active={activeMetric}
              />
            </div>
            <div className="pure-g">
              <VariableForm
                handleFieldSelect={this.handleVariableFieldSelect}
                variableValues={barChartVariables}
                active={activeBarChart}
              />
              <div className="pure-u-4-5">
                <BarChart
                  data={gini}
                  sortType={activeBarChart}
                  currentContinent={currentContinent}
                  zScale={zScale}
                />
              </div>
              <div className="pure-u-4-5">
                <Scatterplot data={gini} zScale={zScale} />
              </div>
            </div>
          </React.Fragment>
        )}
      </Layout>
    );
  }
}

export default Happiness;
