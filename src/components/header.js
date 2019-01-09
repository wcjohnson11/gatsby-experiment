import React from "react"
import { Link } from "gatsby"

export default (props) => (
  <div className="hero">
    <Link to={props.routeLink}>{props.routeName}</Link>
    <h1>Gatsby Experiment</h1>
    <p>What a time to be alive!</p>
    <img
      src="https://source.unsplash.com/random/900x200"
      alt="random unsplash"
    />
  </div>
);
