import React from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";

export default ({ children }) => (
  <Container>
    <Header />
      {children}
    <Footer />
  </Container>
);
