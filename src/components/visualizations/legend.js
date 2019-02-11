import React from 'react';
import { LegendItem, LegendLabel, LegendOrdinal } from '@vx/legend';
import style from './legend.module.css';

class Legend extends React.Component {
	render() {
		const { scale, legendClick } = this.props;
		const Labels = scale.domain().map((label, i) => {
			const size = 15;
			return (
				<LegendItem
					key={`legend-quantile-${i}`}
					margin="0 5px"
					alignItems="center"
					onClick={() => legendClick(label)}
				>
					<svg width={size} height={size}>
						<circle fill={label.value} r={size / 2} cx={size / 2} cy={size / 2} />
					</svg>
					<LegendLabel align={'left'}>
						{label.text}
					</LegendLabel>
				</LegendItem>
			)
		})
		console.log(Labels)
		return (
			<div className={`pure-u-1 ${style.legend}`}>
				<div className={style.title}>Continents</div>
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
											<svg width={size} height={size}>
												<circle fill={label.value} r={size / 2} cx={size / 2} cy={size / 2} />
											</svg>
											<LegendLabel align={'left'}>
												{label.text}
											</LegendLabel>
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
