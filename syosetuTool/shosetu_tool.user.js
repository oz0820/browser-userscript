// ==UserScript==
// @name         Syosetu Tool
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2023.11.29.0
// @description  小説家になろうをキーボードだけで読むためのツール。ノベルピア・カクヨムも一部対応。
// @match        https://ncode.syosetu.com/*
// @match        https://novelpia.jp/viewer/*
// @match        https://novelpink.jp/viewer/*
// @match        https://kakuyomu.jp/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/syosetuTool/shosetu_tool.user.js
// @icon         https://syosetu.com/favicon.ico
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
            const fetch_url = `https://ncode.syosetu.com/${this.ncode}/`;

            this.novel_data =
                await fetch(fetch_url)
                    .then(res => {
                        return res.text()
                    })
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        let novel_data = {};

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
                        novel_data['ncode'] = this.ncode;
                        return novel_data;

                    })
                    .catch(error => {
                        console.error('データの取得に失敗しました', error);
                        return {'_last_update': 0, 'ncode': this.ncode};
                    });

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
            if (!location.href.match(/https:\/\/ncode.syosetu.com\/n\d+[a-z]+\/\d+/)) {
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

        if (!location.href.match(/https:\/\/ncode.syosetu.com\/n\d+[a-z]+\/\d+/)) {
            return;
        }
        if (location.href.match(/https:\/\/ncode.syosetu.com\/n\d+[a-z]+\/\d+/)[0] + '/' !== location.href) {
            return;
        }

        const style_elm = `<style>
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

        const episode_number = Number(location.href.split('/')[4]);

        const novel_title = document.querySelector('div.contents1 > a:nth-child(1)').innerText.trim();
        const novel_page_url = document.querySelector('div.contents1 > a:nth-child(1)').href;
        const novel_no_str = document.querySelector('div#novel_no').innerText.trim();
        const novel_writername = (document.querySelector('div.contents1 > a:nth-child(2)') || {}).innerText?.trim() || (() => {
            const contents = document.querySelector('div.contents1').innerText.trim();
            const authorIndex = contents.lastIndexOf('作者：');
            return authorIndex !== -1 ? contents.substring(authorIndex + 3).trim() : '??????';
        })();

        const novel_writer_url = document.querySelector('div.contents1 > a:nth-child(2)') ?
            document.querySelector('div.contents1 > a:nth-child(2)').href :
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

        /*
        const ndm = new novel_data_manager(ncode);
        ndm.get_epi(episode_number)
            .then(novel_data => {
                document.querySelector('div.us_flow_novel_detail > .us_long_update').textContent = '投稿：' + novel_data.long_update_str;
                if (novel_data.revision_update_str) {
                    document.querySelector('div.us_flow_novel_detail > .us_revision_update').textContent = '改稿：' + novel_data.revision_update_str;
                }
            });
         */

        const ndm = new novel_data_manager();
        ndm.init(ncode)
            .then(() => {
                ndm.get_epi(episode_number)
                    .then(novel_data => {
                        document.querySelector('div.us_flow_novel_detail > .us_long_update').textContent = '投稿：' + novel_data.long_update_str;
                        if (novel_data.revision_update_str) {
                            document.querySelector('div.us_flow_novel_detail > .us_revision_update').textContent = '改稿：' + novel_data.revision_update_str;
                        }
                    }).catch(e => console.error(e))
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


    const hostname = window.location.hostname;
    if ('ncode.syosetu.com' === hostname) {
        syosetu();
    }
    if ('novelpia.jp' === hostname || 'novelpink.jp' === hostname) {
        novelpia();
    }
    if ('kakuyomu.jp' === hostname) {
        kakuyomu();
    }


})();