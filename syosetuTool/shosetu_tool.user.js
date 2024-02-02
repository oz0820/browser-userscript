// ==UserScript==
// @name            Syosetu Tool
// @namespace       https://twitter.com/oz0820
// @author          oz0820
// @version         2024.02.02.0
// @description     小説家になろうをキーボードだけで読むためのツール。ノベルピア・カクヨムも一部対応。
// @match           https://ncode.syosetu.com/*
// @match           https://novel18.syosetu.com/*
// @match           https://novelpia.jp/viewer/*
// @match           https://novelpink.jp/viewer/*
// @match           https://kakuyomu.jp/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/syosetuTool/shosetu_tool.user.js
// @icon            https://syosetu.com/favicon.ico
// ==/UserScript==

(function() {
    const novel_data_manager = class {
        async init(ncode) {
            this.ncode = ncode;

            const db_open_promise = new Promise((resolve, reject) => {
                this.openRequest = indexedDB.open('syosetu_tool', 1);
                this.openRequest.onupgradeneeded = (event) => this.__onupgradeneeded(event);
                this.openRequest.onsuccess = (event) => resolve(event.target.result);
                this.openRequest.onerror = (event) => this.__onerror(event);
            })

            try {
                this.db = await db_open_promise;
                this.novel_data = await this._get();
                if (!this.novel_data) {
                    await this._update();
                }
            } catch(error) {
                console.error("DB connection error: ", error);
                this.constructor();
            }
        }

        async get_epi(episode_number) {
            const now = Math.floor(new Date().getTime() / 1000);
            if (!(episode_number in this.novel_data)) {  // 現在表示している話がデータに存在するか
                await this._update()
            } else if (now - this.novel_data['_last_update'] > 86400) {  // 前回更新から24時間以内か
                await this._update();
            }

            return this.novel_data[episode_number];
        }

        async _update() {
            // 100話を超えたら全話リストが分割されるようになったらしい
            // 一覧ページの数は閲覧ページ上の話数表示から引っ張る
            const last_page_count = !!document.querySelector('#novel_no') ?
                Math.ceil(Number(document.querySelector('#novel_no').innerText.split('/')[1]) / 100) :
                1

            // 100件ごとに取得して最後に合体する
            const novel_data_list = []
            for (let i=1; i<= last_page_count; i++) {
                const fetch_url = `${location.origin}/${this.ncode}/?p=${i}`
                console.log('fetch url', fetch_url)
                novel_data_list.push(
                    await fetch(fetch_url)
                        .then(res => {
                            return res.text()
                        })
                        .then(html => {
                            const parser = new DOMParser()
                            const doc = parser.parseFromString(html, 'text/html')
                            let novel_data = {}

                            doc.querySelectorAll('div.index_box > dl.novel_sublist2').forEach(elm => {

                                novel_data[elm.querySelector('a').href.split('/')[4]] = {
                                    'novel_no': Number(elm.querySelector('a').href.split('/')[4]),
                                    'novel_no_str': elm.querySelector('a').href.split('/')[4],
                                    'subtitle': elm.querySelector('a').innerText.trim(),
                                    'long_update_str': elm.querySelector('.long_update').textContent.trim()
                                        .match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/)[0],
                                    'revision_update_str': elm.querySelector('dt > span') ?
                                        elm.querySelector('dt > span').title.trim().match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/)[0] :
                                        null
                                }
                            })
                            novel_data['_last_update'] = Math.floor(new Date().getTime() / 1000)
                            novel_data['ncode'] = this.ncode
                            return novel_data

                        })
                        .catch(error => {
                            console.error('データの取得に失敗しました', error)
                            return {'_last_update': 0, 'ncode': this.ncode}
                        })
                )
            }

            // 別れたdictデータを合体
            this.novel_data = novel_data_list.reduce((accumulator, current) => {
                return { ...accumulator, ...current }
            }, {})

            await this._write()
        }

        async _get() {
            return new Promise((resolve, reject) => {
                const object_store = this.db.transaction(['post_date'], 'readonly').objectStore('post_date');
                const get_req = object_store.get(this.ncode);
                get_req.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                get_req.onerror = (event) => {
                    reject(event.target.errorCode);
                };
            });
        }

        _write() {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['post_date'], 'readwrite');
                const object_store = transaction.objectStore('post_date');

                const add_req = object_store.put(this.novel_data);
                add_req.onsuccess = (event) => {
                    resolve();
                };
                add_req.onerror = (event) => {
                    reject(event.target.errorCode);
                };
            });
        }

        __onupgradeneeded(event) {
            const db = event.target.result;
            db.createObjectStore('post_date', {keyPath: 'ncode'});
        }

        __onerror(event) {
            console.error("DB connection error: ", event.target.errorCode);
            this.constructor();
        }
    }


    function syosetu() {
        const ncode = document.location.href.split("/")[3];
        const novel_no = document.querySelector("div#novel_no");


        // ショートカットキー周り
        document.addEventListener('keydown', function(e) {
            // 一覧ページとかで発動されると困るので
            if (!location.href.match(/https:\/\/(ncode|novel18).syosetu.com\/n\d+[a-z]+\/\d+/)) {
                return;
            }

            // 移動ボタンを取得する
            let before_button, after_button;
            if (document.querySelector('div.novel_bn').children.length === 2) {
                before_button = document.querySelector('div.novel_bn > a:nth-child(1)');
                after_button = document.querySelector('div.novel_bn > a:nth-child(2)');
            } else {
                if (document.querySelector('div.novel_bn > a:nth-child(1)').innerText.search('<') !== -1) {
                    before_button = document.querySelector('div.novel_bn > a:nth-child(1)');
                    after_button = null;
                } else {
                    before_button = null;
                    after_button = document.querySelector('div.novel_bn > a:nth-child(1)');
                }
            }

            // 次のページに進む
            if (e.code === "ControlRight" || e.code === "ControlLeft") {
                if (after_button) {
                    after_button.click();
                }

            // 次のページに進む
            } else if (e.code === "ArrowRight") {
                if (after_button) {
                    after_button.click();
                }

            // 前のページに進む
            } else if (e.code === "ArrowLeft") {
                if (before_button) {
                    before_button.click();
                }

            // 高速スクロールしたい
            } else if (e.code === "ArrowUp") {
                window.scroll(window.scrollX, window.scrollY-100);
            } else if (e.code === "ArrowDown") {
                window.scroll(window.scrollX, window.scrollY+100);

            // しおりをクリック
            } else if (e.code === "ShiftRight") {
                if (document.querySelector('li.bookmark_now.set_siori')) {
                    const siori_button = document.querySelector('input[name="siori_url"]');
                    siori_button.click();
                }
            } else {
                // console.log(e.key);
            }
        });


        /*
        前後書きの表示・非表示設定
        デフォで前書き・後書きを非表示にする．
         */
        const novel_p = document.querySelector('div#novel_p')
        const novel_a = document.querySelector('div#novel_a')
        const hidden_change = (parent_elm) => {  // 渡された要素の子要素に対して，hidden属性を入れ替える
            Array.from(parent_elm.children).forEach(elm => {
                try {
                    if ( elm.hasAttribute('hidden') ) {
                        elm.removeAttribute('hidden')
                    } else {
                        elm.setAttribute('hidden', '')
                    }
                } catch (e) {
                    // console.error(e)
                    }
            })
        }
        if (!!novel_p) {
            const mae = `<p style="text-align: center;" hidden>～～前書き（${novel_p.children.length}行）～～</p>`
            novel_p.insertAdjacentHTML('beforeend', mae)
            hidden_change(novel_p)
            novel_p.addEventListener('click', function (e) {
               hidden_change(e.currentTarget);
            })
        }
        if (!!novel_a) {
            const ato = `<p style="text-align: center;" hidden>～～後書き（${novel_a.children.length}行）～～</p>`
            novel_a.insertAdjacentHTML('beforeend', ato)
            hidden_change(novel_a)
            novel_a.addEventListener('click', function (e) {
                hidden_change(e.currentTarget);
            })
        }


        /* TXTダウンロードを新しいタブで開く */
        const txt_dl_elm = document.querySelector('div#novel_footer a[onclick]');
        if (!!txt_dl_elm) {
            try {
                txt_dl_elm.setAttribute('target', '_blank')
                txt_dl_elm.removeAttribute('onclick');
            } catch (e) {}
        }


         /* 小説の詳細を表示するやつ */

        if (!location.href.match(/https:\/\/(ncode|novel18).syosetu.com\/n\d+[a-z]+\/\d+/)) {
            return;
        }
        if (location.href.match(/https:\/\/(ncode|novel18).syosetu.com\/n\d+[a-z]+\/\d+/)[0] + '/' !== location.href) {
            return;
        }

        const style_elm =
            `<style>
                @media screen and (max-width: 1120px) {
                    .us_flow_novel_detail{
                        display: none;
                    }
                }
                .us_flow_novel_detail {
                    top: 50px;
                    position: fixed;
                    padding: 10px;
                    width: calc((100% - 750px) / 2);
                    max-width: 450px;
                }
                .long_update {
                    line-height: 150%;
                }
                .revision_update {
                    line-height: 150%;
                }
                p.us_novel_no {
                    color: #999999;
                    font-size: 90%;
                }
                p.us_novel_subtitle {
                    font-weight: bold;
                }
            </style>`
        document.head.insertAdjacentHTML('beforeend', style_elm);

        // novel18の方は要素が一つズレるので、セレクターにオフセットを掛ける
        const isR18 = document.querySelector('div.contents1 > span:nth-child(1)')?.innerText === 'R18';
        const selectorOffset = isR18 ? 1 : 0;

        const episode_number = Number(location.href.split('/')[4]);
        const novel_title = document.querySelector(`div.contents1 > a:nth-child(${1 + selectorOffset})`).innerText.trim();
        const novel_page_url = document.querySelector(`div.contents1 > a:nth-child(${1 + selectorOffset})`).href;
        const novel_no_str = document.querySelector('div#novel_no').innerText.trim();
        const novel_writername = (document.querySelector(`div.contents1 > a:nth-child(${2 + selectorOffset})`) || {}).innerText?.trim() || (() => {
            const contents = document.querySelector('div.contents1').innerText.trim();
            const authorIndex = contents.lastIndexOf('作者：');
            return authorIndex !== -1 ? contents.substring(authorIndex + 3).trim() : '??????';
        })();
        const novel_writer_url = document.querySelector(`div.contents1 > a:nth-child(${2 + selectorOffset})`) ?
            document.querySelector(`div.contents1 > a:nth-child(${2 + selectorOffset})`).href :
            null;
        const chapter_title =  document.querySelector('div.contents1 > p') ?
            document.querySelector('div.contents1 > p').innerText.trim() :
            null;
        const novel_subtitle = document.querySelector('p.novel_subtitle').innerText;

        const elm =
            `<div class="us_flow_novel_detail">
                <a class="us_novel_title" href="${novel_page_url}">${novel_title}</a><br>
                <p>作者：<a class="us_novel_writername" ${novel_writer_url ? `href=${novel_writer_url}`: ''}>${novel_writername}</a></p>
                <p class="us_chapter_title">${chapter_title ? chapter_title : ''}</p>
                <p class="us_novel_subtitle">${novel_subtitle}</p>
                <br>
                <p class="us_novel_no">${novel_no_str}</p>
                <p class="us_long_update">投稿：---</p>
                <p class="us_revision_update">改稿：---</p>
            </div>`
        document.querySelector('div#container').insertAdjacentHTML('beforeend', elm);


        const ndm = new novel_data_manager();
        ndm.init(ncode)
            .then(() => {
                ndm.get_epi(episode_number)
                    .then(novel_data => {
                        document.querySelector('div.us_flow_novel_detail > .us_long_update').textContent = '投稿：' + novel_data.long_update_str;
                        if (novel_data.revision_update_str) {
                            document.querySelector('div.us_flow_novel_detail > .us_revision_update').textContent = '改稿：' + novel_data.revision_update_str;
                        }
                    })
                    .catch(e => {
                        console.error(e)
                    })
            })
    }


    async function syosetu_txt_download() {
        if (!location.pathname.startsWith('/txtdownload/top/ncode')) {
            return;
        }

        const DL_INTERVAL_MS = 5000
        const RETRY_INTERVAL_MS = 5000
        const MAX_RETRY = 5

        const import_module = (url) => {
            const elm = document.createElement('script');
            elm.src = url;
            document.head.append(elm);
        }
        // JSZipを使う
        await import_module('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

        // TXTダウンロードページ専用
        const get_ncode = async () => {
            const url = document.querySelector('form[name="dl"]').action + '?no=1&hankaku=0&code=utf-8&kaigyo=crlf';
            return await fetch(url)
                .then(res => {
                    const raw_ncode = res.headers.get('Content-Disposition').match(/N\w+/)[0]
                    return raw_ncode.replace(/[A-Z]/g, match => match.toLowerCase());
                })
                .catch(e => {
                    console.log('Fetch ERROR', e);
                    return 'n9999999';
                })
        }

        // Windows的安全な名前にサニタイズする
        const safe_file_name = (name, max_len = 0) => {
            if (max_len === 0) {
                return name.replace(/[\\\/:\*\?\"<>\|]/g, '_')
            } else {
                const tmp = name.replace(/[\\\/:\*\?\"<>\|]/g, '_')
                if (tmp.length <= max_len) {
                    return tmp
                } else {
                    return tmp.slice(0, max_len-2) + '……'
                }
            }
        }


        // 秒を入力すると，良い感じのフォーマットに変換して返す
        const format_time = sec => {
            const h = Math.floor(sec / 3600)
            const m = Math.floor((sec % 3600) / 60)
            const s = sec % 60

            let formatted_time = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

            if (h > 0) {
                formatted_time = `${h.toString().padStart(2, '0')}:${formatted_time}`;
            }
            return formatted_time;
        }

        const get_content = async (name_and_urls) => {
            const digit = name_and_urls.length.toString().length;
            const ncode = await get_ncode();
            const retry_fetch = (url, maxRetries = MAX_RETRY, delay = RETRY_INTERVAL_MS) => {
                return new Promise((resolve, reject) => {
                    const fetch_data = async (remaining_retries) => {
                        try {
                            const response = await fetch(url);
                            if (!response.ok) {
                                throw new Error(`Network response was not ok: ${response.status}`);
                            }
                            const blob = await response.blob();
                            resolve(blob);
                        } catch (error) {
                            if (remaining_retries > 0) {
                                setTimeout(() => {
                                    logger.log(`Retrying ${url} ${remaining_retries} retries left.`);
                                    fetch_data(remaining_retries - 1);
                                }, delay);
                            } else {
                                reject(error);
                            }
                        }
                    };
                    fetch_data(maxRetries);
                });
            };

            const execute_sequentially = async (name_and_urls) => {
                const export_data = []
                for (let i = 0; i < name_and_urls.length; i++) {
                    const name_url = name_and_urls[i]
                    const url = name_url.url;
                    const epi_name = name_url.epi_name;
                    const epi_number = name_url.epi_number;

                    const eta_str = format_time((name_and_urls.length - i) * DL_INTERVAL_MS / 1000)
                    const progress_count = String(i + 1).padStart(name_and_urls.length.toString().length, '0')
                    const eta_msg = `${progress_count} / ${name_and_urls.length} (ETA ${eta_str})`
                    logger.eta(eta_msg)
                    try {
                        const blob = await retry_fetch(url);
                        const strip_epi_name = epi_name.slice(epi_name.match(/第\d+部分：/)[0].length)
                        const name = `${ncode}-${String(epi_number).padStart(digit, '0')}_${strip_epi_name}`;
                        export_data.push({
                            'name': name,
                            'blob': blob
                        })
                        logger.log('fetch ok. ' + name)
                    } catch (error) {
                        console.error('Error fetching data:', error);
                        break
                    } finally {
                        if (i + 1 !== name_and_urls.length) {  // 最後はdelayする必要無いので
                            await new Promise(resolve => setTimeout(resolve, DL_INTERVAL_MS));
                        }
                    }
                }
                return export_data
            };

            return await execute_sequentially(name_and_urls)
        }

        const gen_zip = (contents, zip_name) => {
            const zip = new JSZip();
            const folder = zip.folder(safe_file_name(zip_name))
            contents.forEach(c => {
                const file_name = safe_file_name(c.name) + '.txt'
                const content = c.blob
                folder.file(file_name, content)
            })

            return zip.generateAsync({type: 'blob', compression: "DEFLATE", compressionOptions: {level: 9}})
        }

        const save_blob = (blob, name) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = safe_file_name(name, 50) + '.zip';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };


        const name_and_urls = () => {
            const params = new URLSearchParams();

            const epi_names = Array.from(document.body.querySelector('select[name="no"]').children).map(elm => elm.innerText);
            const queries = {
                'hankaku': document.querySelector('select[name="hankaku"]').value,
                'code': document.querySelector('select[name="code"]').value,
                'kaigyo': document.querySelector('select[name="kaigyo"]').value
            }

            Object.entries(queries).forEach(querie => params.append(querie[0], querie[1]));
            const base_url = document.querySelector('form[name="dl"]').action + '?' + params.toString();


            return epi_names.map((epi_name, i) => {
                return {
                    'epi_name': epi_name,
                    'url': `${base_url}&no=${i + 1}`,
                    'epi_number': i + 1
                }
            })
        }

        const logger_c = class {
            constructor() {
                this.textarea = document.querySelector('textarea#st_log_area')
                this.eta_elm = document.querySelector('span#eta_area')
            }

            eta(msg) {
                this.eta_elm.innerText = msg
            }

            log(msg, show = true) {
                if (typeof show !== 'boolean') {
                    this.error('logger error msg: ' + msg + '\tshow: ' + show)
                } else {
                    console.log('[syosetu_tool] ' + msg)
                    this.textarea.textContent += '\n' + msg
                    this._update()
                }
            }

            error(msg, show = true) {
                if (typeof show !== 'boolean') {
                    this.error('logger error msg: ' + msg + '\tshow: ' + show)
                } else {
                    console.error('[syosetu_tool] ' + msg)
                    this.textarea.textContent += '\n' + msg
                    this._update()
                }
            }

            _update() {
                this.textarea.scrollTop = this.textarea.scrollHeight
            }
        }

        const novel_title = document.body.querySelector('center > font').innerText.trim();
        const zip_name = `${await get_ncode()}_${novel_title}`

        const elm = `<tr>
<td colspan="4" align="center">
<br>
<input type="button" value="全件ダウンロードを実行します" id="dl_all">
<br>
<span id="eta_area"></span>
<br>

<textarea id="st_log_area" style="width: 350px; height: 100px; font-size: 10px" readonly></textarea>
</td>
</tr>`
        document.querySelector('tbody').insertAdjacentHTML('beforeend', elm);

        const logger = new logger_c()
        document.querySelector('input#dl_all').addEventListener('click', async () => {
            if (typeof (novel_zip_blob) === 'undefined') {
                const nau = name_and_urls()
                const contents = await get_content(nau)
                novel_zip_blob = await gen_zip(contents, zip_name);
                await save_blob(novel_zip_blob, zip_name);
            } else {
                await save_blob(novel_zip_blob, zip_name);
            }
        })
    }



    function novelpia() {
        function move_to_next_page() {
            document.querySelector('div[id="footer_bar"]').querySelector('tr').children[6].click();
        }
        function move_to_before_page() {
            document.querySelector('div[id="footer_bar"]').querySelector('tr').children[1].click();
        }


        document.addEventListener('keydown', function(e) {

            if (e.code === "ControlRight" || e.code === "ControlLeft") {
                move_to_next_page();
            } else if (e.code === "ArrowRight") {
                move_to_next_page()
            } else if (e.code === "ArrowLeft") {
                move_to_before_page();
            } else if (e.code === "ArrowUp") {
                window.scroll(window.scrollX, window.scrollY - 100);
            } else if (e.code === "ArrowDown") {
                window.scroll(window.scrollX, window.scrollY + 100);
            } else {
                // console.log(e.key);
            }
        })

    }


    function kakuyomu() {
        // 本文閲覧ページのみで実行
        if (!!location.pathname.match(/\/works\/\d+\/episodes\//)) {

            document.addEventListener('keydown', function(e) {
                const previous_button = document.querySelector('div#contentMain-previousEpisode > a');
                const next_button = document.querySelector('div#contentMain-nextEpisode > a');

                // 次のページに進む
                if (e.code === "ControlRight" || e.code === "ControlLeft") {
                    if (next_button) {
                        next_button.click();
                    }

                // 次のページに進む
                } else if (e.code === "ArrowRight") {
                    if (next_button) {
                        next_button.click();
                    }

                // 前のページに進む
                } else if (e.code === "ArrowLeft") {
                    if (previous_button) {
                        previous_button.click();
                    }

                // 高速スクロールしたい
                } else if (e.code === "ArrowUp") {
                    window.scroll(window.scrollX, window.scrollY-100);
                } else if (e.code === "ArrowDown") {
                    window.scroll(window.scrollX, window.scrollY+100);

                } else {
                    // console.log(e.key);
                }
            })
        }
    }


    const hostname = location.hostname;
    if ('ncode.syosetu.com' === hostname || 'novel18.syosetu.com' === hostname) {
        syosetu();
        if (location.pathname.startsWith('/txtdownload/')) {
            syosetu_txt_download()
        }
    }
    if ('novelpia.jp' === hostname || 'novelpink.jp' === hostname) {
        novelpia();
    }
    if ('kakuyomu.jp' === hostname) {
        kakuyomu();
    }


})();