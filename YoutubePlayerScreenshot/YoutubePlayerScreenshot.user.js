// ==UserScript==
// @name            YouTube Player Screenshot
// @namespace       https://twitter.com/oz0820
// @version         2025.10.05.1
// @description     なんか強いスクショ
// @author          oz0820
// @match           https://www.youtube.com/live/*
// @match           https://www.youtube.com/watch*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/YoutubePlayerScreenshot/YoutubePlayerScreenshot.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==


(async function () {
    const import_module = (url) => {
        const elm = document.createElement('script');
        elm.src = url;
        document.head.append(elm);
    }

    const formatted_datetime = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = ('0' + (now.getMonth() + 1)).slice(-2)
        const day = ('0' + now.getDate()).slice(-2)
        const hours = ('0' + now.getHours()).slice(-2)
        const minutes = ('0' + now.getMinutes()).slice(-2)
        const seconds = ('0' + now.getSeconds()).slice(-2)
        const milliseconds = ('00' + now.getMilliseconds()).slice(-3)
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`
    }

    // WindowsとLinuxで使うとマズいファイル名をサニタイズする
    const safe_file_name = (name, max_len=0) => {
        switch (name) {
            case '.':
                return '_'
            case '..':
                return '__'
            default:
                return max_len === 0 ?
                    name.replace(/[\\\/:\*\?\"<>\|]/g, '_') :
                    name.replace(/[\\\/:\*\?\"<>\|]/g, '_').slice(0, max_len)
        }
    }

    const cut_long_string = (txt, max_len = 0) => {
        switch (max_len) {
            case max_len === 0:
                return txt
            case txt.length <= 50:
                return txt
            default:
                return txt.slice(0, max_len-2) + '……'
        }
    }


    // Trusted Typesポリシー作成
    const policy = window.trustedTypes?.createPolicy('youtube-ss', {
        createHTML: (input) => input
    });
    const safeHTML = (html) => policy ? policy.createHTML(html) : html;

    // ボタンHTML（消さずにここで定義）
    const button_html = `
<button class="SS ytp-button" id="SSbutton" aria-label="スクリーンショットをバースト撮影します" title="スクリーンショットをバースト撮影します">
<svg style="width: 100%;" viewBox="-8 -8 36 36">
    <g>
        <path stroke="#fff" stroke-width="1" d="M20.435,19.925H3.565a1.5,1.5,0,0,1-1.5-1.5V9.285a1.5,1.5,0,0,1,1.5-1.5H6.223a.5.5,0,0,0,.5-.454l.166-1.8a1.49,1.49,0,0,1,1.5-1.454h7.23a1.5,1.5,0,0,1,1.5,1.5l.164,1.756a.5.5,0,0,0,.5.454h2.658a1.5,1.5,0,0,1,1.5,1.5v9.14A1.5,1.5,0,0,1,20.435,19.925ZM3.565,8.785a.5.5,0,0,0-.5.5v9.14a.5.5,0,0,0,.5.5h16.87a.5.5,0,0,0,.5-.5V9.285a.5.5,0,0,0-.5-.5H17.777a1.5,1.5,0,0,1-1.494-1.362l-.166-1.8a.515.515,0,0,0-.5-.546H8.385a.5.5,0,0,0-.5.5L7.717,7.423A1.5,1.5,0,0,1,6.223,8.785Z"></path>
        <path stroke="#fff" stroke-width="1" d="M12,17.282a4,4,0,1,1,4-4A4,4,0,0,1,12,17.282Zm0-7a3,3,0,1,0,3,3A3,3,0,0,0,12,10.282Z"></path>
    </g>
</svg>
</button>`;


    // --- Logger ---
    class Logger {
        head = '[YT-Player-Screenshot]'
        isDebug = false
        info(msg) { console.info(`${this.head} ${msg}`) }
        log(msg) { console.log(`${this.head} ${msg}`) }
        warn(msg) { console.warn(`${this.head} ${msg}`) }
        error(msg) { console.error(`${this.head} ${msg}`) }
        debug(msg) { if (this.isDebug) console.info(`${this.head}[DEBUG] ${msg}`) }
    }
    const logger = new Logger()

    const work = async () => {
        logger.debug('スクリーンショットバースト処理開始')
        // viewerを追加
        const insert_elm = `
    <div id="SSoverlay">
        <div class="SScontainer">
            <a href="" download="" style="display: none;">
                <img class="SSpreview" src="" alt="">
            </a>
            <span></span>
            <div class="SSloading">
                <svg width="128" height="128" stroke="#F0F0F0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_V8m1{transform-origin:center;animation:spinner_zKoa 2s linear infinite}.spinner_V8m1 circle{stroke-linecap:round;animation:spinner_YpZS 1.5s ease-in-out infinite}@keyframes spinner_zKoa{100%{transform:rotate(360deg)}}@keyframes spinner_YpZS{0%{stroke-dasharray:0 150;stroke-dashoffset:0}47.5%{stroke-dasharray:42 150;stroke-dashoffset:-16}95%,100%{stroke-dasharray:42 150;stroke-dashoffset:-59}}</style><g class="spinner_V8m1"><circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3"></circle></g></svg>
            </div>
        <style>
            #SSoverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.6); /* オーバーレイの背景色（ここでは半透明の黒） */
            z-index: 9999; /* この値を他の要素よりも大きく設定して、最前面に表示 */
        }
        .SScontainer {
            position: relative;
            display: inline-block;
        }
        .SScontainer span {
            position: absolute;
            background-color: rgba(127, 255, 255, 0.7);
            font-weight: bolder;
            top: 2vh;
            left: 2vw;
            padding-right: 1vh;
            padding-left: 1vh;
            font-size: 50px;
        }
        .SScontainer img.SSpreview {
            box-shadow: 0 0 0 10px #f0f0f0;
            max-height: 90vh;
            max-width: 90vw;
            display: block;
            border-radius: 15px;
        }
        .SScontainer div.SSloading {
            display: block;
        }
        </style>
    </div>
    `

        if (!!document.querySelector('div#SSoverlay')) {
            logger.debug('既存のSSoverlayを削除')
            document.querySelector('div#SSoverlay').remove()
            document.body.insertAdjacentHTML('beforeend', safeHTML(insert_elm))
        } else {
            document.body.insertAdjacentHTML('beforeend', safeHTML(insert_elm))
        }

        // JSZipを使う
        // await import_module('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

        const video_title = document.querySelector('yt-formatted-string.ytd-watch-metadata').innerText.trim()
        const search_params = new URL(location.href).searchParams
        const video_id = search_params.get('v')
        logger.debug(`video_title: ${video_title}, video_id: ${video_id}`)

        // HTMLのvideo要素を取得
        const video_elm = document.querySelector("#movie_player > div.html5-video-container > video")
        if (!video_elm) {
            logger.error('video要素が見つかりません')
            return
        }

        // videoの幅と高さを取得
        const width = video_elm.videoWidth;
        const height = video_elm.videoHeight;
        logger.debug(`video size: ${width}x${height}`)

        // Canvas要素を作成し、videoのサイズに合わせる
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const blob_data_list = []
        const delay_time = 100
        let last_run = 0
        for (let i = 0; i < 10; i++) {
            logger.debug(`バースト${i + 1}/10`)
            // Canvasにvideoのフレームを描画
            await ctx.drawImage(video_elm, 0, 0, width, height);

            await new Promise(resolve => {
                canvas.toBlob(function (result) {
                    if (!!result) {
                        const ext = result.type.split('/')[1]
                        const file_name = safe_file_name(`[${video_id}]-[${cut_long_string(video_title, 50)}]-${formatted_datetime()}.${ext}`)
                        blob_data_list.push({
                            "name": file_name,
                            "url": URL.createObjectURL(result)
                        })
                        logger.debug(`画像保存: ${file_name}`)
                        resolve()
                    } else {
                        logger.warn('canvas.toBlob失敗')
                    }
                }, 'image/png')
            })
            // 最低でもdelay_timeは待つ
            const now_dtime = delay_time - (Date.now() - last_run)
            await new Promise(resolve => {
                setTimeout(resolve, now_dtime < 0 ? 0 : now_dtime)
            })
            last_run = Date.now()
        }

        const my_image_elm = document.querySelector('div#SSoverlay img.SSpreview')
        const my_image_a = document.querySelector('div#SSoverlay a')
        const my_loading = document.querySelector('div#SSoverlay .SSloading')
        const my_image_body = document.querySelector('div#SSoverlay')
        const my_image_info = document.querySelector('div#SSoverlay span')
        const change_image = (delta_index) => {
            if (my_loading) {
                my_loading.style.display = 'none'
            }
            const now_index = my_image_elm.getAttribute('index')
            const blob_len = blob_data_list.length
            const next_index = !!now_index ?
                (((Number(now_index) + delta_index) % blob_len) + blob_len) % blob_len : 0

            my_image_elm.setAttribute('index', next_index.toString())
            my_image_elm.setAttribute('src', blob_data_list[next_index].url)
            my_image_a.href = blob_data_list[next_index].url
            my_image_a.download = blob_data_list[next_index].name
            my_image_info.innerText = `${next_index + 1} / ${blob_len}`
            my_image_a.removeAttribute('style')
            logger.debug(`画像切替: ${next_index + 1}/${blob_len}`)
        }

        change_image(0)

        let SSlast_update = 0
        my_image_elm.addEventListener('wheel', (e) => {
            e.preventDefault()
            const now = Date.now()
            if (now - SSlast_update > 50) {
                SSlast_update = now
                const delta = e.deltaY > 0 ? 1 : -1
                change_image(delta)
            } else {
                logger.debug('ホイールイベント間隔が短いためスキップ')
            }
        })
        my_image_body.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                logger.debug('オーバーレイを閉じます')
                // Blob URLを全て解放
                blob_data_list.forEach(b => URL.revokeObjectURL(b.url));
                e.currentTarget.remove()
            }
        })

        logger.debug('スクリーンショットバースト処理終了')
    }

    // コントロールバーの出現を監視してボタンを挿入する
    const waitForCtrlBar = () => {
        return new Promise(resolve => {
            const ctrl_bar = document.querySelector('div.ytp-right-controls');
            if (ctrl_bar) {
                resolve(ctrl_bar);
                return;
            }
            const observer = new MutationObserver(() => {
                const ctrl_bar = document.querySelector('div.ytp-right-controls');
                if (ctrl_bar) {
                    observer.disconnect();
                    resolve(ctrl_bar);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    };

    const init = async () => {
        logger.debug('コントロールバー挿入待機')
        const ctrl_bar = await waitForCtrlBar();
        logger.debug('コントロールバー検出')
        ctrl_bar.insertAdjacentHTML('afterbegin', safeHTML(button_html));
        document.querySelector('button.SS#SSbutton').addEventListener('click', async (e) => {
            logger.debug('スクリーンショットボタン押下')
            await work();
        });
    };

    await init()
})
();


