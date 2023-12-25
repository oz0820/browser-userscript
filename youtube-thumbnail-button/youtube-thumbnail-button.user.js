// ==UserScript==
// @name         YouTube Thumbnail Button
// @namespace    https://twitter.com/oz0820
// @version      2023.12.26.0
// @description  Youtubeの再生ウィンドウにサムネイル直行ボタンを追加すると思います。
// @author       oz0820
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-thumbnail-button/youtube-thumbnail-button.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function () {
    let thumbnail_url = "";
    let thumbnail_ok = false;
    let href = window.location.href;

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // ページ移動を検出します
    const observer = new MutationObserver(function () {
        if (href !== window.location.href) {
            href = window.location.href;
            // 処理
            logger("URL Changed.");
            thumbnail_ok = false;
            set_extended_thumbnail();
        }
    })
    observer.observe(document, { childList: true, subtree: true });

    function set_url() {
        let param_search = new URLSearchParams(window.location.search);
        let video_id = param_search.get('v');
        if (video_id == null) {
            return;
        }
        // 画質良い順に並べる
        const urls = [
            "https://i.ytimg.com/vi/" + video_id + "/maxresdefault.jpg",
            "https://i.ytimg.com/vi/" + video_id + "/sddefault.jpg",
            "https://i.ytimg.com/vi/" + video_id + "/0.jpg"
        ];
        logger("check", thumbnail_url);
        check_urls(urls).then(r => {
            for (let i = 0; i < r.length; i++) {
                logger("check", urls[i]);
                if (r[i].status === 200) {
                    logger("OK", urls[i]);
                    thumbnail_url = urls[i];
                    thumbnail_ok = true;
                    return;
                }
            }
        });
    }

    async function check_urls(urls) {
        const results = [];
        for (const url of urls) {
            results.push(fetch(url));
        }
        return Promise.all(results);
    }

    // 関連動画の上にサムネを埋め込みます
    function set_extended_thumbnail() {
        set_url();
        // サムネのURLが確定するまで待ちます
        run();
        async function run() {
            for (let i = 0; i < 100; i++) {
                if (thumbnail_ok) {
                    try {
                        document.querySelector('img#extended_thumbnail.ytd-extended-thumbnail').src = thumbnail_url;
                        document.querySelector('a.ytd-extended-thumbnail.wrapper').href = thumbnail_url;
                    } catch (e) {
                        for (let elm of document.querySelectorAll('.ytd-extended-thumbnail')) {
                            elm?.remove();
                        }
                        let elm = document.querySelector('ytd-watch-next-secondary-results-renderer');
                        let html =
                            `<a class="ytd-extended-thumbnail wrapper" href="${thumbnail_url}" target="_blank">
                                <img src="${thumbnail_url}" id="extended_thumbnail" class="style-scope ytd-extended-thumbnail" alt="extended_thumbnail" title="新しいタブで開く">
                            </a>`;
                        // 非ログイン状態だと関連動画と合体してしまうので、1行改行を入れる
                        if (document.getElementsByTagName('yt-related-chip-cloud-renderer').length === 0) {
                            html += '<br>';
                        }
                        elm.insertAdjacentHTML('afterbegin', html);
                    }
                    break;
                }
                await sleep(100);
            }
        }
    }

    async function init() {
        const my_style =
            `<style>
                .ytd-extended-thumbnail {
                    border-radius: 15px;
                }
                img#extended_thumbnail.ytd-extended-thumbnail {
                    width: 100%;
                    height: auto
                }
            </style>`;
        ( document.head || document.querySelector('head') )?.insertAdjacentHTML('beforeend', my_style)

        for (let i = 0; i < 50; i++) {
            try {
                // 雑にボタン追加します
                let html = '' +
                    '<button class="ytp-thumbnail-button ytp-button" id="show_thumbnail_button" aria-label="サムネイルを表示する" title="サムネイルを表示する">' +
                        '<svg class="ytp-thumbnail-button-icon" height="100%" width="100%" viewBox="-8 -8 32 32" fill-opacity="1">' +
                            '<path fill="#fff" d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />' +
                            '<path fill="#fff" d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />' +
                        '</svg>' +
                    '</button>';

                document.getElementsByClassName('ytp-right-controls')[0].insertAdjacentHTML('afterbegin', html);
                break;
            } catch (e) {
                // なんもしないです
            }
            await sleep(100);
        }
        for (let i = 0; i < 50; i++) {
            try {
                // 新しいタブでビデオIDをねじ込んだサムネURLを開きます
                document.getElementById('show_thumbnail_button').addEventListener('click', function () {
                    window.open(thumbnail_url);
                });
            } catch (e) {
                // なんもしないです
            }
            await sleep(100);
        }

        // サムネイルを埋め込みます
        set_extended_thumbnail();
    }
    init();

    function logger(...message) {
        let out = "";
        for (let i = 0; i < message.length; i++) {
            out += String(message[i]);
            out += " ";
        }
        console.log("【YTB】", out);
    }

})();


