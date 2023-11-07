// ==UserScript==
// @name         Syosetu Tool
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2023.11.07.0
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
            if (novel_no == null) {
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