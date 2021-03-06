import React from 'react';
import VxScatterplotWithSize from "./vxscatterplot";
import style from "./styles/vxscatterrow.module.css";;

class VxScatterRow extends React.Component {
    render() {
        const {
            currentCircleY,
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
                currentCircleY={currentCircleY}
                colorScale={colorScale}
                currentCountry={currentCountry}
                currentContinent={currentContinent}
                data={data.filter(country => country.Population > 5000000)}
                handleCircleOver={handleCircleOver}
                useGrid={useGrid}
                linkHighlighting={linkHighlighting}
                xVar={"GDP Per Capita"}
                yVar={metric}
            />
        );
        return (
            <div className={style.row}>
                { metrics &&
                    scatterRow }
            </div>
        )
        ;
    }
}

export default VxScatterRow;