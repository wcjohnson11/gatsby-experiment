import React from 'react';
import { max } from 'd3';
import { localPoint } from '@vx/event';
import { TooltipWithBounds } from '@vx/tooltip';
import { Bar } from '@vx/shape';
import { AxisLeft, AxisTop } from '@vx/axis';
import { scaleLinear, scaleBand } from '@vx/scale';
import { Group } from '@vx/group';
import { Motion, spring } from 'react-motion';
import styles from './scatterplot.module.css';

const margin = 25;
const parentHeight = 1200;

class VxBarChart extends React.Component {
	state = {
		data: [],
		xScale: false,
		labels: []
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, parentWidth } = nextProps;
		if (!data) return {};

		// Get min, max of x value
		// and map to X-position
		const xScale = scaleLinear({
			domain: [ -500, max(data, (d) => d.x) ],
			range: [ margin, parentWidth - margin ]
		});

		const yScale = scaleBand({
			domain: data.reduce((result, d) => {
				result.push(d.name)
				return result
			}, []),
			rangeRound: [margin, parentHeight + margin],
			padding: 0.2
		});

		const dataMax = max(data, (d) => d.x);
		const innerWidth = parentWidth - margin;
		const innerHeight = parentHeight - margin;
		const barHeight = Math.max(15, innerHeight / data.length);

		const labels = {
			x: data.x,
			y: data.y
		};
		return { xScale, yScale, data, labels, dataMax, innerWidth, innerHeight, barHeight };
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

		const { barHeight, dataMax, innerWidth, innerHeight, xScale, yScale } = this.state;
			
		return (
			<React.Fragment>
				<svg width={parentWidth} height={parentHeight}>
					<Group top={margin + margin} left={margin}>
						{data.map((d, i) => {
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
							label={data.x}
							tickClassName="tick-label-class"
							top={margin}
							stroke="#333333"
							tickStroke="#333333"
						/>
						<AxisLeft
							scale={yScale}
							left={margin}
							top={0 - margin - margin}
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

export default VxBarChart;
