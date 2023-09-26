// ==UserScript==
// @name            Youtube original channel id
// @namespace       https://twitter.com/oz0820
// @version         2023.09.26.0
// @description     YoutubeのチャンネルIDを表示する機能を追加します
// @author          oz0820
// @match           https://www.youtube.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/youtube-original-channel-id/youtube-original-channel-id.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function () {

    // ページ移動を検出します
    let href = window.location.href;
    let c_handle = '';
    const observer = new MutationObserver(async function () {
        if (href !== window.location.href) {
            href = window.location.href;

            if (!href.split('/')[3].startsWith('@')) {
                return;
            }

            if (c_handle !== href.split('/')[3]) {
                c_handle = href.split('/')[3];
                await init();
            }
        }
    })
    observer.observe(document, { childList: true, subtree: true });

    // ハンドルを使ったチャンネルページのみ実行する
    if (!window.location.href.split('/')[3].startsWith('@')) {
        return;
    }

    window.onload = async function () {
        await init();
    }


    async function init() {
        const cid = await get_og_cid();

        if (!cid) {
            console.log('cid error');
            return;
        }

        // 念のため削除
        document.querySelectorAll('.yt_og_chanel_id').forEach((elm) => {
            elm.remove();
        });

        const ex_html = `
<yt-formatted-string id="channel-id" class="delimiter style-scope ytd-c4-tabbed-header-renderer">cannot_get_channel_id</yt-formatted-string>
<button value="change" class="yt_og_chanel_id" id="change_button" style="padding-top: 0; padding-bottom: 0; margin-left: 10px;">change</button>`;

        // チャンネルのハンドルを表示する要素の後ろに ex_html を挿入する
        document.querySelectorAll('[id="channel-handle"]').forEach((elm) => {
            elm.insertAdjacentHTML('afterend', ex_html);
        });

        // 追加したボタンに操作用のEventListenerを追加
        document.querySelectorAll('#change_button.yt_og_chanel_id').forEach((elm) => {
            elm.addEventListener('click', function () {
                yt_og_cid();
            })
        })

        // 要素をねじ込むと勝手に is-empty が挿入されるので削除する
        document.querySelectorAll('yt-formatted-string[id="channel-id"]').forEach((elm) => {
            elm.innerHTML = cid;
            elm.removeAttribute('is-empty');
        });

        // ハンドルを表示にして
        document.querySelectorAll('yt-formatted-string#channel-handle.delimiter').forEach((elm) => {
            elm.classList.remove('delimiter');
        })
        // cidを非表示にする
        document.querySelectorAll('yt-formatted-string#channel-id').forEach((elm) => {
            elm.classList.add('delimiter');
        })

        // ハンドル・チャンネルIDをクリックしたらコピーする
        document.querySelectorAll('yt-formatted-string#channel-handle').forEach(elm => {
            elm.addEventListener('click', function (e) {
                copyToClipboard(e.target.innerHTML)
            });
        });
        document.querySelectorAll('yt-formatted-string#channel-id').forEach(elm => {
            elm.addEventListener('click', function (e) {
                copyToClipboard(e.target.innerHTML)
            });
        });


    }


    function yt_og_cid() {

        // ハンドルが非表示にされていたら
        if (document.querySelector('yt-formatted-string#channel-handle.delimiter')) {
            // ハンドルを表示にして
            document.querySelectorAll('yt-formatted-string#channel-handle.delimiter').forEach((elm) => {
                elm.classList.remove('delimiter');
            })
            // cidを非表示にする
            document.querySelectorAll('yt-formatted-string#channel-id').forEach((elm) => {
                elm.classList.add('delimiter');
            })

        } else {
            // ハンドルを非表示にして
            document.querySelectorAll('yt-formatted-string#channel-handle').forEach((elm) => {
                elm.classList.add('delimiter');
            })
            // cidを表示する
            document.querySelectorAll('yt-formatted-string#channel-id.delimiter').forEach((elm) => {
                elm.classList.remove('delimiter');
            })
        }
    }


    async function get_og_cid() {
        try {
            const response = await fetch(location.href);
            // console.log(response.url);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            let og_url = doc.querySelector('meta[property="og:url"]').getAttribute('content');
            const cid = og_url.split('/')[4];
            if (!cid) {
                throw new Error('URLの解析に失敗しました。');
            }
            return cid;
        } catch (error) {
            console.error('データの取得に失敗しました:', error);
            return null;
        }
    }

})();


function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log("テキストがクリップボードにコピーされました");
        })
        .catch(err => {
            console.error("クリップボードへのアクセスに失敗しました:", err);
            alert("クリップボードへのアクセスに失敗しました\n" + err)
        });
}


