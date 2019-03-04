import React from 'react';
import style from './styles/mysterybox.module.css';

export default () => (
    <div className={style.container}>
        <div className={style.cube}>
            <div className={`${style.side} ${style.front}`}></div>
            <div className={`${style.side} ${style.back}`}></div>
            <div className={`${style.side} ${style.right}`}></div>
            <div className={`${style.side} ${style.left}`}></div>
            <div className={`${style.side} ${style.top}`}></div>
            <div className={`${style.side} ${style.bottom}`}></div>
            <div className={`${style.questionmark}`}></div>
        </div>
    </div>
)