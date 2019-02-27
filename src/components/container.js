import React from "react"
import SiteMetadata from "./site-metadata"
import containerStyles from "./container.module.css"

export default ({ children }) => (
    <div className={containerStyles.container}>
    <SiteMetadata />
    {children}
    </div>
)