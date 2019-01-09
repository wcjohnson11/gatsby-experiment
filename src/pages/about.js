import React from "react"
import Header from "../components/header"

export default (props) => (
  <div className="about">
    <Header routeLink="/" routeName="Home"/>
    <h3>Let me tell you a story, all about how</h3>
    <p>my react got flipped, turned upside down</p>
    <img
      src="https://source.unsplash.com/random/150x150"
      alt="about unsplash"
    />
  </div>
);
