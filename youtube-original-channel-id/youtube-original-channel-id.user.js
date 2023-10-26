// ==UserScript==
// @name            YouTube original channel id
// @namespace       https://twitter.com/oz0820
// @version         2023.10.27.0
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

            if (!href.split('/')[3].startsWith('@') && !(href.split('/')[3] === 'channel')) {
                return;
            }

            if (c_handle !== href.split('/')[3]) {
                c_handle = href.split('/')[3];
                await init();
            }
        }
    })
    observer.observe(document, { childList: true, subtree: true });

    // チャンネルページのみ実行する
    if (!href.split('/')[3].startsWith('@') && !(href.split('/')[3] === 'channel')) {
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
<yt-formatted-string id="channel-id" class="style-scope ytd-c4-tabbed-header-renderer yt_og_chanel_id" style="font-weight: 500;">cannot_get_channel_id</yt-formatted-string>
<button value="change" class="yt_og_chanel_id" id="member_list" style="padding-top: 0; padding-bottom: 0; margin-left: 10px;">Member list</button>`;


        // チャンネルのハンドルを表示する要素の後ろに ex_html を挿入する
        document.querySelectorAll('[id="channel-handle"]').forEach((elm) => {
            elm.insertAdjacentHTML('afterend', ex_html);
        });

        // 追加したボタンに操作用のEventListenerを追加
        document.querySelectorAll('#member_list.yt_og_chanel_id').forEach((elm) => {
            elm.addEventListener('click', function () {
                yt_open_member_list();
            })
        })

        // 要素をねじ込むと勝手に is-empty が挿入されるので削除する
        document.querySelectorAll('yt-formatted-string[id="channel-id"]').forEach((elm) => {
            elm.innerHTML = cid;
            elm.removeAttribute('is-empty');
        });

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


    function yt_open_member_list() {
        const member_ship_list = 'https://www.youtube.com/playlist?list=UUMO' + document.querySelector('yt-formatted-string#channel-id').innerText.slice(2)
        window.open(member_ship_list, '_blank')
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
            console.log("テキストがクリップボードにコピーされました: ", text);
        })
        .catch(err => {
            console.error("クリップボードへのアクセスに失敗しました:", err);
            alert("クリップボードへのアクセスに失敗しました\n" + err)
        });
}


