import React from 'react';
import * as topojson from 'topojson-client';
import { scaleLinear } from '@vx/scale';
import { Mercator, Graticule } from '@vx/geo';
import { withParentSize } from '@vx/responsive';
import topology from '../../../static/world-geo-pop.json';

const bg = 'lightblue';

class VxMap extends React.Component {
	state = {};
	static getDerivedStateFromProps(nextProps, prevState) {
		const { data, parentWidth } = nextProps;
		if (!data) return {};

		const valueMap = {};
		data.forEach((country) => (valueMap[country.code] = country.y));

		topology.objects.units.geometries.forEach((geography, i) => {
			const continentCode = geography.properties.iso_a3;
			geography.properties.mapValue = valueMap[continentCode];
		});

		const world = topojson.feature(topology, topology.objects.units);
		const color = scaleLinear({
			domain: [
				Math.min(
					...world.features.reduce((result, f) => {
						if (f.properties.mapValue) result.push(f.properties.mapValue);
						return result;
					}, [])
				),
				Math.max(
					...world.features.reduce((result, f) => {
						if (f.properties.mapValue) result.push(f.properties.mapValue);
						return result;
					}, [])
				)
			],
			range: [ 'white', 'orange' ]
		});

		return { color: color, parentWidth: parentWidth, world: world };
	}

	render() {
		const { color, parentWidth, world } = this.state;
		const height = parentWidth / 1.8;
		const centerX = parentWidth / 2;
		const centerY = height / 2;
		const scale = parentWidth / 630 * 100;

		return (
			<svg width={parentWidth} height={height}>
				<rect x={0} y={0} width={parentWidth} height={height} fill={bg} rx={14} />
				<Mercator data={world.features} scale={scale} translate={[ centerX, centerY + 50 ]}>
					{(mercator) => {
						return (
							<g>
								<Graticule graticule={(g) => mercator.path(g)} stroke={'rgba(33,33,33,0.05)'} />
								{mercator.features.map((feature, i) => {
									const { feature: f } = feature;
									return (
										<path
											key={`map-feature-${i}`}
											d={mercator.path(f)}
											fill={color(f.properties.mapValue)}
											stroke={`black`}
											strokeWidth={0.5}
											onClick={(event) => {
												alert(`clicked: ${f.properties.name} (${f.id})`);
											}}
										/>
									);
								})}
							</g>
						);
					}}
				</Mercator>
			</svg>
		);
	}
}

const VxMapWithSize = withParentSize(VxMap);

export default VxMapWithSize;
