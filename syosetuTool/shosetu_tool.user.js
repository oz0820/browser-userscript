// ==UserScript==
// @name            Syosetu Tool
// @namespace       https://twitter.com/oz0820
// @author          oz0820
// @version         2026.10.05.1
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
    /*  20240922 仕様変更対応までショートカット機能以外を無効化
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
    */


    // 2026-10-05 廃止：下部オーバーレイの代わりに、ページ内の移動ボタンを拡大する。
    // 旧実装は参照用に残す。syosetu() からの呼び出しはコメントアウト済み。
    function add_syosetu_mobile_episode_nav(previous_action, next_action) {
        if (document.querySelector('.st-mobile-episode-nav')) {
            return;
        }

        const is_mobile = window.matchMedia('(max-width: 767px)').matches ||
            navigator.userAgentData?.mobile ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
        if (!is_mobile) {
            return;
        }

        const actions = [
            { label: '‹ 前の話', side: 'previous', action: previous_action },
            { label: '次の話 ›', side: 'next', action: next_action }
        ].filter(item => typeof item.action === 'function');

        if (actions.length === 0) {
            return;
        }
        document.documentElement.classList.add('st-mobile-device');

        const nav = document.createElement('nav');
        nav.className = 'st-mobile-episode-nav';
        nav.setAttribute('aria-label', 'エピソード移動');

        actions.forEach(item => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `st-mobile-episode-nav__${item.side}`;
            button.textContent = item.label;
            button.addEventListener('click', item.action);
            nav.appendChild(button);
        });

        const style = document.createElement('style');
        style.textContent = `
            .st-mobile-episode-nav {
                display: none;
            }
            .st-mobile-device body {
                padding-bottom: calc(76px + env(safe-area-inset-bottom)) !important;
            }
            .st-mobile-device .st-mobile-episode-nav {
                position: fixed;
                z-index: 2147483000;
                right: 0;
                bottom: 0;
                left: 0;
                display: flex;
                justify-content: space-between;
                box-sizing: border-box;
                padding: 8px 12px calc(12px + env(safe-area-inset-bottom));
                pointer-events: none;
            }
            .st-mobile-device .st-mobile-episode-nav button {
                flex: 0 0 auto;
                box-sizing: border-box;
                width: clamp(86px, 26vw, 120px);
                min-width: 0;
                min-height: 44px;
                padding: 8px 6px;
                border: 1px solid rgba(0, 0, 0, .25);
                border-radius: 6px;
                background: rgba(255, 255, 255, .55);
                color: rgba(0, 0, 0, .75);
                box-shadow: 0 1px 4px rgba(0, 0, 0, .1);
                backdrop-filter: blur(2px);
                font: inherit;
                font-size: .9rem;
                white-space: nowrap;
                cursor: pointer;
                touch-action: manipulation;
                pointer-events: auto;
            }
            .st-mobile-device .st-mobile-episode-nav__next {
                margin-left: auto;
            }
            .st-mobile-device .st-mobile-episode-nav button:active {
                background: rgba(255, 255, 255, .8);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(nav);
    }


    function enlarge_syosetu_pager() {
        if (document.getElementById('st-pager-style')) {
            return;
        }

        // タブレットにはPC用のHTMLが届く場合があるため、端末名や画面幅で分岐しない。
        // 両方のスタイルを用意し、実際のページ内のボタン構造に合わせて適用する。
        document.documentElement.classList.add('st-enhanced-pager');
        const style = document.createElement('style');
        style.id = 'st-pager-style';
        // スマホは幅や列の割り当てを維持し、高さだけ36pxから64px以上にする。
        // PCは本文と同じ幅の3列にして、上下どちらの移動ボタンも押しやすくする。
        // リンクを枠内いっぱいに伸ばすことで、文字の周囲もタップできる。
        style.textContent = `
            .st-enhanced-pager .c-pager--center {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                width: var(--st-novel-text-width, 600px);
                max-width: 100%;
                min-height: 64px;
                box-sizing: border-box;
                margin-left: auto;
                margin-right: auto;
                padding: 0;
                gap: 0;
            }
            .st-enhanced-pager .c-pager--center > a.c-pager__item {
                grid-column: 2;
                grid-row: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                min-width: 0;
                min-height: 64px;
                margin: 0;
                padding: 0;
                border: 1px solid #ddd;
                touch-action: manipulation;
            }
            /* 位置を固定し、第1話では左列を枠もリンクもない空白として残す。 */
            .st-enhanced-pager .c-pager--center > a.c-pager__item--before {
                grid-column: 1;
            }
            .st-enhanced-pager .c-pager--center > a.c-pager__item--next {
                grid-column: 3;
            }
            .st-enhanced-pager .c-pager--center > a.c-pager__item + a.c-pager__item {
                border-left: 0;
            }
            .st-enhanced-pager .c-pager--novel-box,
            .st-enhanced-pager .c-pager--novel-box-with-bkm {
                min-height: 64px;
            }
            .st-enhanced-pager :is(.c-pager--novel-box, .c-pager--novel-box-with-bkm) > .c-pager__block {
                display: flex;
                align-items: stretch;
                min-height: 64px;
            }
            .st-enhanced-pager :is(.c-pager--novel-box, .c-pager--novel-box-with-bkm) > .c-pager__block > a.c-pager__item {
                display: flex;
                flex: 1 1 auto;
                align-self: stretch;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                min-height: 64px;
                height: auto;
                padding-top: 0;
                padding-bottom: 0;
                touch-action: manipulation;
            }
        `;
        document.head.appendChild(style);

        if (document.querySelector('.c-pager--center > a.c-pager__item')) {
            const novel_text = document.querySelector('.p-novel__text:not(.p-novel__text--preface):not(.p-novel__text--afterword)');
            if (novel_text) {
                const update_pager_width = () => {
                    document.documentElement.style.setProperty('--st-novel-text-width', `${novel_text.getBoundingClientRect().width}px`);
                };
                update_pager_width();
                // 表示調整で本文幅が変わった場合も追従する。監視対象は本文1要素のみ。
                new ResizeObserver(update_pager_width).observe(novel_text);
            }
        }

        document.querySelectorAll('.c-pager--novel-box > .c-pager__block, .c-pager--novel-box-with-bkm > .c-pager__block').forEach(block => {
            const link = block.querySelector('a.c-pager__item');
            if (!link) {
                return;
            }
            // 枠線など、リンクの外側に残る部分をタップした場合も移動する。
            // リンク自身のクリックはブラウザーの通常動作に任せ、二重実行を避ける。
            block.addEventListener('click', event => {
                if (event.target === block && !event.defaultPrevented && event.button === 0 &&
                    !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
                    link.click();
                }
            });
        });
    }


    function syosetu() {
        const ncode = document.location.href.split("/")[3];
        const novel_no = document.querySelector("div.l-container div.p-novel__number")?.innerText.split('/')[0];

        // 指定された広告枠と下部オーバーレイを隠す。
        // CSSにより遅延挿入にも対応し、DOM全体の常時監視は行わない。
        const hidden_ad_selectors = [
            'body > div.l-container > main > article > div.c-ad.c-ad--leaderboard',
            'body > div.l-container > main > div.c-ad.c-ad--layout-horizontal',
            'body > div.l-container > div.l-foot-contents > div.c-ad.c-ad--layout-horizontal',
            // PC・スマホ共通の下端バナー。閉じるボタンと背景も含む外枠を隠す。
            'html body #flexible-sticky-outer',
            'html body .flexible_sticky_ov',
            // PC版の下部固定広告と、スマホ版の浮動広告グループ。
            'html body .ly_gnsinpage_ad--bottom',
            'html body .gn-fc-group-parent',
            // スマホ版の上部バナー。
            'body > div.l-container > div.c-ad.c-ad--mobile'
        ];
        const hidden_ad_style = document.createElement('style');
        hidden_ad_style.textContent = `${hidden_ad_selectors.join(',\n')} { display: none !important; }`;
        document.head.appendChild(hidden_ad_style);
        document.querySelectorAll(hidden_ad_selectors.join(',')).forEach(elm => {
            elm.hidden = true;
        });

        if (/^\/n\d+[a-z]+\/\d+\/?$/.test(location.pathname)) {
            /* 2026-10-05 廃止：オーバーレイボタンの呼び出しを無効化。旧コードは保存する。
            const previous_link = document.querySelector('.c-pager a.c-pager__item--before');
            const next_link = document.querySelector('.c-pager a.c-pager__item--next');
            add_syosetu_mobile_episode_nav(
                previous_link ? () => previous_link.click() : null,
                next_link ? () => next_link.click() : null
            );
            */
            enlarge_syosetu_pager();
        }


        // ショートカットキー周り
        document.addEventListener('keydown', function(e) {
            // 一覧ページとかで発動されると困るので
            if (!location.href.match(/https:\/\/(ncode|novel18).syosetu.com\/n\d+[a-z]+\/\d+/)) {
                return;
            }

            // 移動ボタンを取得する
            const before_button = document.querySelector('.c-pager a.c-pager__item--before')
            const after_button = document.querySelector('.c-pager a.c-pager__item--next')

            // 次のページに進む
            if (e.code === "ControlRight" || e.code === "ControlLeft") {
                after_button?.click();

            // 次のページに進む
            } else if (e.code === "ArrowRight") {
                after_button?.click();

            // 前のページに進む
            } else if (e.code === "ArrowLeft") {
                before_button?.click();

            // 高速スクロールしたい
            } else if (e.code === "ArrowUp") {
                window.scroll(window.scrollX, window.scrollY-100);
            } else if (e.code === "ArrowDown") {
                window.scroll(window.scrollX, window.scrollY+100);

            } else {
                // console.log(e.key);
            }
        });


        /*
        前書き・後書きを初期状態で隠す。
        スマートフォンでも押しやすいボタンから表示を切り替える。
         */
        const add_section_toggle = (section, label) => {
            if (!section || section.dataset.stToggleReady === 'true') {
                return;
            }

            const contents = Array.from(section.children);
            if (contents.length === 0) {
                return;
            }

            section.dataset.stToggleReady = 'true';
            if (!section.id) {
                section.id = `st-${label}-${Math.random().toString(36).slice(2, 9)}`;
            }

            const originally_hidden = contents.map(elm => elm.hidden);
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'st-section-toggle';
            toggle.setAttribute('aria-controls', section.id);
            toggle.setAttribute('aria-expanded', 'false');

            const set_expanded = (expanded) => {
                // 折りたたみ時もサイト本来の仕切り線を残し、空の本文枠の余白だけ詰める。
                section.classList.toggle('st-section-collapsed', !expanded);
                contents.forEach((elm, i) => {
                    elm.hidden = expanded ? originally_hidden[i] : true;
                });
                toggle.setAttribute('aria-expanded', String(expanded));
                toggle.textContent = expanded
                    ? `${label}を隠す`
                    : `${label}（${contents.length}行）を表示`;
            };

            toggle.addEventListener('click', () => {
                set_expanded(toggle.getAttribute('aria-expanded') !== 'true');
            });

            const style = document.createElement('style');
            style.textContent = `
                .st-section-toggle {
                    display: block;
                    box-sizing: border-box;
                    width: 100%;
                    min-height: 0;
                    margin: 0;
                    padding: 0;
                    border: 0;
                    border-radius: 0;
                    background: transparent;
                    color: inherit;
                    font: inherit;
                    line-height: inherit;
                    white-space: nowrap;
                    text-align: center;
                    cursor: pointer;
                    touch-action: manipulation;
                }
                .st-section-toggle:focus-visible {
                    outline: 2px solid currentColor;
                    outline-offset: 2px;
                }
                #${section.id}.st-section-collapsed {
                    padding-top: 0;
                    padding-bottom: 0;
                    margin-top: .5em;
                    margin-bottom: .5em;
                }
                #${section.id} > [hidden] {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
            if (section.classList.contains('p-novel__text--afterword')) {
                // 後書きは上側に仕切り線があるため、枠内の先頭に切替文字を置く。
                // contents は挿入前に取得済みなので、このボタン自体は非表示にしない。
                section.prepend(toggle);
            } else {
                section.parentElement.insertBefore(toggle, section);
            }
            set_expanded(false);
        };

        document.querySelectorAll('.p-novel__text--preface').forEach(section => {
            add_section_toggle(section, '前書き');
        });
        document.querySelectorAll('.p-novel__text--afterword').forEach(section => {
            add_section_toggle(section, '後書き');
        });


        /* TXTダウンロードを新しいタブで開く */
        const txt_dl_elm = document.querySelector('div.c-under-nav > a[onclick]');
        if (!!txt_dl_elm) {
            try {
                txt_dl_elm.setAttribute('target', '_blank')
                txt_dl_elm.removeAttribute('onclick');
            } catch (e) {}
        }

        
        // 20240922 仕様変更対応までショートカット機能以外を無効化

        /* 小説の詳細を表示するやつ */
        
        
        /*
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

            */
    }


    async function syosetu_txt_download() {
        if (!location.pathname.startsWith('/txtdownload/top/ncode')) {
            return;
        }

        const DL_INTERVAL_MS = 6000
        const RETRY_INTERVAL_MS = 6000
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
                        const strip_epi_name = epi_name.slice(epi_name.match(/エピソード\d+：/)[0].length)
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
            document.querySelector('div[id="footer_bar"] tr')?.children[6]?.click();
        }
        function move_to_before_page() {
            document.querySelector('div[id="footer_bar"] tr')?.children[1]?.click();
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
