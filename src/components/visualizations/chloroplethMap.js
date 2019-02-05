import React from 'react';
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps';
import { localPoint } from '@vx/event';
import { TooltipWithBounds } from '@vx/tooltip';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3';

const wrapperStyles = {
	width: '100%',
	maxWidth: 980,
	margin: '0 auto'
};

class BasicMap extends React.Component {
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
			<div style={wrapperStyles}>
				<ComposableMap
					projectionConfig={{
						scale: 205,
						rotation: [ -11, 0, 0 ]
					}}
					width={980}
					height={551}
					style={{
						width: '100%',
						height: 'auto'
					}}
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
											geography={geography}
											projection={projection}
											onMouseOver={(e) => this.handleMouseOver(e, geography.properties)}
											onMouseOut={() => this.handleMouseOut()}
											onClick={this.handleClick}
											style={{
												default: {
													fill: colorScale(geography.properties.mapValue),
													stroke: '#607D8B',
													strokeWidth: 0.75,
													outline: 'none'
												},
												hover: {
													fill: '#263238',
													stroke: '#607D8B',
													strokeWidth: 0.75,
													outline: 'none'
												},
												pressed: {
													fill: '#263238',
													stroke: '#607D8B',
													strokeWidth: 0.75,
													outline: 'none'
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
							<div>
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

export default BasicMap;
