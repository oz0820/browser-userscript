// ==UserScript==
// @name         TweetDeck PopUpRemover
// @namespace    https://twitter.com/oz0820
// @version      2023.07.08.2
// @description  旧Deckのポップアップを消し去る
// @author       oz0820
// @match        https://tweetdeck.twitter.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/tweetdeck-pop-up-remover/tweetdeck-pop-up-remover.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNiI+PHBhdGggZD0iTTIyLjIsMC4ySDMuOUMyLDAuMiwwLjUsMS43LDAuNSwzLjZ2MTUuNWMwLDEuOSwxLjUsMy40LDMuNCwzLjRoNS43bDMuNCwzLjRsMy40LTMuNGg1LjdjMS45LDAsMy40LTEuNSwzLjQtMy40VjMuNkMyNS43LDEuNywyNC4xLDAuMiwyMi4yLDAuMnoiIGZpbGw9IiMxREExRjIiLz48cGF0aCBkPSJNOS44LDE4LjZjNi4zLDAsOS44LTUuMiw5LjgtOS44VjguNGMwLjctMC41LDEuMy0xLjEsMS43LTEuOGMtMC42LDAuMy0xLjMsMC41LTIsMC41YzAuNy0wLjQsMS4zLTEuMSwxLjUtMS45Yy0wLjYsMC40LTEuNCwwLjctMi4yLDAuOGMtMC42LTAuNi0xLjUtMS0yLjUtMWMtMS45LDAtMy40LDEuNS0zLjQsMy40YzAsMC4zLDAsMC41LDAuMSwwLjhDOS45LDksNy40LDcuNyw1LjcsNS42QzUuNCw2LjEsNS4yLDYuNyw1LjIsNy4zYzAsMS4yLDAuNiwyLjIsMS41LDIuOWMtMC41LDAtMS4xLTAuMi0xLjUtMC41YzAsMS43LDEuMiwzLjEsMi44LDMuNGMtMC4zLDAuMS0wLjYsMC4xLTAuOSwwLjFjLTAuMiwwLTAuNCwwLTAuNi0wLjFjMC40LDEuNCwxLjcsMi40LDMuMiwyLjRDOC41LDE2LjQsNywxNyw1LjQsMTdINC42QzYsMTgsNy44LDE4LjYsOS44LDE4LjYiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=
// ==/UserScript==

(function() {
    const css = `
        .gryphon-beta-btn-container {
        display: none;
    }`;

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

})();