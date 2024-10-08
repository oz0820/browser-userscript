// ==UserScript==
// @name            YouTube original channel id
// @namespace       https://twitter.com/oz0820
// @version         2024.08.18.0dev
// @description     YoutubeのチャンネルIDを表示する機能を追加します
// @author          oz0820
// @match           https://www.youtube.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/youtube-original-channel-id/youtube-original-channel-id.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(async function () {
    const logger = new class {
        head = '[YT-Original-channel-ID]'
        isDebug = false
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
        debug(msg) {
            if (this.isDebug) {
                console.info(this.head + '[DEBUG] ' + msg)
            }
        }
    }

    const policy = trustedTypes.createPolicy('ytChannelIDPolicy', {createHTML: (string) => string,})

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

    /*
    ここから本文
     */

    const work = async () => {
        logger.debug('init start')
        // 念のため削除
        document.querySelectorAll('.yt_og_channel_id').forEach((elm) => {
            elm.remove()
        })
        logger.debug('過去要素削除')

        const cid = await original_channel_id()
        logger.debug('get cid')

        if (!cid) {
            logger.error('ChannelIDが見つかりません')
            return
        }

        const ex_html = `
<div class="yt_og_channel_id yt-content-metadata-view-model-wiz__metadata-row yt-content-metadata-view-model-wiz__metadata-row--metadata-row-inline">
    <span class="yt-content-metadata-view-model-wiz__delimiter" aria-hidden="true">
        •
    </span>
    <span id="yt_og_channel_id" class="yt_og_channel_id yt-core-attributed-string yt-content-metadata-view-model-wiz__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color" dir="auto" role="text">
        ${cid}
    </span>
    <span class="yt-content-metadata-view-model-wiz__delimiter" aria-hidden="true">
        •
    </span>
    <button value="${cid}" class="yt_og_channel_id" id="member_list">Member list</button>
</div>
    `
     
        document.querySelectorAll('tp-yt-app-header div#contentContainer yt-content-metadata-view-model > div.yt-content-metadata-view-model-wiz__metadata-row > span[role="text"]')
            .forEach(elm => {
                // チャンネルハンドルのタグだけ使いたい……
                if (elm.innerText.startsWith('@')) {
                    elm.insertAdjacentHTML('afterend', policy.createHTML(ex_html))
                    elm.setAttribute('id', 'yt_og_channel_handle')
                }
            })

        // 追加したボタンに操作用のEventListenerを追加
        document.querySelectorAll('button#member_list.yt_og_channel_id').forEach((elm) => {
            elm.addEventListener('click', function (event) {
                yt_open_member_list(event)
            })
        })

        document.querySelectorAll('span#yt_og_channel_id').forEach(elm => {
            try {
                elm.addEventListener('click', function (e) {
                    if (e.target.getAttribute('role') === "text" && e.target.tagName === "SPAN") {
                        console.log('TRUE')
                    }
                    copyToClipboard(e.target.innerHTML.trim())
                })
            } catch (e) {
                // ???
            }
        })

        document.querySelectorAll('span#yt_og_channel_handle').forEach(elm => {
            try {
                if (elm.getAttribute('yt_og_channel_id_Listener') === null) {
                    elm.addEventListener('click', function (e) {
                        if (e.target.getAttribute('role') === "text" && e.target.tagName === "SPAN") {
                            console.log('TRUE')
                        }
                        copyToClipboard(e.target.innerHTML.trim())
                    })
                    elm.setAttribute('yt_og_channel_id_Listener', '')
                }
            } catch (e) {
                // ???
            }
        })

        logger.log('表示OK')
    }


    const yt_open_member_list = (event) => {
        const channel_id = event.target.value
        const member_ship_list = 'https://www.youtube.com/playlist?list=UUMO' + channel_id.slice(2)
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

    // 問答無用でクリップボードにぶち込まれるので，カーソル変えて主張する
    const css = `
            <style>
            span#yt_og_channel_id {
                cursor: pointer;
            }
            span#yt_og_channel_handle {
                cursor: pointer;
            }
            </style>`;

    ( document.head || document.querySelector('head') ).insertAdjacentHTML('beforeend', policy.createHTML(css))


    // ページ移動を検出します
    let path = location.pathname
    let channel_handle = ''
    const observer = new MutationObserver(async function () {
        if (path !== location.pathname) {
            path = location.pathname

            // チャンネルページ以外では実行しない
            if (!location.pathname.startsWith('/@') && !location.pathname.startsWith('/channel')) {
                return
            }

            const new_channel = location.pathname.startsWith('/@') ?
                location.pathname.split('/')[1] :
                location.pathname.split('/')[2]

            if (channel_handle !== new_channel) {
                channel_handle = new_channel
                logger.debug('observer run')
                await work()
                logger.debug('init OK')
            }
        }
    })
    observer.observe( (document.body || document.querySelector('body')), { childList: true, subtree: true })
    logger.debug('observer start')

    window.onload = async () => {
        if (location.pathname.startsWith('/@') || location.pathname.startsWith('/channel')) {
            await work()
        }
    }

})()


