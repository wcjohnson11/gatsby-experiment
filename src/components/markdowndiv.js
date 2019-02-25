import React from "react";
import style from "./markdowndiv.module.css";

export default ({ content }) => (
  <div
    className={style.markdown}
    dangerouslySetInnerHTML={{
      __html: content
    }}
  />
);
