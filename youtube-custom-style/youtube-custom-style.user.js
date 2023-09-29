// ==UserScript==
// @name         YouTube custom style
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2023.09.30.0
// @description  Youtubeのスタイルを良い感じに書き換えます。
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-custom-style/youtube-custom-style.user.js
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function() {

    // 動画タイトルのフォントが重すぎてイヤなので、過去のスタイルに戻す
    `
    h1.ytd-watch-metadata {
        word-break: break-word;
        font-family: "YouTube Sans","Roboto",sans-serif;
        font-size: 18px;
        line-height: 2.8rem;
        font-weight: 400;
        overflow: hidden;
        display: block;
        max-height: 5.6rem;
        -webkit-line-clamp: 2;
        display: box;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        white-space: normal;
    }
    `
    const sleep = ms => new Promise(res => setTimeout(res, ms))
    // タイトルを読み込むまで良い感じにループしながら待機する
    async function title_font_replace() {
        for (let i=0; i<30; i++) {
            try {
                let target_elm = document.querySelector('h1.style-scope.ytd-watch-metadata');
                target_elm.style = 'font-size: 18px; font-weight: 400;';
                return;
            } catch(e) {
                // エラーが起きて当然なのでcatchは握りつぶします
            }
            await sleep(100);
        }
    }

    title_font_replace();


    // ダークテーマの背景を真っ黒にする
    const before_style = document.querySelector('style[css-build-single]').textContent;
    const after_sytle = before_style.replaceAll('--yt-spec-base-background: #0f0f0f', '--yt-spec-base-background: #000000');
    document.querySelector('style[css-build-single]').textContent = after_sytle;



})();