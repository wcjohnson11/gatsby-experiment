import React from "react"
import Layout from "../components/layout"
import styles from "./about.module.css"

const Story = props => (
  <div className={styles.story}>
    <img src={props.avatar} className={styles.avatar} alt="" />
    <div className={styles.description}>
      <h2 className={styles.storyname}>{props.storyname}</h2>
      <p className="styles.excerpt">{props.excerpt}</p>
    </div>
  </div>
)

export default props => (
  <Layout>
    <h3>Let me tell you a story</h3>
    <h3>all about how</h3>
    <p>my react world got flipped, turned upside down</p>
    <p>and it never would've happened without this newfangled tech!</p>
    <br />
    <Story
      storyname="GatsbyJS"
      avatar="https://source.unsplash.com/random/100x100"
      excerpt="A BLAZING fast modern site generator for React, extremely pluggable with best modern practices and all the cool kids are using it."
    />
    <Story
      storyname="CSS Modules"
      avatar="https://source.unsplash.com/random/100x100"
      excerpt="A tool for writing CSS like normal but it is compiled with hashed unique class and animation names so you don't have to worry about name collisions."
    />
  </Layout>
);
