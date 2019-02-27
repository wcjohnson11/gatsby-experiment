import React from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";
import style from "./styles/layout.module.css";

export default ({ children }) => (
  <Container>
    <Header />
    <div className={style.layout}>{children}</div>
    <Footer />
  </Container>
);
