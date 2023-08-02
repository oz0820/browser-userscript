// ==UserScript==
// @name         TweetDeck Scrollbar Remover
// @namespace    https://twitter.com/oz0820
// @version      2023.08.02.1
// @description  新TweetDeckのスクロールバーを消します。弊害があるので自己責任でお願いします。
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


    function wait() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 10000); // 10秒待機
        });
    }

    // 待機後に監視を開始
    wait().then(function() {

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