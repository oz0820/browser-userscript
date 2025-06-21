// ==UserScript==
// @name         YouTube Thumbnail Button
// @namespace    https://twitter.com/oz0820
// @version      2025.06.22.1
// @description  Youtubeの再生ページにサムネイルプレビューを追加します。
// @author       oz0820
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-thumbnail-button/youtube-thumbnail-button.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(async function () {
    // デバッグフラグ
    const DEBUG = false; // trueで詳細ログ、falseで通常ログ

    // ログ出力
    function logger(...message) {
        if (DEBUG) {
            console.log("【YTB】", ...message);
        }
    }

    // 通常ログ（重要なイベントのみ出力）
    function info(...message) {
        console.log("【YTB】", ...message);
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // サムネイルURLリストを返す
    function getThumbnailUrls(videoId) {
        // 指定したvideoIdからサムネイルURLリストを生成
        logger("getThumbnailUrls", videoId);
        return [
            `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`, // 720p
            `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,     // 480p
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,     // 360p
            `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,     // 180p
            `https://i.ytimg.com/vi/${videoId}/default.jpg`        //  90p
        ];
    }

    // 現在のページからvideoIdを抽出
    function extractVideoId() {
        // ページURLからvideoIdを抽出
        let videoId = null;
        if (window.location.pathname.startsWith('/live/')) {
            videoId = window.location.pathname.split('/')[2] || null;
        } else {
            const params = new URLSearchParams(window.location.search);
            videoId = params.get('v');
        }
        logger("extractVideoId", videoId);
        return videoId;
    }

    // サムネイルURLのうち有効なものを返す
    async function fetchValidThumbnail(urls) {
        // サムネイルURLリストから有効なものを1つ返す
        logger("fetchValidThumbnail: start", urls);

        // まず1件目だけ判定
        try {
            logger("fetchValidThumbnail: trying first", urls[0]);
            const res = await fetch(urls[0], { method: 'GET', mode: 'cors' });
            logger("fetchValidThumbnail: response first", urls[0], res.status);
            if (res.ok) {
                logger("fetchValidThumbnail: first valid", urls[0]);
                return urls[0]; // 1件目がvalidなら必ず1件目を返す
            }
        } catch (e) {
            logger("fetchValidThumbnail: error first", urls[0], e);
        }

        // 1件目がダメなら残りを並列で判定し、最初に有効なものを返す
        const checks = urls.slice(1).map((url, idx) =>
            fetch(url, { method: 'GET', mode: 'cors' })
            .then(res => res.ok ? { url, idx } : null)
            .catch(() => null)
        );
        const results = await Promise.all(checks);
        const found = results.find(r => r);
        if (found) {
            logger("fetchValidThumbnail: found valid (parallel)", found.url);
            return found.url;
        }
        logger("fetchValidThumbnail: no valid url found");
        return null;
    }

    // サムネイル表示管理クラス
    class ThumbnailViewManager {
        constructor() {
            // サムネイル表示用DOM要素
            this.secondaryRenderer = null;
            this.thumbnailLink = null;
            this.thumbnailImg = null;
            this.lastValidUrl = null; // 前回の有効なサムネイルURL
            logger("ThumbnailViewManager: constructed");
        }

        // サムネイル表示エリアを初期化
        async init() {
            logger("ThumbnailViewManager: init start");
            await this._waitForSecondaryRenderer();

            // 既存のサムネイル要素があれば再利用
            const existingLink = this.secondaryRenderer.querySelector('a.ytd-extended-thumbnail');
            const existingImg = existingLink ? existingLink.querySelector('img#extended_thumbnail') : null;

            if (existingLink && existingImg) {
                logger("ThumbnailViewManager: reuse existing thumbnail elements");
                this.thumbnailLink = existingLink;
                this.thumbnailImg = existingImg;
            } else {
                logger("ThumbnailViewManager: insert new thumbnail elements");
                this._insertThumbnailHtml();
            }
            logger("ThumbnailViewManager: init end");
        }

        // サムネイル画像・リンクを更新
        update(url) {
            // サムネイル画像とリンクを更新
            logger("ThumbnailViewManager: update", url);
            if (this.thumbnailLink && this.thumbnailImg) {
                this.thumbnailLink.href = url;
                this.thumbnailImg.src = url;
            }
        }

        // サイドバーのDOMが現れるまで待つ
        async _waitForSecondaryRenderer() {
            // サイドバーDOMが表示されるまで待機
            logger("ThumbnailViewManager: _waitForSecondaryRenderer start");
            while (true) {
                const el = document.querySelector('ytd-watch-next-secondary-results-renderer');
                if (el && el.clientHeight !== 0) {
                    this.secondaryRenderer = el;
                    logger("ThumbnailViewManager: secondaryRenderer found");
                    break;
                }
                await sleep(100);
            }
        }

        // サムネイルHTMLを挿入
        _insertThumbnailHtml() {
            // サムネイルHTMLをサイドバー先頭に挿入
            logger("ThumbnailViewManager: _insertThumbnailHtml");
            const html =
                `<a class="ytd-extended-thumbnail wrapper" href="" target="_blank">
                    <img src="" id="extended_thumbnail" class="style-scope ytd-extended-thumbnail" style="width: 100%; height: auto; border-radius: 15px; margin-bottom: 10px" alt="extended_thumbnail" title="新しいタブで開く">
                </a>`;
            // trustedTypes未対応ブラウザ対策
            if (window.trustedTypes) {
                const policy = trustedTypes.createPolicy('ytThumbnailPolicy', { createHTML: s => s });
                this.secondaryRenderer.insertAdjacentHTML('afterbegin', policy.createHTML(html));
            } else {
                this.secondaryRenderer.insertAdjacentHTML('afterbegin', html);
            }
            this.thumbnailLink = this.secondaryRenderer.querySelector('a.ytd-extended-thumbnail');
            this.thumbnailImg = this.thumbnailLink.querySelector('img#extended_thumbnail');
        }
    }

    // サムネイル更新処理
    async function updateThumbnail(tvm) {
        // サムネイル画像を更新
        info("Start updating thumbnail");
        const videoId = extractVideoId();
        if (!videoId) {
            info("Could not get video ID");
            return;
        }
        const urls = getThumbnailUrls(videoId);

        // 判定が終わるまでは最高画質URLを一時的に設定
        tvm.update(urls[0]);

        // 実際に取得できるURLを探して更新
        const validUrl = await fetchValidThumbnail(urls);
        if (validUrl) {
            info("Set valid thumbnail URL:", validUrl);
            tvm.update(validUrl);
            tvm.lastValidUrl = validUrl; // 有効なURLを保存
        } else {
            info("Could not find valid thumbnail URL");
        }
    }

    // ページ遷移検知
    function observeUrlChange(callback) {
        // URL変更を監視し、変更時にコールバックを実行
        let prevHref = location.href;
        const observer = new MutationObserver(() => {
            if (prevHref !== location.href) {
                info("URL changed");
                prevHref = location.href;
                callback();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // メイン処理
    info("YouTube Thumbnail Button script started");
    const tvm = new ThumbnailViewManager();
    await tvm.init();
    await updateThumbnail(tvm);

    observeUrlChange(async () => {
        await tvm.init();
        await updateThumbnail(tvm);
    });
    info("YouTube Thumbnail Button script ready");
})();