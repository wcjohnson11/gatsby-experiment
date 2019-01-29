import React from 'react';
import * as d3 from 'd3';
import styles from './scatterplot.module.css';

const width = 600;
const height = 600;
const padding = 100;

class Scatterplot extends React.Component {
	state = {
		circles: []
	};

	// Initialize Axes
	xAxis = d3.axisBottom().ticks(5);
	yAxis = d3.axisLeft();

	static getDerivedStateFromProps(nextProps, prevState) {
		const { data } = nextProps;
		if (!data) return {};

		// Get min, max of x value
		// and map to X-position
		const xScale = d3.scaleLinear().domain(d3.extent(data, (d) => d.x)).range([ padding, width - padding ]);

		// 2. Initialize scale of Y Position
		// and map to Y-position
		const yScale = d3.scaleLinear().domain([ 0, d3.max(data, (d) => d.y) ]).range([ height - padding, padding ]);

		const circles = data.map((d) => {
			return {
				cx: xScale(d.x),
				cy: yScale(d.y),
				key: d.name
			};
		});

		const labels = {
			x: data.x,
			y: data.y
		};
		return { circles, xScale, yScale, labels };
	}

	componentDidUpdate() {
		const { xScale, yScale, labels } = this.state;
		this.xAxis.scale(xScale);
		d3.select(this.refs.xAxis).call(this.xAxis);
		this.yAxis.scale(yScale);
		d3.select(this.refs.yAxis).call(this.yAxis);
		d3.select(this.refs.xAxisLabel).text(labels.x);
		d3.select(this.refs.yAxisLabel).text(labels.y);
	}

	render() {
		return (
			<svg width={width} height={height}>
				{this.state.circles.map((d) => (
					<circle key={d.key} fill={'white'} stroke={'black'} strokeWidth={2} cx={d.cx} cy={d.cy} r={3} />
				))}
				<g ref="xAxis" className={styles.axis} transform={`translate(0, ${height - padding})`} />
				<g ref="yAxis" className={styles.axis} transform={`translate(${padding}, 0)`} />
				<text
					className={styles.axisLabel}
					ref="xAxisLabel"
					transform={`translate(${width / 3}, ${height - padding / 3})`}
				/>
				<text
					className={styles.axisLabel}
					ref="yAxisLabel"
					transform={`translate(${padding / 2}, ${height - padding}) rotate(-90)`}
				/>
			</svg>
		);
	}
}

export default Scatterplot;
