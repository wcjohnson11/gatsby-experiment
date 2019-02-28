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
      .classed(`${style.circle}`, true);

    select("svg")
      .append("text")
      .attr("x", 115)
      .attr("y", 150)
      .attr("dy", ".35em")
      .text(() => "Welcome :)");
  }
  render() {
    return (
      <Layout>
        <section className={style.hero}>
          <div className={style.svg}>
            <svg width={300} height={300} />
          </div>
          <div className={style.title}>
            <h1>Will Johnson</h1>
            <p>Analytics, Art, Data, Engineering</p>
          </div>
        </section>
        <section className={style.projects}>
          <h3>Projects</h3>
        </section>
        <section className={style.blog}>
          <h3>Blog</h3>
        </section>
      </Layout>
    );
  }
}
export default index;
