import React from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";
import "./pure.css";

export default ({ children }) => (
  <Container>
    <Header />
    <div style={{ flexGrow: 1 }}>{children}</div>
    <Footer />
  </Container>
);
