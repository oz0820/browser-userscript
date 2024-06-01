// ==UserScript==
// @name         YouTube Thumbnail Button
// @namespace    https://twitter.com/oz0820
// @version      2024.06.02.0
// @description  Youtubeの再生ページにサムネイルプレビューを追加します。
// @author       oz0820
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-thumbnail-button/youtube-thumbnail-button.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==


(async function () {
    function logger(...message) {
        let out = ""
        for (let i = 0; i < message.length; i++) {
            out += String(message[i])
            out += " "
        }
        console.log("【YTB】", out)
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

    let href = window.location.href
    const observer = new MutationObserver(function () {
        if (href !== window.location.href) {
            href = window.location.href;
            // 処理
            logger("URL Changed.");
            set_thumbnail_url()
        }
    })
    observer.observe(document, { childList: true, subtree: true });

    // pathnameからvidを抽出して、有効なサムネイルURLを取得する
    const set_thumbnail_url = () => {
        let video_id
        if (window.location.pathname.startsWith('/live/')) {
            video_id = window.location.pathname.split('/')[2];
        } else {
            let param_search = new URLSearchParams(window.location.search);
            video_id = param_search.get('v');
        }
        if (video_id == null) {
            return;
        }
        // 画質良い順に並べる
        const urls = [
            "https://i.ytimg.com/vi/" + video_id + "/maxresdefault.jpg",
            "https://i.ytimg.com/vi/" + video_id + "/sddefault.jpg",
            "https://i.ytimg.com/vi/" + video_id + "/0.jpg"
        ];
        const check_urls = async urls => {
            const results = [];
            for (const url of urls) {
                results.push(fetch(url));
            }
            return Promise.all(results);
        }

        check_urls(urls).then(async r => {
            for (let i = 0; i < r.length; i++) {
                logger("check", urls[i]);
                if (r[i].status === 200) {
                    logger("OK", urls[i]);
                    await tvm.update(urls[i])
                    return;
                }
            }
        });
    }

    class thumbnail_view_manager {
        url = null
        secondary_renderer = null
        extended_thumbnail_img = null
        extended_thumbnail_frame = null

        async init() {
            await this._reset_img_frame()
        }

        async update(url) {
            this.url = url
            try {
                if (this.extended_thumbnail_img.clientWidth === 0) {
                    logger('ERROR _reset_img')
                    await this.init()
                }

                this.extended_thumbnail_frame.href = url
                // logger('Update extended_thumbnail_frame')
                this.extended_thumbnail_img.src = url
                // logger('Update extended_thumbnail_img')
            } catch (e) {
                logger('ERROR _reset_img')
                await this._reset_img_frame()
                await this.update(url)
            }
        }

        async _reset_img_frame() {
            while (true) {
                const secondary_renderer = document.querySelector('ytd-watch-next-secondary-results-renderer')
                if (secondary_renderer === null) {
                    await sleep(100)
                } else {
                    if (secondary_renderer.clientHeight !== 0) {
                        this.secondary_renderer = secondary_renderer
                        break
                    } else {
                        await sleep(100)
                    }
                }
            }

            logger('get secondary_renderer')

            this.secondary_renderer.querySelectorAll('a.ytd-extended-thumbnail').forEach(e => {
                e.remove()
            })
            let html =
                `<a class="ytd-extended-thumbnail wrapper" href="" target="_blank">
                    <img src="" id="extended_thumbnail" class="style-scope ytd-extended-thumbnail" style="width: 100%; height: auto; border-radius: 15px; margin-bottom: 10px" alt="extended_thumbnail" title="新しいタブで開く">
                </a>`

            this.secondary_renderer.insertAdjacentHTML('afterbegin', html)

            this.extended_thumbnail_frame = document.querySelector('a.ytd-extended-thumbnail')
            this.extended_thumbnail_img = document.querySelector('a.ytd-extended-thumbnail > img#extended_thumbnail')
        }
    }

    const tvm = new thumbnail_view_manager()
    await tvm.init()
    set_thumbnail_url()
})();