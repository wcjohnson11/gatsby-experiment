import React from "react"
import {tsv} from 'd3'
import Layout from "../components/layout"
import Scatterplot from "../components/visualizations/scatterplot"

const cleanNumbers = (string) => parseFloat(string.replace(/,/g, ''))

class Happiness extends React.Component {
    state = {
        categories: [],
        categoryInfo: [],
        datasets: {}
    }

    componentDidMount() {
        tsv('happy.tsv').then(data => {
            const categories = data.columns
            const categoryInfo = []
            for (var i = 0; i < 4; i++) {
                categoryInfo.push(data.shift())
            }
            // Set X and Y values for world happiness
            const worldHappinessData = data.reduce((result, d) => {
                if (d['world happiness report score'] !== '-' && d['GDP per capita (PPP)'] !== '-') {
                    result.push({
                        name: d.indicator,
                        y: cleanNumbers(d['world happiness report score']),
                        x: cleanNumbers(d['GDP per capita (PPP)'])
                    })
                }
                return result
            }, [])
            worldHappinessData.x = 'GDP per Capita'
            worldHappinessData.y = 'World Happiness Report Score'
            console.log(data)
            const GINIData = data.reduce((result, d) => {
                if (d['GINI index'] !== '-' && d['GDP per capita (PPP)'] !== '-') {
                    result.push({
                        name: d.indicator,
                        y: cleanNumbers(d['GINI index']),
                        x: cleanNumbers(d['GDP per capita (PPP)'])
                    })
                }
                return result
            }, [])
            GINIData.x = 'GDP per Capita'
            GINIData.y = 'GINI index'
            this.setState({ categories: categories,
                categoryInfo: categoryInfo,
                datasets: { 'happiness': worldHappinessData, 'gini': GINIData }
            })
        })
    }

    handleCircleMouseOver(event) {
        console.log(event.clientX, event.clientY, event.target)
    }

    render() {
        const { happiness, gini } = this.state.datasets
        return (
            <Layout>
                <h1>How we measure happiness</h1>
                <div className="pure-g">
                    <Scatterplot className="pure-u-12-24" data={happiness} handleMouseOver={this.handleCircleMouseOver}/>
                    <Scatterplot className="pure-u-12-24" data={gini} handleMouseOver={this.handleCircleMouseOver}/>
                </div>
                <div id="tooltip" className="hidden">
                    <p><strong id="tooltip-name">Important Label Heading</strong></p>
                    <p><span id="name">GDP per Capita</span><span id="gdp-value">100</span></p>
                    <p><span id="name">WHR Score</span><span id="whr-value">100</span></p>
                </div>
            </Layout>
        )
    }
}

export default Happiness
