import React from 'react';
import VxScatterplotWithSize from "./vxscatterplot";

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
        const scatterRow = metrics.map(metric => 
            <VxScatterplotWithSize
                key={metric}
                colorScale={colorScale}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                data={data}
                handleCircleOver={handleCircleOver}
                useGrid={useGrid}
                linkHighlighting={linkHighlighting}
                xVar={"GDP Per Capita"}
                yVar={metric}
            />
        );
        return (
            <React.Fragment>
                { metrics &&
                    scatterRow }
            </React.Fragment>
        )
        ;
    }
}

export default VxScatterRow;