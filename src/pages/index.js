import React from "react"
import Container from "../components/container"
import Header from "../components/header"

export default () => (
    <Container>
        <Header routeLink="/about/" routeName="About"/>
        <p>Living in the future, with React!</p>
    </Container>
)
