import React from 'react';
import { Group } from '@vx/group';
import { Circle } from '@vx/shape';
import { scaleLinear } from '@vx/scale';
import { LegendOrdinal } from '@vx/legend';
import { localPoint } from '@vx/event';
import { TooltipWithBounds } from '@vx/tooltip';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { Motion, spring } from 'react-motion';
import { max } from 'd3';
import formatMoney from '../../utils/formatMoney';
import style from './scatterplot.module.css';

const margin = 30;
const parentHeight = 500;

class VxScatterplot extends React.Component {
	state = {
		cicles: [],
		labels: {},
		xScale: false,
        yScale: false
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, parentWidth, zScale } = nextProps;
		if (!data) return {};

		const xScale = scaleLinear({
			domain: [ 0, max(data, (d) => d.x) ],
			range: [ margin, parentWidth - margin - margin ]
		});

		const yScale = scaleLinear({
			domain: [ 0, max(data, (d) => d.y) ],
			range: [ parentHeight - margin, margin ]
        });

		const labels = {
			x: data.x,
			y: data.y
		};

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
            yScale
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
        setTimeout(() => this.props.hideTooltip(), 300)
    }

	render() {
		const { parentWidth, tooltipData, tooltipLeft, tooltipTop, tooltipOpen, zScale} = this.props;

		const { xScale, yScale, labels, circles } = this.state;

		return (
			<React.Fragment>
				<svg width={parentWidth} height={parentHeight + margin + margin}>
                    { circles &&
                        <Group top={margin} left={margin}>
                            <AxisLeft
                                scale={yScale}
                                axisClassName="axis-class"
                                labelClassName="axis-label-class"
                                label={labels.y}
                                left={margin}
                                tickClassName="tick-label-class"
                                stroke="#333333"
                                tickStroke="#333333"
                                />
                            <AxisBottom
                                scale={xScale}
                                axisClassName="axis-class"
                                labelClassName="axis-label-class"
                                label={labels.x}
                                top={parentHeight - margin}
                                tickClassName="tick-label-class"
                                stroke="#333333"
                                tickStroke="#333333"
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
                                    y={d.x}
                                    onMouseOver={(e) => this.handleMouseOver(e, d)}
                                    onMouseOut={() => this.handleMouseOut()}
                                    />
                                    );
                                })}
                        </Group>
                    }
				</svg>
                <div
                style={{
                    position: "absolute",
                    top: margin / 2 - 10,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    fontSize: "14px"
                }}
                >
                    <LegendOrdinal
                        scale={zScale}
                        direction="row"
                        labelMargin="0 15px 0 0"
                        />
                </div>
                { tooltipOpen &&
                    <TooltipWithBounds
                        key={Math.random()}
                        style={{
                            top: tooltipTop,
                            left: tooltipLeft,
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
                }
			</React.Fragment>
		);
	}
}

export default VxScatterplot;
