import React from 'react';
import { tsv } from 'd3';
import Layout from '../components/layout';
import Scatterplot from '../components/visualizations/scatterplot';
import VxBarChart from '../components/visualizations/vxbarchart';
import VxScatterplot from '../components/visualizations/vxscatterplot';
import { withTooltip } from '@vx/tooltip';
import { withParentSize } from '@vx/responsive';

const cleanNumbers = (string) => parseFloat(string.replace(/,/g, ''));

class Happiness extends React.Component {
	state = {
		categories: [],
		categoryInfo: [],
		datasets: {},
		currentCircle: false
	};

	componentDidMount() {
		tsv('happy.tsv').then((data) => {
			const categories = data.columns;
			const categoryInfo = [];
			for (var i = 0; i < 4; i++) {
				categoryInfo.push(data.shift());
			}
			// Set X and Y values for world happiness
			const worldHappinessData = data.reduce((result, d) => {
				if (d['world happiness report score'] !== '-' && d['GDP per capita (PPP)'] !== '-') {
					result.push({
						name: d.indicator,
						y: cleanNumbers(d['world happiness report score']),
						x: cleanNumbers(d['GDP per capita (PPP)'])
					});
				}
				return result;
			}, []);
			worldHappinessData.x = 'GDP per Capita';
			worldHappinessData.y = 'World Happiness Report Score';

			const GINIData = data.reduce((result, d) => {
				if (d['GINI index'] !== '-' && d['GDP per capita (PPP)'] !== '-') {
					result.push({
						name: d.indicator,
						y: cleanNumbers(d['GINI index']),
						x: cleanNumbers(d['GDP per capita (PPP)'])
					});
				}
				return result;
			}, []);
			GINIData.x = 'GDP per Capita';
			GINIData.y = 'GINI index';
			this.setState({
				categories: categories,
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
