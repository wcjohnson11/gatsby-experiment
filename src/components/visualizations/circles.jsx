import React from 'react';
import { withScreenSize } from '@vx/responsive';
import { select, drag, event, range } from 'd3';
import chroma from 'chroma-js';
import style from '../../pages/styles/index.module.css';

const height = 500;

class Circles extends React.Component {
	dragStarted(d) {
		select(this).raise().classed('active', true);
	}

	dragging(d) {
		select(this).attr('cx', (d.x = event.x)).attr('cy', (d.y = event.y));
	}
	dragEnded(d) {
		select(this).raise().classed('active', false);
	}

	componentDidMount() {
		const { screenWidth } = this.props;

		const svg = select('svg');

		const defs = svg.append('defs');

		const radialGradient = defs
			.append('radialGradient')
			.attr('id', 'radial-gradient')
			.attr('cx', '50%')
			.attr('cy', '50%')
			.attr('r', '50%');

		//Add colors to make the gradient appear like a Sun
		radialGradient.append('stop').attr('offset', '0%').attr('stop-color', chroma('#02283D').brighten(1));
		radialGradient.append('stop').attr('offset', '50%').attr('stop-color', '#02283D');
		radialGradient.append('stop').attr('offset', '90%').attr('stop-color', chroma('#02283D').darken(1));
		radialGradient.append('stop').attr('offset', '100%').attr('stop-color', chroma('#02283D').darken(1.2));

		const circles = range(2).map((i) => {
			return {
				x  : (i + 1) * screenWidth / 6,
				y  : 250,
				id : i + 1,
				r  : 75
			};
		});

		// Play with radians
		// start large so it takes up svg viewBox
		// - shrink to smaller than front circle & back agin
		svg
			.selectAll('circle')
			.data(circles)
			.enter()
			.append('circle')
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.attr('r', (d) => d.r)
			.style('fill', 'url(#radial-gradient)')
			.classed(`${style.circle}`, true)
			.call(drag().on('start', this.dragStarted).on('drag', this.dragging).on('end', this.dragEnded));

		svg
			.append('circle')
			.attr('cx', screenWidth / 2)
			.attr('cy', height / 2.5)
			.attr('r', 120)
			.style('fill', 'url(#radial-gradient)')
            .classed(`${style.circle}`, true);
            
		svg.append('text').attr('x', 250).attr('y', 200).attr('dy', '.35em').text(() => 'Welcome :)');
	}
	render() {
		const { screenWidth } = this.props;
		return (
			<section className={style.svg}>
				<svg width={screenWidth} height={height} />
			</section>
		);
	}
}

const CirclesWithScreenSize = withScreenSize(Circles);
export default CirclesWithScreenSize;
