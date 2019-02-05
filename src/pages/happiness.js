import React from 'react';
import { csv } from 'd3';
import Layout from '../components/layout';
import VxScatterplotWithSize from '../components/visualizations/vxscatterplot';
import ChloroplethMapWithTooltip from '../components/visualizations/chloroplethMap';
import Legend from '../components/visualizations/legend';
import { scaleOrdinal } from '@vx/scale';

const cleanNumbers = (string) => {
	return parseFloat(string.replace(/,/g, ''));
};

class Happiness extends React.Component {
	state = {
		categories: [],
		categoryInfo: [],
		datasets: {},
		currentCountry: false,
		isPromiseResolved: false
	};

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
			console.log(happy, happySub5Mil);

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

			console.log(worldHappinessData, GINIData);
			this.setState({
				categories: happy.columns,
				categoryInfo: categoryInfo,
				zScale: zScale,
				isPromiseResolved: true,
				datasets: { happiness: worldHappinessData, gini: GINIData }
			});
		});
	}
	
	handleLegendClick(label) {
		const continentName = label.datum
	}

	render() {
		const { zScale, isPromiseResolved } = this.state;
		const { happiness, gini } = this.state.datasets;

		return (
			<Layout>
				<h1>How we measure happiness</h1>
				{isPromiseResolved && (
					<React.Fragment>
						<div className="pure-g">
							<Legend scale={zScale} legendClick={this.handleLegendClick}/>
							<div className="pure-u-1 pure-u-md-1-3">
								<VxScatterplotWithSize data={happiness} zScale={zScale} />
							</div>
							<div className="pure-u-1 pure-u-md-1-3">
								<VxScatterplotWithSize data={gini} zScale={zScale} />
							</div>
							<div className="pure-u-1">
								<ChloroplethMapWithTooltip data={happiness} mapValue="Happiness" />
							</div>
						</div>
					</React.Fragment>
				)}
			</Layout>
		);
	}
}

export default Happiness;
