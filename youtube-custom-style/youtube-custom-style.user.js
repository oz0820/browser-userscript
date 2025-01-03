// ==UserScript==
// @name         YouTube custom style
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2025.01.04.0
// @description  Youtubeのスタイルを良い感じに書き換えます。
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-custom-style/youtube-custom-style.user.js
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(async function () {

    // ページ移動を検出します
    // let href = window.location.href;
    // const observer = new MutationObserver(async function () {
    //     if (href !== window.location.href) {
    //         href = window.location.href;

    //         if (location.href.startsWith('https://www.youtube.com/watch') ||
    //             location.href.startsWith('https://www.youtube.com/live')) {
    //             title_font_replace();
    //         }
    //     }
    // })
    // observer.observe(document, {childList: true, subtree: true});

    const policy = trustedTypes.createPolicy('ytCustomStyle', {createHTML: (string) => string,})

    const func_top = () => {
        // 動画タイトルのフォントを軽くする
        const titleElm = document.querySelector('div#title > h1');
        if (!!titleElm) {
            if ('400' === window.getComputedStyle(titleElm).fontWeight) {
                // スタイルが適用されているので終了
                return;
            }
        }


        // window.getComputedStyle(document.querySelector('div#title > h1')).fontWeight

        const css = `
        <style>
            div#title > h1 {
                font-family: "YouTube Sans";
                font-weight: 400;
                font-size: 2rem;
            }
        </style>
        <link href="https://fonts.googleapis.com/css?family=YouTube+Sans&display=swap" rel="stylesheet">
        `
        document.head.insertAdjacentHTML('beforeend', policy.createHTML(css));
    }

    if (location.href.startsWith('https://www.youtube.com/watch') || 
        location.href.startsWith('https://www.youtube.com/live')) {
        func_top();
    }


})();