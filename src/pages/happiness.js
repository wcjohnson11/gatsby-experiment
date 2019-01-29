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
            this.setState({ categories, categoryInfo, datsets: { 'happiness': worldHappinessData }})
        })
    }

    render() {
        const data = this.state.datasets.happiness
        return (
            <Layout>
                <h1>How we measure happiness</h1>
                <Scatterplot data={data}/>
            </Layout>
        )
    }
}

export default Happiness
