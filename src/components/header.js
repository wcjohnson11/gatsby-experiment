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
      <a>{data.site.siteMetadata.title}</a>
    </Link>
    {/* <ul className={styles.headerList}>
      <ListLink to="/about/">About</ListLink>
      <ListLink to="/contact/">Contact</ListLink>
    </ul> */}
  </div>
  )}
  />
);
