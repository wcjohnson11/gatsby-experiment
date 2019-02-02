import React from 'react';
import { csv } from 'd3';
import Layout from '../components/layout';
import Scatterplot from '../components/visualizations/scatterplot';
import VxBarChart from '../components/visualizations/vxbarchart';
import VxScatterplot from '../components/visualizations/vxscatterplot';
import { withTooltip } from '@vx/tooltip';
import { withParentSize } from '@vx/responsive';

const cleanNumbers = (string) => {
	return parseFloat(string.replace(/,/g, ''));
};

class Happiness extends React.Component {
	state = {
		categories: [],
		categoryInfo: [],
		datasets: {},
		currentCircle: false
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

			console.log(happy, happySub5Mil);

			// Set X and Y values for world happiness
			const worldHappinessData = happy.reduce((result, d) => {
				if (d['world happiness report score'] && d['GDP per capita (PPP)']) {
					console.log('check', d['GDP per capita (PPP)'], d);
					result.push({
						name: d.indicator,
						y: d['world happiness report score'],
						x: d['GDP per capita (PPP)']
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
						y: d['GINI index'],
						x: d['GDP per capita (PPP)']
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
				datasets: { happiness: worldHappinessData, gini: GINIData }
			});
		});
	}

	handleCircleMouseOver(event) {
		console.log(event.target);
	}

	render() {
		const { happiness, gini } = this.state.datasets;
		const BarChartWithTooltip = withTooltip(VxBarChart);
		const BarChartWithSize = withParentSize(BarChartWithTooltip);
		const ScatterplotWithTooltip = withTooltip(VxScatterplot);
		const VxScatterplotWithSize = withParentSize(ScatterplotWithTooltip);

		return (
			<Layout>
				<h1>How we measure happiness</h1>
				<div className="pure-g">
					<Scatterplot
						className="pure-u-1 pure-u-md-1-2"
						data={happiness}
						handleMouseOver={this.handleCircleMouseOver}
					/>
					<Scatterplot
						className="pure-u-1 pure-u-md-1-2"
						data={gini}
						handleMouseOver={this.handleCircleMouseOver}
					/>
				</div>
				<div className="pure-g">
					<VxScatterplotWithSize className={`pure-u-1`} data={happiness} />
				</div>
				<div className="pure-g">
					<BarChartWithSize className="pure-u-1" data={happiness} />
				</div>
			</Layout>
		);
	}
}

export default Happiness;
