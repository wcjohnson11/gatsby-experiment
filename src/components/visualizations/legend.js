import React from 'react';
import { LegendItem, LegendLabel, LegendOrdinal } from '@vx/legend';
import style from './styles/legend.module.css';

class Legend extends React.Component {
	render() {
		const { scale, legendClick } = this.props;
		return (
			<div className={style.legend}>
				<div className={style.title}>
					<big>Continents</big>
					<br />
					<small><i>Click on a continent to filter the data</i></small>
				</div>
				<LegendOrdinal scale={scale} labelFormat={(label) => `${label.toUpperCase()}`}>
					{(labels, i) => {
						return (
							<div className={style.row}>
								{labels.map((label, i) => {
									const size = 15;
									return (
										<LegendItem
											key={`legend-quantile-${i}`}
											margin="0 5px"
											alignItems="center"
											onClick={() => legendClick(label)}
										>
											<svg className={style.legendItem} width={size} height={size}>
												<circle fill={label.value} r={size / 2} cx={size / 2} cy={size / 2} />
											</svg>
											<LegendLabel align={'left'}><p className={style.label}>{label.text}</p></LegendLabel>
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
