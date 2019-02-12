import React from 'react';
import * as d3 from 'd3';
import {withParentSize} from '@vx/responsive';

const width = 650;
const height = 1500;
const margin = { top: 20, right: 105, bottom: 20, left: 125 };

class BarChart extends React.Component {
	state = {
		bars: []
	};

	xAxis = d3.axisTop();
	yAxis = d3.axisLeft();

	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, zScale, parentWidth } = nextProps;
        if (!data) return {};
        
		const sortedData = data.sort((a, b) => {
			if (a.y < b.y) return 1;
			if (a.y > b.y) return -1;
			return 0;
		});

		// Map the xScale to [0,Y Value max]
        const dataYMax = d3.max(data, (d) => d.y);
		const xScale = d3.scaleLinear().domain([ 0, dataYMax ]).range([ margin.left, parentWidth - margin.right ]);

		// Get array of names in dataset
		const dataNames = sortedData.reduce((result, d) => {
			result.push(d.name);
			return result;
		}, []);

		// Map Names to Y-position
		const yScale = d3
			.scaleBand()
			.domain(dataNames)
			.range([ height - margin.bottom, margin.top ])
			.paddingInner([ 0.4 ])
			.paddingOuter([ 0.2 ]);

        // Create bars component
        // Not sure why width needs to have marginRight subtracted from it
		const bars = sortedData.map((d) => {
			return {
				x: `${margin.left}`,
				y: yScale(d.name),
				height: yScale.bandwidth(),
				width: xScale(d.y) - margin.right,
				fill: zScale(d.continent),
				name: d.name
			};
		});

		return { bars, xScale, yScale, parentWidth };
	}

	componentDidUpdate() {
		// Set xAxis to use xScale
        this.xAxis.scale(this.state.xScale);
        // Call xAxis on xAxis group element to draw it
		d3.select(this.refs.xAxis).call(this.xAxis);
		// Set yAxis to use yScale
        this.yAxis.scale(this.state.yScale);
        // Call yAxis on yAxis group element to draw it
        d3.select(this.refs.yAxis).call(this.yAxis);
        
        // Set up transition for bars
        d3.select(this.refs.bars)
            .selectAll('rect')
            .data(this.state.bars)
            .transition()
            .attr('y', d => d.y)
            .attr('height', d => d.height)
            .attr('width', d => d.width)
            .attr('fill', d => d.fill)
	}

	render() {
        const {parentWidth} = this.state;
		return (
			<svg width={parentWidth} height={height}>
                <g ref="bars">
                    {this.state.bars.map((d) => (
                        <rect key={d.name} x={d.x} />
                    ))}
                </g>
				<g ref="xAxis" transform={`translate(0, ${margin.top})`} />
				<g ref="yAxis" transform={`translate(${margin.left}, 0)`} />
			</svg>
		);
	}
}

const BarChartWithSize = withParentSize(BarChart);

export default BarChartWithSize;
