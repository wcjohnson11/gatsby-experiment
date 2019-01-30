import React from "react"
import Container from "./container"
import Header from "./header"
import "./pure.css"

export default ({ children }) => (
    <Container>
        <Header />
        <h1 className="pure-u-1-24">hi</h1>
        {children}
    </Container>
)
