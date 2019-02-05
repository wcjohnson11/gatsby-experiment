import React from 'react';
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps';
import { localPoint } from '@vx/event';
import { TooltipWithBounds } from '@vx/tooltip';
import { withTooltip } from '@vx/tooltip';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3';
import style from './chloroplethMap.module.css'

class ChloroplethMap extends React.Component {
	handleMouseOver(event, datum) {
		const coords = localPoint(event.target.ownerSVGElement, event);
		this.props.showTooltip({
			tooltipLeft: coords.x,
			tooltipTop: coords.y,
			tooltipData: {
				name: datum.name,
				x: datum.mapValue
			}
		});
	}

	handleMouseOut() {
		// TODO: create animation w opacity
		setTimeout(() => this.props.hideTooltip(), 300);
	}

	render() {
		const { data, tooltipData, tooltipLeft, tooltipTop, tooltipOpen, mapValue } = this.props;
		const colorScale = scaleLinear().domain([ 3, max(data, (d) => d.y) ]).range([ 'white', 'orange' ]);

		const valueMap = {};
		data.forEach((country) => (valueMap[country.code] = country.y));
		return (
			<div className={style.wrapper}>
				<ComposableMap
					projectionConfig={{
						scale: 205,
						rotation: [ -11, 0, 0 ]
					}}
					width={980}
					height={551}
					className={style['composable-map']}
				>
					<ZoomableGroup center={[ 0, 20 ]}>
						<Geographies geography={'world-geo-pop.json'}>
							{(geographies, projection) =>
								geographies.map((geography, i) => {
									// Add variable value to geography object for colorPop
									const continentCode = geography.properties.iso_a3;
									geography.properties.mapValue = valueMap[continentCode];
									return (
										<Geography
											key={i}
											className={style.geography}
											geography={geography}
											projection={projection}
											onMouseOver={(e) => this.handleMouseOver(e, geography.properties)}
											onMouseOut={() => this.handleMouseOut()}
											onClick={this.handleClick}
											style={{
												default: {
													fill: colorScale(geography.properties.mapValue),
													stroke: '#607D8B'
												},
												hover: {
													fill: colorScale(geography.properties.mapValue)
												}
											}}
										/>
									);
								})}
						</Geographies>
					</ZoomableGroup>
				</ComposableMap>
				{tooltipOpen && (
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
							<div className={style.tooltip}>
								<p>
									<strong>Country</strong> {tooltipData.name}
								</p>
								<p>
									<strong>{mapValue}</strong>{' '}
									{tooltipData.x > 0 ? tooltipData.x : 'No Score avaialable'}
								</p>
							</div>
						)}
					</TooltipWithBounds>
				)}
			</div>
		);
	}
}

const ChloroplethMapWithTooltip = withTooltip(ChloroplethMap);
export default ChloroplethMapWithTooltip;