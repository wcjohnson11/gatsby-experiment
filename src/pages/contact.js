import React from "react"
import Container from "../components/container"
import Header from "../components/header"

export default () => (
    <Container>
        <Header routeLink="/" routeName="Home" />
        <h1>Get in touch</h1>
        <p>I'm a fungi!</p>
        <p>
            <a href="mailto:will@wcj.io">will@wcj.io</a>
        </p>
    </Container>
)
