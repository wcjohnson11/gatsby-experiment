import React from "react";
import { FaGithubAlt, FaLinkedinIn, FaCodepen } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";
import style from "./footer.module.css";

export default () => (
  <div className={style.footer}>
    <FaGithubAlt className={style.icon} />
    <FaLinkedinIn className={style.icon} />
    <FaCodepen className={style.icon} />
    <MdMailOutline className={style.icon} />
  </div>
);
