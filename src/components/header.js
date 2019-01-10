import React from "react"
import { Link } from "gatsby"
import headerStyles from "./header.module.css"

export default () => (
  <div className={headerStyles.header}>
    <Link to="/">Home</Link>
    <Link to="/about/">About</Link>
    <Link to="/contact/">Contact</Link>
    <h1>Gatsby Experiment</h1>
    <p>What a time to be alive!</p>
    <img
      src="https://source.unsplash.com/random/800x200"
      alt="random unsplash"
    />
  </div>
);
