// ==UserScript==
// @name            YouTube original channel id
// @namespace       https://twitter.com/oz0820
// @version         2025.10.05.0dev
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
        document.querySelectorAll('.YT-Original-channel-ID').forEach((elm) => {
            elm.remove()
        })
        logger.debug('過去要素削除')

        const cid = await original_channel_id()
        logger.debug('get cid: '+ cid)


        if (!cid) {
            logger.error('ChannelIDが見つかりません')
            return
        }

        const ex_html = `
<div class="ytFlexibleActionsViewModelAction YT-Original-channel-ID">
  <button-view-model class="ytSpecButtonViewModelHost" style="display: padding-left: 16px;">
    <button id="get_channel_id" class="yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="チャンネルIDを取得" cid="${cid}" aria-disabled="false" style="">
      <div class="yt-spec-button-shape-next__button-text-content">チャンネルIDを取得</div>
    </button>
  </button-view-model>
</div>
<div class="ytFlexibleActionsViewModelAction YT-Original-channel-ID">
  <button-view-model class="ytSpecButtonViewModelHost">
    <a id="go-to-member-playlist" href="/playlist?list=UUMO${cid.slice(2)}" target="_blank" class="yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="メンバー動画リスト" aria-disabled="false" style="">
      <div class="yt-spec-button-shape-next__button-text-content">メンバー動画リスト</div>
    </a>
  </button-view-model>
</div>
`
     
        // ex_htmlをyt-flexible-actions-view-model要素内の後ろに挿入
        document.querySelectorAll('yt-flexible-actions-view-model').forEach(flexActions => {
            flexActions.insertAdjacentHTML('beforeend', policy.createHTML(ex_html));
        });


        document.querySelectorAll('button#get_channel_id').forEach(elm => {
            try {
                elm.addEventListener('click', function (e) {
                    logger.debug(e.target.closest('button#get_channel_id'))
                    copyToClipboard(e.target.closest('button#get_channel_id').getAttribute('cid').trim())
                })
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

            // TrustedHTML に変換（Trusted Types 未対応のブラウザならそのまま）
            const safeHtml = policy ? policy.createHTML(html) : html;

            const parser = new DOMParser();
            const doc = parser.parseFromString(safeHtml, 'text/html')

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


