// ==UserScript==
// @name            YouTube original channel id
// @namespace       https://twitter.com/oz0820
// @version         2025.10.05.1dev
// @description     YoutubeのチャンネルIDを表示する機能を追加します
// @author          oz0820
// @match           https://www.youtube.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/youtube-original-channel-id/youtube-original-channel-id.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(async function () {
    // --- Logger ---
    class Logger {
        head = '[YT-Original-channel-ID]'
        isDebug = false
        info(msg) { console.info(`${this.head} ${msg}`) }
        log(msg) { console.log(`${this.head} ${msg}`) }
        warn(msg) { console.warn(`${this.head} ${msg}`) }
        error(msg) { console.error(`${this.head} ${msg}`) }
        debug(msg) { if (this.isDebug) console.info(`${this.head}[DEBUG] ${msg}`) }
    }
    const logger = new Logger()

    // --- Trusted Types Policy ---
    const policy = trustedTypes.createPolicy('ytChannelIDPolicy', { createHTML: s => s })

    // --- Clipboard Utility ---
    const copyToClipboard = async text => {
        try {
            await navigator.clipboard.writeText(text)
            logger.info(`テキストがクリップボードにコピーされました: ${text}`)
        } catch (err) {
            logger.error('クリップボードへのアクセスに失敗しました: ' + err.message)
            alert("クリップボードへのアクセスに失敗しました\n" + err)
        }
    }

    // --- DOM Utility ---
    const removeOldElements = () => {
        document.querySelectorAll('.YT-Original-channel-ID').forEach(elm => elm.remove())
    }

    // --- Channel ID取得 ---
    const getOriginalChannelId = async () => {
        try {
            const response = await fetch(location.href)
            const html = await response.text()
            const safeHtml = policy ? policy.createHTML(html) : html
            const doc = new DOMParser().parseFromString(safeHtml, 'text/html')
            const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content')
            const cid = ogUrl?.split('/')[4]
            if (!cid) throw new Error('URLの解析に失敗しました')
            return cid
        } catch (error) {
            logger.error('データの取得に失敗しました ' + error.message)
            return null
        }
    }

    // --- UI生成 ---
    const createActionButtonsHTML = cid => `
<div class="ytFlexibleActionsViewModelAction YT-Original-channel-ID">
  <button-view-model class="ytSpecButtonViewModelHost" style="display: padding-left: 16px;">
    <button id="get_channel_id" class="yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="チャンネルIDを取得" cid="${cid}" aria-disabled="false">
      <div class="yt-spec-button-shape-next__button-text-content">チャンネルIDを取得</div>
    </button>
  </button-view-model>
</div>
<div class="ytFlexibleActionsViewModelAction YT-Original-channel-ID">
  <button-view-model class="ytSpecButtonViewModelHost">
    <a id="go-to-member-playlist" href="/playlist?list=UUMO${cid.slice(2)}" target="_blank" class="yt-spec-button-shape-next yt-spec-button-shape-next--outline yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="メンバー動画リスト" aria-disabled="false">
      <div class="yt-spec-button-shape-next__button-text-content">メンバー動画リスト</div>
    </a>
  </button-view-model>
</div>
`

    // 通知
    function createNotification(message, isError = false) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const notification = document.createElement('div');
        notification.className = isError ? 'notification-error' : 'notification';
        notification.textContent = message;
        container.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, isError ? 10000 : 5000);
    }

    // 通知用コンテナとCSS
    function setNotificationContainer() {
        if (document.getElementById('notification-container')) return;
        const overlay = document.createElement('div');
        overlay.id = 'notification-container';
        overlay.className = 'yt-og';
        document.body.appendChild(overlay);

        const css = `
#notification-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
}
.notification, .notification-error {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    padding: 10px;
    margin-bottom: 10px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    transform: scale(2.0);
    transform-origin: bottom right;
}
.notification-error {
    background-color: #f88;
}
.notification.show, .notification-error.show {
    opacity: 1;
}`;
        const styleElement = document.createElement('style');
        styleElement.className = 'yt-og';
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(css));
        (document.head || document.getElementsByTagName('head')[0]).appendChild(styleElement);
    }

    // --- メイン処理 ---
    const renderChannelIdActions = async () => {
        logger.debug('init start')
        removeOldElements()
        logger.debug('過去要素削除')

        const cid = await getOriginalChannelId()
        logger.debug('get cid: ' + cid)
        if (!cid) {
            logger.error('ChannelIDが見つかりません')
            return
        }

        const ex_html = createActionButtonsHTML(cid)
        document.querySelectorAll('yt-flexible-actions-view-model').forEach(flexActions => {
            flexActions.insertAdjacentHTML('beforeend', policy.createHTML(ex_html))
        })

        document.querySelectorAll('button#get_channel_id').forEach(elm => {
            elm.addEventListener('click', async e => {
                const btn = e.target.closest('button#get_channel_id')
                if (btn) {
                    await copyToClipboard(btn.getAttribute('cid').trim())
                    createNotification('チャンネルIDをコピーしました')
                }
            })
        })

        logger.log('表示OK')
    }

    // --- ページ遷移監視 ---
    let prevPath = location.pathname
    let prevChannel = ''
    const isChannelPage = () => location.pathname.startsWith('/@') || location.pathname.startsWith('/channel')
    const getChannelHandle = () =>
        location.pathname.startsWith('/@')
            ? location.pathname.split('/')[1]
            : location.pathname.split('/')[2]

    // ページ遷移監視時にも通知コンテナを確実に設置
    const observer = new MutationObserver(async () => {
        if (prevPath !== location.pathname) {
            prevPath = location.pathname
            if (!isChannelPage()) return
            setNotificationContainer()
            const newChannel = getChannelHandle()
            if (prevChannel !== newChannel) {
                prevChannel = newChannel
                logger.debug('observer run')
                await renderChannelIdActions()
                logger.debug('init OK')
            }
        }
    })
    observer.observe(document.body || document.querySelector('body'), { childList: true, subtree: true })
    logger.debug('observer start')

    // --- 初回ロード ---
    window.onload = async () => {
        setNotificationContainer()
        if (isChannelPage()) await renderChannelIdActions()
    }
})()