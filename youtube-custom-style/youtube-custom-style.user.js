// ==UserScript==
// @name         YouTube custom style
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2024.06.02.1
// @description  Youtubeのスタイルを良い感じに書き換えます。
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-custom-style/youtube-custom-style.user.js
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(async function () {

    // ページ移動を検出します
    let href = window.location.href;
    const observer = new MutationObserver(async function () {
        if (href !== window.location.href) {
            href = window.location.href;

            if (location.href.startsWith('https://www.youtube.com/watch') ||
                location.href.startsWith('https://www.youtube.com/live')) {
                title_font_replace();
            }
        }
    })
    observer.observe(document, {childList: true, subtree: true});

    // 初回実行
    background_color_changer();
    await chat()

    // ライブチャットのハートマークが邪魔なので
    const style_elm =
        `<style>
            yt-reaction-control-panel-overlay-view-model div#reaction-control-panel { margin-bottom: 50px; }
            yt-reaction-control-panel-overlay-view-model yt-reaction-control-panel-view-model { opacity: 0.4; }
            yt-reaction-control-panel-overlay-view-model yt-reaction-control-panel-view-model:hover { opacity: 1.0; }
        </style>`;
    if (new URL(location.href).pathname.startsWith('/live_chat')) {
        document.head.insertAdjacentHTML('beforeend', style_elm);
    }

    if (location.href.startsWith('https://www.youtube.com/watch')) {
        title_font_replace();
    }

    // 動画タイトルのフォントが重すぎてイヤなので、過去のスタイルに戻す

    // ytd-watch-metadata[title-headline-xs] h1.ytd-watch-metadata {
    //     word-break: break-word;
    //     font-family: "YouTube Sans","Roboto",sans-serif;
    //     font-size: 18px;
    //     line-height: 2.8rem;
    //     font-weight: 400;
    //     overflow: hidden;
    //     display: block;
    //     max-height: 5.6rem;
    //     -webkit-line-clamp: 2;
    //     display: box;
    //     display: -webkit-box;
    //     -webkit-box-orient: vertical;
    //     text-overflow: ellipsis;
    //     white-space: normal;
    // }

    // タイトルを読み込むまで良い感じにループしながら待機する
    function title_font_replace() {
        let target_elm = document.querySelector('h1.style-scope.ytd-watch-metadata');
        if (target_elm) {
            target_elm.style = 'font-size: 18px; font-weight: 400;';
        } else {
            setTimeout(() => title_font_replace(), 200);
        }
    }

    // ダークテーマの背景を真っ黒にする
    function background_color_changer() {
        const before_style = document.querySelector('style[css-build-single]').textContent;
        const after_style = before_style.replaceAll('--yt-spec-base-background: #0f0f0f', '--yt-spec-base-background: #000000');
        document.querySelector('style[css-build-single]').textContent = after_style;
    }


})();