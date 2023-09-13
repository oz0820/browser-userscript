// ==UserScript==
// @name         Syosetu Tool
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @version      2023.08.23.1
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
            let ncode = document.location.href.split("/")[3];
            let next = "https://ncode.syosetu.com/"+ncode+"/";
            let novel_no = document.getElementById("novel_no");

            // 一覧ページとかで発動されると困るので
            if (novel_no == null) {
                return;
            }

            let total_episode = parseInt(novel_no.innerHTML.split("/")[1]);
            let now_episode = parseInt(novel_no.innerHTML.split("/")[0]);

            let siori_url = document.getElementsByName("siori_url");

            if (e.code === "ControlRight" || e.code === "ControlLeft") {
                // 範囲外ページに移動することを防ぐ
                if (now_episode === total_episode) {
                    return;
                }
                next += now_episode+1;
                location.assign(next);
            } else if (e.code === "ArrowRight") {
                // 範囲外ページに移動することを防ぐ
                if (now_episode === total_episode) {
                    return;
                }
                next += now_episode+1;
                location.assign(next);
            } else if (e.code === "ArrowLeft") {
                // 範囲外のページに移動することを防ぐ
                if (now_episode <= 1) {
                    return;
                }
                next += now_episode-1;
                document.location.href = next;
            } else if (e.code === "ArrowUp") {
                window.scroll(window.scrollX, window.scrollY-100);
            } else if (e.code === "ArrowDown") {
                window.scroll(window.scrollX, window.scrollY+100);
            } else if (e.code === "ShiftRight") {
                if (siori_url.length > 0) {
                    siori_url[0].click();
                }
            } else {
                // console.log(e.key);
            }
        });


        function total_characters() {
            let strhtml = '<html>' + document.getElementById('novel_honbun').innerHTML.replaceAll("\n", "") + '</html>';
            const parser = new DOMParser();
            const doc = parser.parseFromString(strhtml, 'text/html');

            let lines = doc.getElementsByTagName('p');

            let total_count = 0;
            for (let i=0; i<lines.length; i++) {
                let line_str = lines[i].innerHTML;
                // 行brタグだけのことがある
                if (line_str === "<br>") {
                    continue;
                }

                // ルビがあったらルビの文字数を逐次足して、line_strからルビを消し去る
                while (line_str.search("<ruby>") !== -1) {
                    // ルビ前
                    total_count += line_str.substring(0, line_str.search("<ruby>")).length;
                    let ruby_body = line_str.substring(line_str.search("<ruby>") + 6, line_str.search("</ruby>"));
                    // ルビ
                    total_count += ruby_body.substring(ruby_body.search("<rb>") + 4, ruby_body.search("</rb>")).length;
                    // ルビ後に置き換え
                    line_str = line_str.substring(line_str.search("</ruby>")+7);
                }
                total_count += lines[i].innerHTML.length;
            }
            return total_count;
        }
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