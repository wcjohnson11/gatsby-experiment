import React from "react";
import { FaGithubAlt, FaLinkedinIn, FaCodepen } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";
import style from "./footer.module.css";

export default () => (
  <div className={style.footer}>
    <a className={style.a} href="https://www.github.com/wcjohnson11">
      <FaGithubAlt className={style.icon} />
    </a>
    <a className={style.a} href="https://www.linkedin.com/in/wcj11">
      <FaLinkedinIn className={style.icon} />
    </a>
    <a className={style.a} href="https://codepen.io/wcjohnson11/#">
      <FaCodepen className={style.icon} />
    </a>

    <a className={style.a} href="https://beta.observablehq.com/@wcjohnson11">
      <svg className={style.icon} role="img" viewBox="0 0 24 24">
        <path d="M12 21c-1.108 0-2.068-.261-2.88-.783a5.137 5.137 0 0 1-1.867-2.126 11.821 11.821 0 0 1-.952-2.847A16.523 16.523 0 0 1 6 12c0-.862.052-1.686.157-2.474.104-.787.297-1.587.578-2.399.281-.812.643-1.516 1.084-2.113a4.987 4.987 0 0 1 1.735-1.455C10.27 3.186 11.084 3 12 3c1.108 0 2.068.261 2.88.783a5.137 5.137 0 0 1 1.867 2.126c.434.895.751 1.844.952 2.847.2 1.002.301 2.084.301 3.244 0 .862-.052 1.686-.157 2.474a11.76 11.76 0 0 1-.59 2.399c-.29.812-.65 1.516-1.084 2.113-.434.597-1.008 1.082-1.723 1.455-.715.373-1.53.559-2.446.559zm2.118-6.882A2.888 2.888 0 0 0 15 12c0-.824-.287-1.53-.86-2.118C13.566 9.294 12.853 9 12 9c-.853 0-1.566.294-2.14.882A2.925 2.925 0 0 0 9 12c0 .824.287 1.53.86 2.118.574.588 1.287.882 2.14.882.853 0 1.559-.294 2.118-.882zM12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" />
      </svg>
    </a>
    <a className={style.a} href="mailto:will@wcj.io">
      <MdMailOutline className={style.icon} />
    </a>
  </div>
);
