import React from "react"
import * as d3 from 'd3'
import styles from "./scatterplot.module.css"

const width = 400;
const height = 400;
const margin = {top: 20, right: 20, bottom: 20, left: 20}

class Scatterplot extends React.Component {
    state = {
        circles: []
    }

    // Initialize Axes
    xAxis = d3.axisBottom()
    yAxis = d3.axisLeft()

    static getDerivedStateFromProps(nextProps, prevState) {
        const { data } = nextProps
        if (!data) return {}

        // Get min, max of x value
        // and map to X-position
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            .range([margin.left, width - margin.right])

        // 2. Initialize scale of Y Position
        // and map to Y-position
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .range([height - margin.bottom, margin.top])

        const circles = data.map(d => {
            return {
                cx: xScale(d.x),
                cy: yScale(d.y),
                key: d.name
            }
        })
        return { circles, xScale, yScale }
    }

    componentDidUpdate() {
        this.xAxis.scale(this.state.xScale)
        d3.select(this.refs.xAxis).call(this.xAxis)
        this.yAxis.scale(this.state.yScale)
        d3.select(this.refs.yAxis).call(this.yAxis)
    }

    render() {
        return (
            <svg
            width={width}
            height={height}>
                {this.state.circles.map(d => (
                    <circle
                      key={d.key}
                      fill={'white'}
                      stroke={'black'}
                      strokeWidth={2}
                      cx={d.cx}
                      cy={d.cy}
                      r={3}
                    />
                ))}
                <g
                    ref="xAxis"
                    className={styles.axis}
                    transform={`translate(0, ${height - margin.bottom})`}
                />
                <g
                    ref="yAxis"
                    className={styles.axis}
                    transform={`translate(${margin.left/1.3}, 0)`}
                />
            </svg>
        )
    }
}


export default Scatterplot