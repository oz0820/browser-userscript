// ==UserScript==
// @name         Syosetu Tool
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2023.11.16.1
// @description  小説家になろうをキーボードだけで読むためのツール。ノベルピアも一部対応。
// @match        https://ncode.syosetu.com/*
// @match        https://novelpia.jp/viewer/*
// @match        https://novelpink.jp/viewer/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/syosetuTool/shosetu_tool.user.js
// @icon         https://syosetu.com/favicon.ico
// ==/UserScript==

(function() {

    function syosetu() {
        document.addEventListener('keydown', function(e) {
            const ncode = document.location.href.split("/")[3];
            const novel_no = document.querySelector("div#novel_no");

            // 一覧ページとかで発動されると困るので
            if (!location.href.match(/https:\/\/ncode.syosetu.com\/n\d{4}[a-z]{2}\/\d+/)) {
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


         /*小説の詳細を表示するやつ*/

        if (!location.href.match(/https:\/\/ncode.syosetu.com\/n\d{4}[a-z]{2}\/\d+/)) {
            return;
        }
        if (location.href.match(/https:\/\/ncode.syosetu.com\/n\d{4}[a-z]{2}\/\d+/)[0] + '/' !== location.href) {
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
</style>`
        document.head.insertAdjacentHTML('beforeend', style_elm);


        const novel_title = document.querySelector('div.contents1 > a:nth-child(1)').innerText.trim();
        const novel_page_url = document.querySelector('div.contents1 > a:nth-child(1)').href;
        const novel_no = document.querySelector('div#novel_no').innerText.trim();
        const novel_writername = document.querySelector('div.contents1 > a:nth-child(2)').innerText.trim();
        const novel_writer_url = document.querySelector('div.contents1 > a:nth-child(2)').href;
        const chapter_title =  document.querySelector('div.contents1 > p') ?
            document.querySelector('div.contents1 > p').innerText.trim() :
            null;

        const elm =
`<div class="us_flow_novel_detail">
    <a class="us_novel_title" href="${novel_page_url}">${novel_title}</a><br>
    <p>作者：<a class="us_novel_writername" href="${novel_writer_url}">${novel_writername}</a></p>
    <p class="us_chapter_title">${chapter_title ? chapter_title : ''}</p>
    <br>
    <p class="us_novel_no">${novel_no}</p>
    <p class="us_long_update">投稿：---</p>
    <p class="us_revision_update">改稿：---</p>
</div>`
        document.querySelector('div#container').insertAdjacentHTML('beforeend', elm);


        const fetch_url = 'https://ncode.syosetu.com' + location.href.match(/\/n\w+\//)[0];
        fetch(fetch_url)
            .then(res => {
                return res.text()
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const elm = doc.querySelector(`a[href="${location.pathname}"]`).parentElement.parentElement;

                const novel_no = elm.querySelector('a').href.split('/')[4];
                const subtitle = elm.querySelector('a').innerText;

                const long_update = elm.querySelector('.long_update').textContent.trim()
                    .match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/)[0];

                const revision_update = elm.querySelector('dt > span') ?
                    elm.querySelector('dt > span').title.trim().match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/)[0] :
                    null;

                return {
                    'novel_no': novel_no,
                    'subtitle': subtitle,
                    'long_update': long_update,
                    'revision_update': revision_update
                }

            })
            .then(novel_data => {
                document.querySelector('div.us_flow_novel_detail > .us_long_update').textContent = '投稿：' + novel_data.long_update;
                if (novel_data.revision_update) {
                    document.querySelector('div.us_flow_novel_detail > .us_revision_update').textContent = '改稿：' + novel_data.revision_update;
                }
            })
            .catch(error => {
                console.error('データの取得に失敗しました', error);
            });
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




    const hostname = window.location.hostname;
    if ('ncode.syosetu.com' === hostname) {
        syosetu();
    }
    if ('novelpia.jp' === hostname || 'novelpink.jp' === hostname) {
        novelpia();
    }


})();