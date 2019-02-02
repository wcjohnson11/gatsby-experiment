import React from "react"
import Container from "./container"
import Header from "./header"
import "./pure.css"

export default ({ children }) => (
    <Container>
        <Header />
        {children}
    </Container>
)
