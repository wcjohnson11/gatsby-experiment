import React from 'react';
import { max, median } from 'd3';
import { localPoint } from '@vx/event';
import { TooltipWithBounds, withTooltip } from '@vx/tooltip';
import { Bar, Line } from '@vx/shape';
import { AxisLeft, AxisTop } from '@vx/axis';
import { scaleLinear, scaleBand } from '@vx/scale';
import { withParentSize } from '@vx/responsive';
import { Group } from '@vx/group';
import numTicksForWidth from '../../utils/numTicksForWidth';
import style from './styles/scatterplot.module.css';

// const margin = 25;

class VxBarChart extends React.Component {
	state = {
		data: [],
		xScale: false,
		labels: []
	};
	
	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, parentWidth, currentContinent } = nextProps;
		if (!data) return {};
		const sortedData = data
		.sort((a, b) => {
			if (a.y > b.y) return 1;
			if (a.y < b.y) return -1;
			return 0;
		})
		// .slice(0, 30);
		const dataMedian = median(data, (d) => d.y);
		const dataMax = max(data, (d) => d.y);
		
		const labels = {
			x: data.x,
			y: data.y
		};
		const margin = parentWidth / 18
		const innerWidth = parentWidth - margin;
		const parentHeight = sortedData.length * 20;
		const innerHeight = parentHeight - margin;

		
		
		
		// Get min, max of x value
		// and map to X-position
		const xScale = scaleLinear({
			domain: [ 0, max(data, (d) => d.y) ],
			range: [ margin, innerWidth ]
		});
		if (currentContinent) {
			console.log('hi')
			const filteredData = data.filter((d) => d.continent === currentContinent)
			const yScale = scaleBand({
				domain: filteredData.reduce((result, d) => {
					result.push(d.name);
					return result;
				}, []),
				rangeRound: [0, innerHeight]
			});

			const barHeight = yScale.bandwidth();
			const sortedData = filteredData
			return { xScale, yScale, data, labels, margin, dataMax, dataMedian, innerWidth, innerHeight, barHeight, sortedData, parentHeight };
		}
		
		const yScale = scaleBand({
			domain: sortedData.reduce((result, d) => {
				result.push(d.name);
				return result;
			}, []),
			rangeRound: [ 0, innerHeight ]
		});
		
		const barHeight = yScale.bandwidth();
		
		return { xScale, yScale, data, labels, margin, dataMax, dataMedian, innerWidth, innerHeight, barHeight, sortedData, parentHeight };
	}

	handleMouseOverBar(event, datum) {
		const coords = localPoint(event.target.ownerSVGElement, event);
		this.props.showTooltip({
			tooltipLeft: coords.x,
			tooltipTop: coords.y,
			tooltipData: {
				name: datum.name,
				x: datum.x,
				y: datum.y
			}
		});
	}

	render() {
		const {
			tooltipData,
			tooltipLeft,
			tooltipTop,
			tooltipOpen,
			hideTooltip,
			parentWidth,
			data,
			zScale
		} = this.props;

		const {
			barHeight,
			dataMax,
			dataMedian,
			innerWidth,
			innerHeight,
			xScale,
			yScale,
			sortedData,
			parentHeight,
			labels,
			margin
		} = this.state;

		return (
			<React.Fragment>
				<svg width={parentWidth} height={parentHeight} style={{display: 'block', margin: 'auto', overflowY: 'scroll'}}>
					<Group top={margin * .5} left={margin + margin + margin}>
						{sortedData.map((d, i) => {
							return (
								<Bar
									key={d.name}
									width={innerWidth * d.y / dataMax}
									left={margin}
									height={barHeight}
									x={margin}
									y={yScale(d.name)}
									stroke="#fff"
									strokeWidth={2}
									fill={zScale(d.continent)}
									onMouseOver={(e) => this.handleMouseOverBar(e, d)}
									onMouseOut={() => hideTooltip()}
								/>
							);
						})}
						<Line
							fill="black"
							from={{x: xScale(dataMedian), y: margin}}
							to={{x: xScale(dataMedian), y: innerHeight - margin}}
							strokeWidth={4}
							label="median"
							strokeDasharray="4,6"
						/>
						<AxisTop
							scale={xScale}
							axisClassName="axis-class"
							labelClassName="axis-label-class"
							label={data.y}
							tickClassName="tick-label-class"
							top={margin * 1.2}
							stroke="#333333"
							tickStroke="#333333"
							numTicks={numTicksForWidth(innerWidth)}
						/>
						<AxisLeft
							scale={yScale}
							left={margin}
							top={0}
							hideAxisLine={true}
							axisClassName="axis-class"
							labelClassName="axis-label-class"
							tickClassName="tick-label-class"
							stroke="#333333"
							tickStroke="#333333"
							tickLabelProps={(value, index) => ({
								letterSpacing: 'normal',
								fontSize: 11,
								textAnchor: 'end',
								dy: '0.33em'
							})}
						/>
					</Group>
				</svg>
				{tooltipOpen && (
					<TooltipWithBounds
						key="tooltip"
						top={tooltipTop}
						left={tooltipLeft}
						style={{
							letterSpacing: 'normal'
						}}
					>
						{tooltipData && (
							<div>
								<p className={style.tooltipP}>
									Country <strong>{tooltipData.name}</strong>
								</p>
								<p className={style.tooltipP}>
									{labels.x} <strong>{tooltipData.x}</strong>
								</p>
								<p className={style.tooltipP}>
									{labels.y} <strong>{tooltipData.y}</strong>
								</p>
							</div>
						)}
					</TooltipWithBounds>
				)}
			</React.Fragment>
		);
	}
}
const VxBarChartWithTooltip = withTooltip(VxBarChart);
const VxBarChartWithSize = withParentSize(VxBarChartWithTooltip);

export default VxBarChartWithSize;
