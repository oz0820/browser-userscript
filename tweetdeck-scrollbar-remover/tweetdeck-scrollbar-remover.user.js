// ==UserScript==
// @name         TweetDeck Scrollbar Remover
// @namespace    https://twitter.com/oz0820
// @version      2023.08.26.0
// @description  新TweetDeckのスクロールバーを消します。ついでにパディングを削って情報密度を上げます。弊害があるので自己責任でお願いします。
// @author       oz0820
// @match        https://tweetdeck.twitter.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/tweetdeck-scrollbar-remover/tweetdeck-scrollbar-remover.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNiI+PHBhdGggZD0iTTIyLjIsMC4ySDMuOUMyLDAuMiwwLjUsMS43LDAuNSwzLjZ2MTUuNWMwLDEuOSwxLjUsMy40LDMuNCwzLjRoNS43bDMuNCwzLjRsMy40LTMuNGg1LjdjMS45LDAsMy40LTEuNSwzLjQtMy40VjMuNkMyNS43LDEuNywyNC4xLDAuMiwyMi4yLDAuMnoiIGZpbGw9IiMxREExRjIiLz48cGF0aCBkPSJNOS44LDE4LjZjNi4zLDAsOS44LTUuMiw5LjgtOS44VjguNGMwLjctMC41LDEuMy0xLjEsMS43LTEuOGMtMC42LDAuMy0xLjMsMC41LTIsMC41YzAuNy0wLjQsMS4zLTEuMSwxLjUtMS45Yy0wLjYsMC40LTEuNCwwLjctMi4yLDAuOGMtMC42LTAuNi0xLjUtMS0yLjUtMWMtMS45LDAtMy40LDEuNS0zLjQsMy40YzAsMC4zLDAsMC41LDAuMSwwLjhDOS45LDksNy40LDcuNyw1LjcsNS42QzUuNCw2LjEsNS4yLDYuNyw1LjIsNy4zYzAsMS4yLDAuNiwyLjIsMS41LDIuOWMtMC41LDAtMS4xLTAuMi0xLjUtMC41YzAsMS43LDEuMiwzLjEsMi44LDMuNGMtMC4zLDAuMS0wLjYsMC4xLTAuOSwwLjFjLTAuMiwwLTAuNCwwLTAuNi0wLjFjMC40LDEuNCwxLjcsMi40LDMuMiwyLjRDOC41LDE2LjQsNywxNyw1LjQsMTdINC42QzYsMTgsNy44LDE4LjYsOS44LDE4LjYiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=
// ==/UserScript==

(function() {
    const deck_ver = document.cookie
        .split(';')
        .find(row => row.trim().startsWith('tweetdeck_version'))
        .split('=')[1];

    if (deck_ver !== 'beta') {
        console.log('[TweetDeck Scrollbar Remover] The version of Tweetdeck does not match.');
        return;
    }
    // CSSを文字列として定義
    const css = `
.css-1dbjc4n.r-1p0dtai.r-1d2f490.r-11yh6sk.r-1rnoaur.r-u8s1d.r-zchlnj.r-1bzj12m.r-ipm5af::-webkit-scrollbar {
    display:none;
}
.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-ig955 {
    padding-bottom: 3px;
}
.css-1dbjc4n.r-1loqt21.r-18u37iz.r-1ny4l3l.r-1udh08x.r-qi0n3.r-c9eks5.r-o7ynqc.r-6416eg {
    padding-right: 5px;
    padding-left: 10px;
}
    `;

    // HTML文書内の<head>要素を取得します。
    let head = document.head || document.getElementsByTagName('head')[0];

    // <style>要素を作成します。
    let style = document.createElement('style');

    // <style>要素のtype属性をCSSに設定します。
    style.type = 'text/css';

    // テキストノードを作成してCSSを追加します。
    style.appendChild(document.createTextNode(css));

    // 最後に<head>要素に<style>要素を追加します。これによりCSSが適用されます。
    head.appendChild(style);


    function wait(wait_seconds) {
        return new Promise(function(resolve) {
            setTimeout(resolve, wait_seconds); // 10秒待機
        });
    }


    // カラムメニューの邪魔な要素を消す(ポストをクリア・概要を表示)
    wait(5000).then(() => {
        const path1_d = 'M22 19v2h-7.5l2-2H22zM3.35 14.232c-.97.977-.97 2.559 0 3.536L6.59 21h5.32l9.78-9.774c.95-.949.98-2.477.07-3.463l-3.97-4.294c-.96-1.043-2.6-1.076-3.6-.072L3.35 14.232zm16.94-5.113c.18.197.17.503-.02.693l-5.52 5.524L9.91 10.5l5.69-5.689c.2-.201.53-.194.72.014l3.97 4.294zM11.09 19H7.41l-2.64-2.646c-.2-.196-.2-.512 0-.708l3.73-3.732 4.84 4.836L11.09 19zM1.29 7.707l2 2 1.42-1.414-2-2-1.42 1.414zM3 11H0v2h3v-2z';
        const path2_d = 'M13.5 8.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5S11.17 7 12 7s1.5.67 1.5 1.5zM13 17v-5h-2v5h2zm-1 5.25c5.66 0 10.25-4.59 10.25-10.25S17.66 1.75 12 1.75 1.75 6.34 1.75 12 6.34 22.25 12 22.25zM20.25 12c0 4.56-3.69 8.25-8.25 8.25S3.75 16.56 3.75 12 7.44 3.75 12 3.75s8.25 3.69 8.25 8.25z';

        document.querySelectorAll('div[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1ugchlj r-1777fci r-1ny4l3l r-bnwqim r-o7ynqc r-6416eg r-usgzl9"]')
            .forEach((elm) => {
                let target_path = elm.querySelector('path');
                if (target_path) {
                    let path_d = target_path.getAttribute('d')
                    if (path_d === path1_d || path_d === path2_d) {
                        elm.remove();
                    }
                }
            })
    })


    // 待機後に監視を開始
    wait(10000).then(function() {

        // 指定されたクラス名の要素を取得
        let column_header = document.querySelectorAll('.css-1dbjc4n.r-gtdqiz.r-ipm5af.r-136ojw6');

        // 横スクロールを適用するelements
        let target_window = document.getElementsByClassName('css-1dbjc4n r-h2r02b r-18u37iz r-16y2uox r-lltvgl r-1imtxzf r-13qz1uu')[0];

        // ホイールイベントを追加
        column_header.forEach(function (element) {
            element.addEventListener('wheel', function (event) {
                // スクロールの値を取得
                let scrollValue = event.deltaY;
                // 横スクロール実行
                target_window.scrollLeft += scrollValue;
            });
        });
    });
})();