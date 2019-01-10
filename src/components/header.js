import React from "react"
import { Link } from "gatsby"
import ListLink from "./listLink";
import styles from "./header.module.css"

export default () => (
  <div className={styles.header}>
    <Link to="/" className={styles.headerTitle}>
      <h1>Gatsby Experiment</h1>
    </Link>
    <ul className={styles.headerList}>
      <ListLink to="/">Home</ListLink>
      <ListLink to="/about/">About</ListLink>
      <ListLink to="/contact/">Contact</ListLink>
    </ul>
    <p>What a time to be alive!</p>
    <img
      src="https://source.unsplash.com/random/800x200"
      alt="random unsplash"
    />
  </div>
);
