import React from "react"
import { Link } from "gatsby"
import styles from "./styles/listLink.module.css"

export default ({ to, children }) => (
    <li className={styles.listLink}>
        <Link to={to}>{children}</Link>
    </li>
)