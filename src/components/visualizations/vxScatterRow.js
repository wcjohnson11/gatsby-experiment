import React from 'react';
import VxScatterplotWithSize from "../components/visualizations/vxscatterplot";

class VxScatterRow extends React.Component {
    render() {
        const {
            currentCountry,
            currentContinent,
            colorScale,
            data,
            handleCircleOver,
            useGrid,
            linkHighlighting,
            metrics
        } = this.props;
        return (
            <React.Fragment>
                { metrics && metrics.map(metric => {
                    return (
                        <VxScatterplotWithSize
                            data={data}
                            xVar={"GDP Per Capita"}
                            yVar={metric}
                            currentCountry={currentCountry}
                            currentContinent={currentContinent}
                            colorScale={colorScale}
                            handleCircleOver={handleCircleOver}
                            useGrid={useGrid}
                            linkHighlighting={linkHighlighting}
                        />
                    )
                })}
            </React.Fragment>
        )
        ;
    }
}