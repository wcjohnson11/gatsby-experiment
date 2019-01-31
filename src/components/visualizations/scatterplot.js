import React from 'react';
import * as d3 from 'd3';
import styles from './scatterplot.module.css';

const width = 540;
const height = 400;
const padding = 50;

class Scatterplot extends React.Component {
	state = {
        circles: []
	};

	// Initialize Axes
	xAxis = d3.axisBottom().ticks(5);
	yAxis = d3.axisLeft();

	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, className, handleMouseOver } = nextProps;
		if (!data) return {};

		// Get min, max of x value
		// and map to X-position
		const xScale = d3.scaleLinear().domain([-1000, d3.max(data, (d) => d.x)]).range([ padding, width - padding ]);

		// 2. Initialize scale of Y Position
		// and map to Y-position
		const yScale = d3.scaleLinear().domain([ 0, d3.max(data, (d) => d.y) ]).range([ height - padding, padding ]);

		const circles = data.map((d) => {
			return {
                cx: xScale(d.x),
                x: d.x,
                cy: yScale(d.y),
                y: d.y,
				key: d.name
			};
		});

		const labels = {
			x: data.x,
			y: data.y
		};
		return { circles, xScale, yScale, labels, className, handleMouseOver };
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
    
    handleCircleMouseOver(event) {
        console.log(event.clientX, event.clientY, event.target)
    }

	render() {
        const { className, circles, handleMouseOver} = this.state
		return (
			<svg className={className} width={width} height={height}>
				{circles.map((d) => (
                    <circle
                        key={d.key}
                        className={styles.circle}
                        cx={d.cx}
                        x={d.x}
                        cy={d.cy}
                        y={d.y}
                        r={3}
                        onMouseOver={handleMouseOver}
                    />
				))}
				<g ref="xAxis" className={styles.axis} transform={`translate(0, ${height - padding})`} />
				<text
					className={styles.axisLabel}
					ref="xAxisLabel"
					transform={`translate(${(width / 2) - padding}, ${height - 10})`}
				/>
				<g ref="yAxis" className={styles.axis} transform={`translate(${padding}, 0)`} />
				<text
					className={styles.axisLabel}
					ref="yAxisLabel"
                    transform={`rotate(-90)`}
                    dy="1em"
                    x={0 - (height / 2)}
                    y={0}
                    textAnchor="middle"
				/>
			</svg>
		);
	}
}

export default Scatterplot;
