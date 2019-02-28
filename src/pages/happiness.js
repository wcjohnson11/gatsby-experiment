import React from 'react';
import { graphql, withPrefix } from 'gatsby';
import { csv, timeParse } from 'd3';
import Layout from '../components/layout';
import MultiLine from '../components/visualizations/multiline';
import Select from 'react-select';
import VxScatterRow from '../components/visualizations/vxScatterRow';
import Heatmap from '../components/visualizations/heatmap';
import D3Map from '../components/visualizations/d3map';
import Scatterplot from '../components/visualizations/scatterplot';
import Legend from '../components/visualizations/legend';
import MarkdownDiv from '../components/markdowndiv';
import { scaleOrdinal } from '@vx/scale';
import style from './styles/happiness.module.css';
import BarChart from '../components/visualizations/barchart';

const cleanNumbers = (string) => {
	return parseFloat(string.replace(/,/g, ''));
};
const parseTime = timeParse('%Y');

const colors = [ '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33' ];

class Happiness extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			markdownData      : props.data && props.data.allMarkdownRemark.edges,
			datasets          : {},
			currentCountry    : false,
			currentContinent  : false,
			isPromiseResolved : false,
			metrics           : [
				'Happy Planet Index',
				'GINI Index',
				'Human Development Index',
				'Sustainable Economic Development Index',
				'World Happiness Report Score'
			],
			currentMetric     : 'GINI Index',
			barChartVariables : [ 'Low to High', 'High to Low', 'Group by Continent', 'Alphabetical' ],
			currentBarChart   : 'Group by Continent',
			xAxisVariables    : [
				'GDP Per Capita',
				'GINI Index',
				'Happy Planet Index',
				'Human Development Index',
				'Sustainable Economic Development Index',
        'World Happiness Report Score',
        'GDP Annual Growth (2018)',
        "Health Expenditure  % of GDP",
        "Health Expenditure Per Person",
        "Education Expenditure % of GDP",
        "Education Expenditure  per person",
        "Political Stability & Absence of Violence",
        "Overall Economic Freedom Score",
        "Government Integrity Score"
			],
			currentXAxis: 'GDP Per Capita'
		};
		this.handleCircleOver = this.handleCircleOver.bind(this);
		this.handleLegendClick = this.handleLegendClick.bind(this);
    this.handleVariableFieldSelect = this.handleVariableFieldSelect.bind(this);
    this.handleAxisFieldSelect = this.handleAxisFieldSelect.bind(this);
	}

	componentDidMount() {
		Promise.all([
			csv(withPrefix('countrycodes.csv')),
			csv(withPrefix('happy2.csv')),
			csv(withPrefix('gdpovertime.csv'))
		]).then((allData) => {
			// Get countrycodes data

			const countryCodes = allData[0];
			// Get happy data

			const happy = allData[1];

			// Get column Info for happiness dataset
			const columnInfo = [];
			for (var i = 0; i < 9; i++) {
				columnInfo.push(happy.shift());
			}

			// Add Country data to happiness data on ISO Country Code
			happy.forEach((country) => {
				const result = countryCodes.filter((code) => {
					return code.Three_Letter_Country_Code === country['ISO Country Code'];
				});
				if (result[0]) {
					country['Continent Name'] = result[0].Continent_Name;
					country['Continent Code'] = result[0].Continent_Code;
				}
			});

			// Clean data for visualization components
			const newHappy = happy.map((country) => {
				const newCountryData = Object.keys(country).reduce((result, key) => {
					if (
						key === 'name' ||
						key === 'code' ||
						key === 'ISO Country Code' ||
						key === 'Continent Name' ||
						key === 'Continent Code'
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
					(column) =>
						column !== 'name' &&
						column !== 'code' &&
						column !== 'ISO Country Code' &&
						column !== 'Continent Name' &&
						column !== 'Continent Code' &&
						column !== 'Population' &&
						column !== 'surface area (Km2)' &&
						column !== 'GDP  (billions PPP)' &&
						column !== ''
				)
				.map((column) => {
					return {
						name                : column,
						source              : columnInfo[0][column],
						url                 : columnInfo[1][column],
						description         : columnInfo[2][column],
						Economics           : columnInfo[3][column],
						'Health Expectancy' : columnInfo[4][column],
						Inequality          : columnInfo[5][column],
						Sustainability      : columnInfo[6][column],
						Happiness           : columnInfo[7][column],
						dataYear            : columnInfo[8][column]
					};
				});

			// Get list of Continent Names for color scale
			const continentNames = newHappy.reduce((result, country) => {
				const continentName = country['Continent Name'];
				if (result.indexOf(continentName) < 0 && continentName) {
					result.push(continentName);
				}
				return result;
			}, []);

			// Create Continent ColorScale
			const colorScale = scaleOrdinal({
				domain : continentNames,
				range  : colors
			});

			// get gdp over time data
			const gdp = allData[2].map((d) => {
				return {
					Entity           : d.Entity,
					Code             : d.Code,
					Year             : parseTime(d.Year),
					'GDP per capita' : cleanNumbers(d['GDP per capita'])
				};
			});

			this.setState({
				colorScale        : colorScale,
				isPromiseResolved : true,
				happyData         : newHappy,
				gdp               : gdp,
				columns           : columns
			});
		});
	}

	// Country will be the name of a country or null
	// This sets the currentCountry
	// VxScatterplot will handle the rest
	handleCircleOver(country) {
		this.setState({ currentCountry: country });
	}

	// Legend click sets current Continent variable
	// for filtering
	handleLegendClick(label) {
		const { currentContinent } = this.state;
		const continentName = label.datum;
		if (continentName === currentContinent) {
			this.setState({ currentContinent: false });
		} else {
			this.setState({ currentContinent: continentName });
		}
	}

	// Variable Field select sets current metric for
	// Markdown Sections and bar chart sorting
	handleVariableFieldSelect(variable) {
		const { metrics } = this.state;
		const { value } = variable;

		if (metrics.find((metric) => metric === value)) {
			this.setState({ currentMetric: value });
		} else {
			this.setState({ currentBarChart: value });
		}
  }
  
  handleAxisFieldSelect(variable) {
    const { value } = variable;
    this.setState({ currentXAxis: value });
  }

	render() {
		const {
			barChartVariables,
			currentBarChart,
			currentContinent,
			currentCountry,
			currentMetric,
			currentXAxis,
			colorScale,
			columns,
			happyData,
			gdp,
			isPromiseResolved,
			markdownData,
			metrics,
			xAxisVariables
		} = this.state;

		// Create Markdown Section object
		const markdownSections = {};
		for (var section in markdownData) {
			const title = markdownData[section].node.frontmatter.title;
			const html = markdownData[section].node.html;
			markdownSections[title] = html;
		}

		return (
			<Layout>
				<section className={style.happiness}>
					<section>
						<h1 className={style.title}>
							Measuring Well-Being <br /> For A Better World
						</h1>
						<MarkdownDiv content={markdownSections['Happiness Intro']} />
						<MultiLine data={gdp} />
					</section>
					<section className={style.belowViz}>
						<MarkdownDiv content={markdownSections['Beyond GDP']} />
						<div className={style.center}>
							<Heatmap data={happyData} columns={columns} metrics={metrics} />
						</div>
					</section>
					{isPromiseResolved && (
						<section className={style.wrapper}>
							<Legend
								currentContinent={currentContinent}
								scale={colorScale}
								legendClick={this.handleLegendClick}
							/>
							<VxScatterRow
								data={happyData}
								currentCountry={currentCountry}
								currentContinent={currentContinent}
								colorScale={colorScale}
								handleCircleOver={this.handleCircleOver}
								metrics={metrics}
								useGrid={false}
								linkHighlighting={false}
							/>
						</section>
					)}
					{isPromiseResolved && (
						<React.Fragment>
							<section>
								<h3>Explore the Individual Metrics in Greater Detail</h3>
								<p>
									Select a metric from the dropdown and explore the data visualizations below to see
									geographic trends and a more detailed look into how country's scores relate to one
									another.
								</p>
								{metrics && (
									<Select
										value={{ label: currentMetric, value: currentMetric }}
										onChange={this.handleVariableFieldSelect}
										controlShouldRenderValue={true}
										className={style.select}
										options={metrics.map((d) => {
											return {
												value : d,
												label : d
											};
										})}
										blurInputOnSelect={false}
										isMulti={false}
									/>
								)}
							</section>
							<section
								className={`${style.belowViz} ${style.metricDescription}`}
								dangerouslySetInnerHTML={{
									__html : markdownSections[currentMetric]
								}}
							/>
							<section className={style.globe}>
                <h4>Viewing {currentMetric} On A Map</h4>
                <p>Get a geographical overview and regional trends of {currentMetric}</p>
								<D3Map data={happyData} mapMetric={currentMetric} />
							</section>
							<section>
                <h4>Changing the X Axis</h4>
                <p>Choosing a different X Axis variable allows you to explore relationship between it and the {currentMetric} on the Y Axis.</p>
								<Select
									value={{ label: currentXAxis, value: currentXAxis }}
									onChange={this.handleAxisFieldSelect}
									controlShouldRenderValue={true}
									className={style.select}
									options={xAxisVariables.filter(d => d !== currentMetric).map((d) => {
										return {
											value : d,
											label : d
										};
									})}
									blurInputOnSelect={false}
									isMulti={false}
								/>
								<Scatterplot
									data={happyData}
									xVar={currentXAxis}
									yVar={currentMetric}
									colorScale={colorScale}
								/>
							</section>
							<section className={style.belowViz}>
              <h4>Exploring The Countries as Bars</h4>
                <p>The below bar chart shows all countries on the y Axis and the {currentMetric} on the yAxis. You can change how they're sorted with the below selector.</p>
								{barChartVariables && (
									<Select
										value={{ label: currentBarChart, value: currentBarChart }}
										onChange={this.handleVariableFieldSelect}
										controlShouldRenderValue={true}
										className={style.select}
										options={barChartVariables.map((d) => {
											return {
												value : d,
												label : d
											};
										})}
										blurInputOnSelect={false}
										isMulti={false}
									/>
								)}
								<BarChart
									data={happyData}
									xVar={currentMetric}
									yVar={'name'}
									sortType={currentBarChart}
									currentContinent={currentContinent}
									colorScale={colorScale}
								/>
							</section>
							<section className={style.belowViz}>
								<MarkdownDiv content={markdownSections['Conclusion']} />
							</section>
						</React.Fragment>
					)}
				</section>
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
					frontmatter {
						title
					}
				}
			}
		}
	}
`;
