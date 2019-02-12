import React from 'react';
import { csv } from 'd3';
import Layout from '../components/layout';
import VariableForm from '../components/variableForm';
import VxScatterplotWithSize from '../components/visualizations/vxscatterplot';
import ChloroplethMapWithSize from '../components/visualizations/chloroplethMap';
import VxBarChart from '../components/visualizations/vxbarchart'
import Legend from '../components/visualizations/legend';
import { scaleOrdinal } from '@vx/scale';
import style from './happiness.module.css';

const cleanNumbers = (string) => {
	return parseFloat(string.replace(/,/g, ''));
};

class Happiness extends React.Component {
	constructor(){
		super();
		this.state = {
			categories: [],
			categoryInfo: [],
			datasets: {},
			currentCountry: false,
			currentContinent: false,
			isPromiseResolved: false,
			variableValue: 'Gini'
		};

		this.handleLegendClick = this.handleLegendClick.bind(this)
		this.handleVariableFieldSelect = this.handleVariableFieldSelect.bind(this)
	}

	componentDidMount() {
		Promise.all([ csv('countrycodes.csv'), csv('happy2.csv') ]).then((allData) => {
			const countryCodes = allData[0];
			const happy = allData[1];

			const categoryInfo = [];
			for (var i = 0; i < 4; i++) {
				categoryInfo.push(happy.shift());
			}

			happy.forEach((country) => {
				const result = countryCodes.filter((code) => {
					return code.Three_Letter_Country_Code === country['ISO Country code'];
				});
				if (result[0]) {
					country.continentName = result[0].Continent_Name;
					country.continentCode = result[0].Continent_Code;
				}

				country['GDP  (billions PPP)'] = cleanNumbers(country['GDP  (billions PPP)']);
				country['GDP per capita (PPP)'] = cleanNumbers(country['GDP per capita (PPP)']);
				country['health expenditure  per person'] = cleanNumbers(country['health expenditure  per person']);
				country['population'] = cleanNumbers(country['population']);
				country['surface area (Km2)'] = cleanNumbers(country['surface area (Km2)']);
				country['GINI index'] = cleanNumbers(country['GINI index']);
				country['world happiness report score'] = cleanNumbers(country['world happiness report score']);
			});

			happy.columns.push('Continent Code', 'Continent Name');
			const happySub5Mil = happy.filter((country) => country.population > 5000000);
			const continentNames = [ 'Africa', 'Asia', 'Europe', 'South America', 'North America', 'Oceania' ];
			const zScale = scaleOrdinal({
				domain: continentNames,
				range: [ 'orange', 'yellow', 'blue', 'purple', 'green', 'red' ]
			});

			// Set X and Y values for world happiness
			const worldHappinessData = happy.reduce((result, d) => {
				if (d['world happiness report score'] && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['world happiness report score'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			worldHappinessData.x = 'GDP per Capita';
			worldHappinessData.y = 'World Happiness Report Score';
			const GINIData = happy.reduce((result, d) => {
				if (d['GINI index'] && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['GINI index'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			GINIData.x = 'GDP per Capita';
			GINIData.y = 'GINI index';

			const happyPlanet = happy.reduce((result, d) => {
				if (d['happy planet index'] !== 'FALSE' && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['happy planet index'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			happyPlanet.x = 'GDP per Capita';
			happyPlanet.y = 'happy planet index';

			const humanDevIndex = happy.reduce((result, d) => {
				if (d['human development index'] !== 'FALSE' && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['human development index'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			humanDevIndex.x = 'GDP per Capita';
			humanDevIndex.y = 'Human Development Index';

			const Seda = happy.reduce((result, d) => {
				if (d['sustainable economic development assessment (SEDA)'] !== 'FALSE' && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['sustainable economic development assessment (SEDA)'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			Seda.x = 'GDP per Capita';
			Seda.y = 'sustainable economic development assessment (SEDA)';

			const EconomicFreedom = happy.reduce((result, d) => {
				if (d['overall economic freedom score'] !== 'FALSE' && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['overall economic freedom score'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			EconomicFreedom.x = 'GDP per Capita';
			EconomicFreedom.y = 'Overall Economic Freedom Score';
			
			const CivilLiberties = happy.reduce((result, d) => {
				if (d['civil liberties score'] !== 'FALSE' && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['civil liberties score'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			CivilLiberties.x = 'GDP per Capita';
			CivilLiberties.y = 'Civil Liberties Score';
			
			const PoliticalRights = happySub5Mil.reduce((result, d) => {
				if (d['political rights score'] !== 'FALSE' && d['GDP per capita (PPP)']) {
					result.push({
						name: d.indicator,
						code: d['ISO Country code'],
						y: d['political rights score'],
						x: d['GDP per capita (PPP)'],
						continent: d.continentName
					});
				}
				return result;
			}, []);
			PoliticalRights.x = 'GDP per Capita';
			PoliticalRights.y = 'Political Rights';
			
			this.setState({
				categories: happy.columns,
				categoryInfo: categoryInfo,
				zScale: zScale,
				isPromiseResolved: true,
				datasets: {
					happiness: worldHappinessData,
					gini: GINIData,
					happyPlanet: happyPlanet,
					humanDevIndex: humanDevIndex,
					economicFreedom: EconomicFreedom,
					civilLiberties: CivilLiberties,
					politicalRights: PoliticalRights,
					Seda: Seda
				}
			});
		});
	}

	handleLegendClick(label) {
		const {currentContinent} = this.state
		const continentName = label.datum;
		if (continentName === currentContinent) {
			this.setState({currentContinent: false})
		} else {
			this.setState({currentContinent: continentName})
		}
	}

	handleVariableFieldSelect(variable) {
		this.setState({variableValue: variable})
	}

	render() {
		const { currentContinent, zScale, isPromiseResolved, variableValue } = this.state;
		const { happiness, gini, happyPlanet, humanDevIndex, Seda, economicFreedom, civilLiberties, politicalRights } = this.state.datasets;

		return (
			<Layout>
				<h1 className={style.title}>Measuring Happiness Around The World</h1>
				<p>What does it mean to live a good life? For most people, the answer will be happiness. Other popular answers, such as love, money, freedom, security or community could arguably be considered the building blocks or prerequisites for happiness. If there is a strong corrollation between happiness and quality of life, then if we can find a way to model happiness in a society, then we can measure it's quality of life, observe changes over time, refine our models and maximize for policies that lead to more happiness.</p>
				<h3>What is Happiness anyway?</h3>
				<blockquote>
					<p>Happiness is the experience of joy, contentment, or positive well-being, combined with a sense that one’s life is good, meaningful, and worthwhile.</p>
					<footer>Psychologist Sonja Lyubomirsky in her book <cite><a href="https://www.amazon.com/gp/product/0143114956">The How of Happiness</a></cite></footer>
				</blockquote>
				<p>I like this definition of happiness, it clearly seperates happiness into two main parts, positive emotions such as joy, contentment, interest and love and then the sense of satisfaction that comes with achieving life goals. The emotional aspect is universal while the second is more variable depending on a person's values. Different cultures and life experiences will lead to different values. For instance, in a survey that 
					. It's an entirely different question, although very interesting, if we can view what is happiness as a view into what people feel like is missing from their lives, or what gives them purpose. For interest, when Sonja Lyubomirsky did a research project asking people in America and Russia to define this, she received very different answers. American people said money, family, success, having fun, Russian people said spiritual salvation, a world of peace and beauty, mutual understanding among people. It's interesting to think about what </p>
				<p>Happines is cultural (america > money, family, success, having fun,,,, spiritual salvation, a world of peace and beauty, mutual understanding among people</p>
				<VariableForm handleFieldSelect={this.handleVariableFieldSelect} variableValue={variableValue} />
				{isPromiseResolved && (
					<React.Fragment>
						<div className="pure-g">
							<Legend scale={zScale} legendClick={this.handleLegendClick} />
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={happyPlanet} currentContinent={currentContinent} zScale={zScale} useGrid={false} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={humanDevIndex} currentContinent={currentContinent} zScale={zScale} useGrid={false} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={Seda} currentContinent={currentContinent} zScale={zScale} useGrid={false} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={happiness} currentContinent={currentContinent} zScale={zScale} useGrid={false} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={economicFreedom} currentContinent={currentContinent} zScale={zScale} useGrid={false} />
							</div>
						</div>
						<div className="pure-g">
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={gini} zScale={zScale} useGrid={false} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={civilLiberties} zScale={zScale} useGrid={false} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxScatterplotWithSize data={politicalRights} zScale={zScale} useGrid={false} />
							</div>
						</div>
						<div className="pure-g">
							<div className="pure-u-1 pure-u-md-1-5">
								<VxBarChart data={happyPlanet} zScale={zScale} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxBarChart data={humanDevIndex} zScale={zScale} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxBarChart data={Seda} zScale={zScale} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxBarChart data={happiness} zScale={zScale} />
							</div>
							<div className="pure-u-1 pure-u-md-1-5">
								<VxBarChart data={gini} zScale={zScale} />
							</div>
						</div>
						<div className="pure-g">
							<div className="pure-u-1">
								<ChloroplethMapWithSize data={happiness} mapValue="Happiness" />
							</div>
						</div>
					</React.Fragment>
				)}
			</Layout>
		);
	}
}

export default Happiness;
