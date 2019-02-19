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
    <a className={style.a} href="mailto:will@wcj.io">
      <MdMailOutline className={style.icon} />
    </a>
  </div>
);
