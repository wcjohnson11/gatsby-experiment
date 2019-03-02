import React from "react";
import Layout from "../components/layout";
import Circles from "../components/visualizations/circles";
import MysteryBox from "../components/mysterybox";
import style from "./styles/index.module.css";

class index extends React.Component {

  
  componentDidMount() {
  }
  render() {
    return (
      <Layout>
        <section className={style.hero}>
          <Circles />
          <div className={style.title}>
            <h1>Will Johnson</h1>
            <p>Analytics, Art, Data, Engineering</p>
          </div>
        </section>
        <section className={style.projects}>
          <h3>Projects</h3>
          <MysteryBox />
        </section>
        <section className={style.blog}>
          <h3>Blog</h3>
        </section>
      </Layout>
    );
  }
}
export default index;
