// ==UserScript==
// @name         YouTube custom style
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2023.11.17.0
// @description  Youtubeのスタイルを良い感じに書き換えます。
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-custom-style/youtube-custom-style.user.js
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function() {

    // ページ移動を検出します
    let href = window.location.href;
    const observer = new MutationObserver(async function () {
        if (href !== window.location.href) {
            href = window.location.href;

            if (location.href.startsWith('https://www.youtube.com/')) {
                replace_special_logo();
            }

            if (location.href.startsWith('https://www.youtube.com/watch')) {
                title_font_replace();
            }

        }
    })
    observer.observe(document, { childList: true, subtree: true });

    // 初回実行
    background_color_changer();
    replace_special_logo();

    // ライブチャットのハートマークが邪魔なので
    const add_elm =
`<style>
yt-reaction-control-panel-view-model { margin-bottom: 50px; opacity: 0.4; }
yt-reaction-control-panel-view-model:hover { opacity: 1.0; }
</style>`;
    document.head.insertAdjacentHTML('beforeend', add_elm);

    if (location.href.startsWith('https://www.youtube.com/watch')) {
        title_font_replace();
    }



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
    // タイトルを読み込むまで良い感じにループしながら待機する
    function title_font_replace() {
        let target_elm = document.querySelector('h1.style-scope.ytd-watch-metadata');
        if (target_elm) {
            target_elm.style = 'font-size: 18px; font-weight: 400;';
        } else {
            setTimeout(() => title_font_replace(), 200);
        }
    }

    function replace_special_logo() {
        window.onload = () => {
            document.querySelectorAll('a#logo.ytd-topbar-logo-renderer').forEach(elm => {
                elm.href = '/';
            });
            document.querySelectorAll('#big-yoodle').forEach(elm => {
                elm.remove();
            })
        }
    }

    // ダークテーマの背景を真っ黒にする
    function background_color_changer() {
        const before_style = document.querySelector('style[css-build-single]').textContent;
        const after_style = before_style.replaceAll('--yt-spec-base-background: #0f0f0f', '--yt-spec-base-background: #000000');
        document.querySelector('style[css-build-single]').textContent = after_style;
    }



})();