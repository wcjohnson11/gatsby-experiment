import React from 'react';
import { LegendItem, LegendLabel, LegendOrdinal } from '@vx/legend';
import Tooltip from './tooltip';
import chroma from "chroma-js";
import style from './styles/legend.module.css';

class Legend extends React.Component {
	render() {
		const { currentContinent, currentCountry, data, scale, legendClick } = this.props;
		const currentVars = currentCountry && data.find(country => country.name === currentCountry)
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
								<div className={style.tooltip}>
									<div>
										<big>{currentCountry || <i>Hover over a country to see it's info across all indices</i>}</big>
									</div>
									<div className={currentCountry ? `${style.row}` : `${style.row} ${style.hidden}`}>
										<p><b>HPI: </b>{currentVars["Happy Planet Index"] || "N/A"}</p>
										<p><b>GINI: </b>{currentVars["GINI Index"] || "N/A"}</p>
										<p><b>HDI: </b>{currentVars["Human Development Index"] || "N/A"}</p>
										<p><b>SEDI: </b>{currentVars["Sustainable Economic Development Index"] || "N/A"}</p>
										<p><b>WHRS: </b>{currentVars["World Happiness Report Score"] || "N/A"}</p>
									</div>
								</div>
							</div>
						);
					}}
				</LegendOrdinal>
			</div>
		);
	}
}

export default Legend;
