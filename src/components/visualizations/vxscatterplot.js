import React from 'react';
import { Group } from '@vx/group';
import { Grid } from '@vx/grid';
import { Circle } from '@vx/shape';
import { scaleLinear } from '@vx/scale';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { localPoint } from '@vx/event';
import { TooltipWithBounds } from '@vx/tooltip';
import { withTooltip } from '@vx/tooltip';
import { withParentSize } from '@vx/responsive';
import { max } from 'd3';
import formatMoney from '../../utils/formatMoney';
import numTicksForHeight from '../../utils/numTicksForHeight';
import numTicksForWidth from '../../utils/numTicksForWidth';
import style from './scatterplot.module.css';

const margin = 30;

class VxScatterplot extends React.Component {
	state = {
		cicles: [],
		labels: {},
		xScale: false,
		yScale: false,
		currentContinent: false
	};

	static getDerivedStateFromProps(nextProps, prevState) {
        const { data, parentWidth, zScale, currentContinent } = nextProps;
        const parentHeight = parentWidth
		if (!data) return {};

		const labels = {
			x: data.x,
			y: data.y
		};

		const xScale = scaleLinear({
			domain: [0, max(data, (d) => d.x)],
			range: [margin, parentWidth - margin - margin]
		});

		const yScale = scaleLinear({
			domain: [0, max(data, (d) => d.y)],
			range: [parentHeight - margin, margin]
		});

		if (currentContinent) {
			const filteredData = data.filter(d => currentContinent === d.continent)
			const circles = filteredData.map((d) => {
				return {
					cx: xScale(d.x),
					cy: yScale(d.y),
					x: `$${formatMoney(d.x, 2)}`,
					y: d.y,
					color: zScale(d.continent),
					r: 3,
					key: d.name
				};
			});
			return {
				labels,
				circles,
				xScale,
				yScale,
				parentHeight
			};
		}

		const circles = data.map((d) => {
			return {
				cx: xScale(d.x),
				cy: yScale(d.y),
				x: `$${formatMoney(d.x, 2)}`,
				y: d.y,
				color: zScale(d.continent),
				r: 3,
				key: d.name
			};
		});

		return {
			labels,
			circles,
			xScale,
            yScale,
            parentHeight
		};
	}

	handleMouseOver(event, datum) {
		const coords = localPoint(event.target.ownerSVGElement, event);
		this.props.showTooltip({
			tooltipLeft: coords.x,
			tooltipTop: coords.y,
			tooltipData: {
				name: datum.key,
				x: datum.x,
				y: datum.y
			}
		});
	}

	handleMouseOut() {
		// TODO: create animation w opacity
		setTimeout(() => this.props.hideTooltip(), 300);
	}

	render() {
		const { parentWidth, tooltipData, tooltipLeft, tooltipTop, tooltipOpen, useGrid } = this.props;

		const { xScale, yScale, labels, circles, parentHeight } = this.state;

		return (
			<React.Fragment>
				<svg width={parentWidth} height={parentHeight + margin + margin}>
					{circles && (
						<Group top={margin} left={margin}>
                            { useGrid &&
                                <Grid
                                    top={0}
                                    left={0}
                                    className={style.grid}
                                    xScale={xScale}
                                    yScale={yScale}
                                    stroke="rgba(142, 32, 95, 0.3)"
                                    width={parentWidth - (margin * 2)}
                                    height={parentHeight - (margin)}
                                    numTicksRows={numTicksForHeight(parentHeight)}
                                    numTicksColumns={numTicksForWidth(parentWidth)}
                                />
                            }
							<AxisLeft
								scale={yScale}
								axisClassName={style.axis}
								labelClassName={style['axis-label']}
								label={labels.y}
								left={margin}
								tickClassName={style['tick-label']}
								stroke="#333333"
                                tickStroke="#333333"
                                numTicks={numTicksForHeight(parentHeight)}
							/>
							<AxisBottom
								scale={xScale}
								axisClassName={style.axis}
								labelClassName={style['axis-label']}
								label={labels.x}
								top={parentHeight - margin}
                                tickClassName={style['tick-label']}
								stroke="#333333"
                                tickStroke="#333333"
                                numTicks={numTicksForWidth(parentWidth)}
							/>
							{circles.map((d, i) => {
								return (
									<Circle
										key={d.key}
										className={style.circle}
										fill={d.color}
										cx={d.cx}
										cy={d.cy}
										r={d.r}
										x={d.x}
										y={d.y}
										onMouseOver={(e) => this.handleMouseOver(e, d)}
										onMouseOut={() => this.handleMouseOut()}
									/>
								);
							})}
						</Group>
					)}
				</svg>
				{tooltipOpen && (
					<TooltipWithBounds
						key={Math.random()}
						top={tooltipTop}
						left={tooltipLeft}
						style={{
							opacity: 1,
							letterSpacing: 'normal'
						}}
					>
						{tooltipData && (
							<div>
								<p className={style.tooltipP}>
									<strong>Country</strong> {tooltipData.name}
								</p>
								<p className={style.tooltipP}>
									<strong>{labels.x}</strong> {tooltipData.x}
								</p>
								<p className={style.tooltipP}>
									<strong>{labels.y}</strong> {tooltipData.y}
								</p>
							</div>
						)}
					</TooltipWithBounds>
				)}
			</React.Fragment>
		);
	}
}

const VxScatterplotWithTooltip = withTooltip(VxScatterplot);
const VxScatterplotWithSize = withParentSize(VxScatterplotWithTooltip);

export default VxScatterplotWithSize;
