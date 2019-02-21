import React from "react";
import { withParentSize } from "@vx/responsive";

class MultiLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      lines: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, parentWidth } = nextProps;
    if (!data) return {};

    return { height: parentWidth, width: parentWidth };
  }

  render() {
    const { height, width } = this.state;
    return <svg height={height} width={width} />;
  }
}

const MultiLineWithSize = withParentSize(MultiLine);

export default MultiLineWithSize;
