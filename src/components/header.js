import React from "react"
import { graphql, Link, StaticQuery } from "gatsby"
import ListLink from "./listLink";
import styles from "./header.module.css"

export default () => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  }
  render={data => (

    <div className={styles.header}>
    <Link to="/" className={styles.headerTitle}>
      <h1>{data.site.siteMetadata.title}</h1>
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
  )}
  />
);
