import React from "react";
import Layout from "../components/layout";
import { select } from "d3";
import style from "./styles/index.module.css";
class index extends React.Component {
  componentDidMount() {
    select("svg")
      .append("circle")
      .attr("cx", 150)
      .attr("cy", 150)
      .attr("r", 120)
      .style("fill", "#592037")
      .classed(`${style.circle}`, true);

    select("svg")
      .append("text")
      .attr("x", 115)
      .attr("y", 150)
      .attr("dy", ".35em")
      .text(() => "Welcome :)");

    // Orange FF530D
    // Red E82C0C
    // Purple 33004B
    // Blue 03B0F0
    // Pink FF0DFF
  }
  render() {
    return (
      <Layout>
        <div className={style.svg}>
          <svg width={300} height={300} />
        </div>
        <div className={style.title}>
          <h1>Will Johnson</h1>
          <p>Analytics, Art, Data, Engineering</p>
        </div>
        <div className={style.contentColumns}>
          <div className={`pure-u-1 pure-u-md-12-24 ${style.projects}`}>
            <h3>Projects</h3>
          </div>
          <div className={`pure-u-1 pure-u-md-12-24 ${style.blog}`}>
            <h3>Blog</h3>
          </div>
        </div>
      </Layout>
    );
  }
}
export default index;
