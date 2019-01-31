import React from 'react';
import { max } from 'd3';
import { localPoint } from '@vx/event';
import { TooltipWithBounds } from '@vx/tooltip';
import { Bar } from '@vx/shape';
import { AxisTop } from '@vx/axis';
import { scaleLinear } from '@vx/scale';
import { Group } from '@vx/group';
import { Motion, spring } from 'react-motion'
import styles from './scatterplot.module.css';

const margin = 25;

class VxScatterplot extends React.Component {
	state = {
		data: [],
		xScale: false,
		labels: []
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, className, parentWidth } = nextProps;
		if (!data) return {};

		// Get min, max of x value
		// and map to X-position
		const xScale = scaleLinear({
			domain: [ -500, max(data, (d) => d.x) ],
			range: [ margin, parentWidth - margin ]
		});

		// 2. Initialize scale of Y Position
		// and map to Y-position
		// const yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.y)]).range([height - padding, padding]);

		// const circles = data.map((d) => {
		//     return {
		//         cx: xScale(d.x),
		//         x: d.x,
		//         cy: yScale(d.y),
		//         y: d.y,
		//         key: d.name
		//     };
		// });

		const labels = {
			x: data.x,
			y: data.y
		};
		return { xScale, data, labels };
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
			parentHeight,
			data,
			className
		} = this.props;

		const { xScale } = this.state;
		const dataMax = max(data, (d) => d.x);
		const innerWidth = parentWidth - margin;
		const innerHeight = parentHeight - margin;
		const barHeight = Math.max(10, innerHeight / data.length);

		return (
			<React.Fragment>
				<svg width={parentWidth} height={parentHeight} className={className}>
					<Group top={margin + margin} left={margin}>
						{data.map((d, i) => {
							return (
								<Bar
									key={d.name}
									width={innerWidth * d.x / dataMax}
									left={margin}
									height={barHeight}
									x={0}
									y={i * barHeight}
									stroke="#fff"
									strokeWidth={2}
									fill="rgb(133, 90, 242"
									onMouseOver={(e) => this.handleMouseOverBar(e, d)}
									onMouseOut={() => hideTooltip()}
								/>
							);
						})}
					</Group>
					<Group top={margin + margin}>
						<AxisTop
							scale={xScale}
							axisClassName="axis-class"
							labelClassName="axis-label-class"
							label={data.x}
							tickClassName="tick-label-class"
							stroke="#333333"
							tickStroke="#333333"
						/>
					</Group>
				</svg>
					<div style={{
						position: 'absolute',
						top: margin,
						left: margin,
						width: dataMax,
						height: innerHeight,
						pointerEvents: 'none'
					}}>
						<Motion
							defaultStyle={{ left: tooltipLeft || 0, top: tooltipTop || 0, opacity: 0 }}
							style={{
								left: spring(tooltipLeft || 0),
								top: spring(tooltipTop || 0),
								opacity: spring(tooltipOpen ? 1 : 0)
							}}
						>
							{style => (
								<TooltipWithBounds
									key={Math.random()}
									style={{
										top: style.top,
										left: style.left,
										opacity: style.opacity,
										letterSpacing: 'normal'
									}}
								>
										{ tooltipData && (
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
							)}
						</Motion>
					</div>
			</React.Fragment>
		);
	}
}

export default VxScatterplot;
