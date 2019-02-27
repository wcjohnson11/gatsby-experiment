import React from "react";
import { graphql, Link, StaticQuery } from "gatsby";
import styles from "./styles/header.module.css";

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
    `}
    render={data => (
      <div className={styles.header}>
        <Link to="/" className={styles.headerTitle}>
          {data.site.siteMetadata.title}
        </Link>
      </div>
    )}
  />
);
