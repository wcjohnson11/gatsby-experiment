import React from 'react';
import { max } from 'd3';
import { localPoint } from '@vx/event';
import { TooltipWithBounds } from '@vx/tooltip';
import { Bar } from '@vx/shape';
import { AxisLeft, AxisTop } from '@vx/axis';
import { scaleLinear, scaleBand } from '@vx/scale';
import { withParentSize } from '@vx/responsive';
import { Group } from '@vx/group';
import numTicksForWidth from '../../utils/numTicksForWidth';
import styles from './scatterplot.module.css';

const margin = 25;

class VxBarChart extends React.Component {
	state = {
		data: [],
		xScale: false,
		labels: []
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, parentWidth } = nextProps;
		const parentHeight = parentWidth
		if (!data) return {};

		const sortedData = data.sort((a, b) => {
			if (data.y === 'GINI index') {
				if (a.y > b.y) return -1;
				if (a.y < b.y) return 1;
			} else {
				if (a.y > b.y) return -1;
				if (a.y < b.y) return 1;
			}
		}).slice(0,10)

		
		const dataMax = max(data, (d) => d.x);
		const innerWidth = parentWidth - margin;
		const innerHeight = parentHeight - margin;
		const barHeight = Math.max(15, innerHeight / data.length);
		
		// Get min, max of x value
		// and map to X-position
		const xScale = scaleLinear({
			domain: [ 0, max(sortedData, (d) => d.y) ],
			range: [ margin, innerWidth ]
		});
		
		const yScale = scaleBand({
			domain: sortedData.reduce((result, d) => {
				result.push(d.name)
				return result
			}, []),
			rangeRound: [margin, innerHeight]
		});
		
		const labels = {
			x: data.x,
			y: data.y
		};
		return { xScale, yScale, data, labels, dataMax, innerWidth, innerHeight, barHeight, sortedData, parentHeight };
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

		const { barHeight, dataMax, innerWidth, innerHeight, xScale, yScale, sortedData, parentHeight } = this.state;
			
		return (
			<React.Fragment>
				<svg width={parentWidth} height={parentHeight}>
					<Group top={margin + margin} left={margin}>
						{sortedData.map((d, i) => {
							return (
								<Bar
									key={d.name}
									width={innerWidth * d.x / dataMax}
									left={margin}
									height={barHeight}
									x={margin}
									y={i * barHeight}
									stroke="#fff"
									strokeWidth={2}
									fill={zScale(d.continent)}
									onMouseOver={(e) => this.handleMouseOverBar(e, d)}
									onMouseOut={() => hideTooltip()}
								/>
							);
						})}
					</Group>
					<Group top={margin} left={margin}>
						<AxisTop
							scale={xScale}
							axisClassName="axis-class"
							labelClassName="axis-label-class"
							label={data.y}
							tickClassName="tick-label-class"
							top={margin}
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
								textAnchor: "end",
								dy: "0.33em"
							})}
						/>
					</Group>
				</svg>
				{ tooltipOpen && 
					<TooltipWithBounds
					key='tooltip'
					style={{
						top: tooltipTop,
						left: tooltipLeft,
						letterSpacing: 'normal'
					}}
					>
					{tooltipData && (
						<div>
							<p className={styles.tooltipP}>
								Country <strong>{tooltipData.name}</strong>
							</p>
							<p className={styles.tooltipP}>
								data.x <strong>{tooltipData.x}</strong>
							</p>
							<p className={styles.tooltipP}>
								data.y <strong>{tooltipData.y}</strong>
							</p>
						</div>
					)}
				</TooltipWithBounds>
				}
			</React.Fragment>
		);
	}
}

const VxBarChartWithSize = withParentSize(VxBarChart)

export default VxBarChartWithSize;
