import React from "react";
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography
} from "react-simple-maps";
import { localPoint } from "@vx/event";
import { TooltipWithBounds } from "@vx/tooltip";
import BoundedToolTip from "./boundedTooltip";
import { withTooltip } from "@vx/tooltip";
import { withParentSize } from "@vx/responsive";
import { scaleLinear } from "d3-scale";
import { max } from "d3";
import style from "./chloroplethMap.module.css";

class ChloroplethMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parentWidth: props.parentWidth
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const { parentWidth } = nextProps;

    return { parentWidth: parentWidth };
  }
  handleMouseOver(event, datum) {
    const coords = localPoint(event.target.ownerSVGElement, event);
    this.props.showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: {
        name: datum.name,
        x: datum.mapValue
      }
    });
  }

  handleMouseOut() {
    // TODO: create animation w opacity
    this.props.hideTooltip();
  }

  render() {
    const {
      data,
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      mapValue
    } = this.props;
    const { parentWidth } = this.state;
    const colorScale = scaleLinear()
      .domain([3, max(data, d => d.y)])
      .range(["white", "orange"]);

    const valueMap = {};
    data.forEach(country => (valueMap[country.code] = country.y));
    return (
      <div className={style.wrapper}>
        <div className={style.content}>
          <ComposableMap
            projectionConfig={{
              scale: parentWidth / 6
            }}
            width={parentWidth}
            height={parentWidth / 2}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup disablePanning zoom={1.1}>
              <Geographies geography={"world-geo-pop.json"}>
                {(geographies, projection) =>
                  geographies.map((geography, i) => {
                    // Add variable value to geography object for colorPop
                    const continentCode = geography.properties.iso_a3;
                    geography.properties.mapValue = valueMap[continentCode];
                    // Uncomment if you don't want to show antarctica bc no data for it
                    // if (geography.properties.name !== 'Antarctica') {
                    return (
                      <Geography
                        key={i}
                        className={style.geography}
                        geography={geography}
                        projection={projection}
                        onMouseOver={e =>
                          this.handleMouseOver(e, geography.properties)
                        }
                        onMouseOut={() => this.handleMouseOut()}
                        onClick={this.handleClick}
                        style={{
                          default: {
                            fill: colorScale(geography.properties.mapValue),
                            stroke: "#607D8B"
                          },
                          hover: {
                            fill: colorScale(geography.properties.mapValue)
                          }
                        }}
                      />
                    );
                    // }
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          {tooltipOpen && (
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop}
              left={tooltipLeft}
              style={{
                letterSpacing: "normal"
              }}
            >
              {tooltipData && (
                <div className={style.tooltip}>
                  <p>
                    Country <span>{tooltipData.name}</span>
                  </p>
                  <p>
                    {mapValue}
                    <span>
                      {tooltipData.x > 0
                        ? tooltipData.x
                        : "No Score avaialable"}
                    </span>
                  </p>
                </div>
              )}
            </TooltipWithBounds>
          )}
        </div>
      </div>
    );
  }
}

const ChloroplethMapWithTooltip = withTooltip(ChloroplethMap);
const ChloroplethMapWithSize = withParentSize(ChloroplethMapWithTooltip);
export default ChloroplethMapWithSize;
