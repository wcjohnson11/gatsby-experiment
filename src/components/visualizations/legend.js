import React from 'react';
import { LegendItem, LegendLabel, LegendOrdinal } from '@vx/legend';
import chroma from "chroma-js";
import style from './styles/legend.module.css';

class Legend extends React.Component {
	render() {
		const { currentContinent, scale, legendClick } = this.props;
		return (
			<div className={style.legend}>
				<div className={style.title}>
					<big>Continents Legend</big>
					<br />
					<small><i>Click on a continent name to filter the data</i></small>
				</div>
				<LegendOrdinal scale={scale} labelFormat={(label) => `${label.toUpperCase()}`}>
					{(labels, i) => {
						return (
							<div className={style.row}>
								{labels.map((label, i) => {
									const size = 15;
									const isCurrentContinent = currentContinent === label.datum;
									const textClass = isCurrentContinent ? `${style.label} ${style.active}` : `${style.label}`;
									const fill = isCurrentContinent ? chroma(label.value).darken(2) : label.value;
									return (
										<LegendItem
											key={`legend-quantile-${i}`}
											margin="0 5px"
											alignItems="center"
											onClick={() => legendClick(label)}
										>
											<div className={style.legendItem}>
												<svg width={size} height={size}>
													<circle fill={fill} r={size / 2} cx={size / 2} cy={size / 2} />
												</svg>
												<LegendLabel align={'left'}><p className={textClass}>{label.text}</p></LegendLabel>

											</div>
										</LegendItem>
									);
								})}
							</div>
						);
					}}
				</LegendOrdinal>
			</div>
		);
	}
}

export default Legend;
