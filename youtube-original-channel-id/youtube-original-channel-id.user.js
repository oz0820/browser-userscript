// ==UserScript==
// @name            YouTube original channel id
// @namespace       https://twitter.com/oz0820
// @version         2023.11.25.0
// @description     YoutubeのチャンネルIDを表示する機能を追加します
// @author          oz0820
// @match           https://www.youtube.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/youtube-original-channel-id/youtube-original-channel-id.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function () {

    // ページ移動を検出します
    let path = location.pathname
    let channel_handle = ''
    const observer = new MutationObserver(async function () {
        if (path !== location.pathname) {
            path = location.pathname

            // チャンネルページ以外では実行しない
            if (!location.pathname.startsWith('/@') && location.pathname !== '/channel') {
                return
            }

            // チャンネル別チャンネルに移動したときだけ実行する
            if (channel_handle !== location.pathname.split('/')[1]) {
                channel_handle = location.pathname.split('/')[1]
                await init()
            }
        }
    })
    observer.observe(document, { childList: true, subtree: true })

    // チャンネルページ以外では実行しない
    if (!location.pathname.startsWith('/@') && location.pathname !== '/channel') {
        return
    }

    window.onload = async () => {
        await init()
    }


    const init = async () => {
        const cid = await original_channel_id()

        if (!cid) {
            logger.error('ChannelIDが見つかりません')
            return
        }
        // 念のため削除
        document.querySelectorAll('.yt_og_channel_id').forEach((elm) => {
            elm.remove()
        })

        const ex_html = `
<span class="meta-item style-scope ytd-c4-tabbed-header-renderer yt_og_channel_id">
    <yt-formatted-string id="channel-id" class="style-scope ytd-c4-tabbed-header-renderer yt_og_channel_id">cannot_get_channel_id</yt-formatted-string>
    <span aria-hidden="true" class="delimiter style-scope ytd-c4-tabbed-header-renderer">‧</span>
</span>

<span class="meta-item style-scope ytd-c4-tabbed-header-renderer yt_og_channel_id">
    <button value="change" class="yt_og_channel_id" id="member_list">Member list</button>
    <span aria-hidden="true" class="delimiter style-scope ytd-c4-tabbed-header-renderer">‧</span>
</span>
`

        // チャンネルのハンドルを表示する要素の後ろに ex_html を挿入する
        document.querySelectorAll('div#inner-header-container span.ytd-c4-tabbed-header-renderer yt-formatted-string#channel-handle')
            .forEach(elm => {
                elm.parentElement.insertAdjacentHTML('afterend', ex_html)
            })

        // 追加したボタンに操作用のEventListenerを追加
        document.querySelectorAll('button#member_list.yt_og_channel_id').forEach((elm) => {
            elm.addEventListener('click', function () {
                yt_open_member_list()
            })
        })


        // 要素をねじ込むと勝手に is-empty が挿入されるので削除する
        document.querySelectorAll('yt-formatted-string#channel-id.yt_og_channel_id').forEach((elm) => {
            elm.innerHTML = cid
            elm.removeAttribute('is-empty')
        })

        // ハンドル・チャンネルIDをクリックしたらコピーする
        document.querySelectorAll('yt-formatted-string#channel-handle').forEach(elm => {
            elm.addEventListener('click', function (e) {
                copyToClipboard(e.target.innerHTML.trim())
            })
        })

        document.querySelectorAll('yt-formatted-string#channel-id').forEach(elm => {
            elm.addEventListener('click', function (e) {
                copyToClipboard(e.target.innerHTML.trim())
            })
        })
    }


    const yt_open_member_list = () => {
        const member_ship_list = 'https://www.youtube.com/playlist?list=UUMO' + document.querySelector('yt-formatted-string#channel-id').innerText.slice(2)
        window.open(member_ship_list, '_blank')
    }

    const original_channel_id = async () => {
        try {
            const response = await fetch(location.href)
            const html = await response.text()

            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')

            let og_url = doc.querySelector('meta[property="og:url"]').getAttribute('content')
            const cid = og_url.split('/')[4]
            if (!cid) {
                logger.error('URLの解析に失敗しました')
                throw new Error('URLの解析に失敗しました')
            }
            return cid
        } catch (error) {
            logger.error('データの取得に失敗しました ' + error.message)
            return null
        }
    }


    /* TOOLS*/

    const copyToClipboard = text => {
        navigator.clipboard.writeText(text)
            .then(() => {
                logger.info(`テキストがクリップボードにコピーされました: ${text}`)
            })
            .catch(err => {
                logger.error('クリップボードへのアクセスに失敗しました: ' + err.message)
                alert("クリップボードへのアクセスに失敗しました\n" + err)
            })
    }


    const logger = new class {
        head = '[YT-Original-channel-ID]'
        info(msg) {
            console.info(this.head + ' ' + msg)
        }
        log(msg) {
            console.log(this.head + ' ' + msg)
        }
        warn(msg) {
            console.warn(this.head + ' ' + msg)
        }
        error(msg) {
            console.error(this.head + ' ' + msg)
        }
    }

})()


