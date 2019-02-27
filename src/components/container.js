import React from "react"
import SiteMetadata from "./site-metadata"
import style from "./styles/container.module.css"

export default ({ children }) => (
    <div className={style.container}>
    <SiteMetadata />
    {children}
    </div>
)