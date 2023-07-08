// ==UserScript==
// @name         TweetDeck SquareProfilePic
// @namespace    https://twitter.com/oz0820
// @version      2023.07.08.2
// @description  新TweetDeckのユーザーアイコンを四角くします。
// @author       oz0820
// @match        https://tweetdeck.twitter.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/tweetdeck-square-profile-pic/tweetdeck-square-profile-pic.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNiAyNiI+PHBhdGggZD0iTTIyLjIsMC4ySDMuOUMyLDAuMiwwLjUsMS43LDAuNSwzLjZ2MTUuNWMwLDEuOSwxLjUsMy40LDMuNCwzLjRoNS43bDMuNCwzLjRsMy40LTMuNGg1LjdjMS45LDAsMy40LTEuNSwzLjQtMy40VjMuNkMyNS43LDEuNywyNC4xLDAuMiwyMi4yLDAuMnoiIGZpbGw9IiMxREExRjIiLz48cGF0aCBkPSJNOS44LDE4LjZjNi4zLDAsOS44LTUuMiw5LjgtOS44VjguNGMwLjctMC41LDEuMy0xLjEsMS43LTEuOGMtMC42LDAuMy0xLjMsMC41LTIsMC41YzAuNy0wLjQsMS4zLTEuMSwxLjUtMS45Yy0wLjYsMC40LTEuNCwwLjctMi4yLDAuOGMtMC42LTAuNi0xLjUtMS0yLjUtMWMtMS45LDAtMy40LDEuNS0zLjQsMy40YzAsMC4zLDAsMC41LDAuMSwwLjhDOS45LDksNy40LDcuNyw1LjcsNS42QzUuNCw2LjEsNS4yLDYuNyw1LjIsNy4zYzAsMS4yLDAuNiwyLjIsMS41LDIuOWMtMC41LDAtMS4xLTAuMi0xLjUtMC41YzAsMS43LDEuMiwzLjEsMi44LDMuNGMtMC4zLDAuMS0wLjYsMC4xLTAuOSwwLjFjLTAuMiwwLTAuNCwwLTAuNi0wLjFjMC40LDEuNCwxLjcsMi40LDMuMiwyLjRDOC41LDE2LjQsNywxNyw1LjQsMTdINC42QzYsMTgsNy44LDE4LjYsOS44LDE4LjYiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=
// ==/UserScript==

(function() {
    // スタイル無効化対象のセレクタ
    let targetSelector = '.r-sdzlij';

    // スタイルシートの一覧を取得
    let styleSheets = document.styleSheets;

    // スタイルシートを検索して対象のスタイルを無効化
    for (let i = 0; i < styleSheets.length; i++) {
        let styleSheet = styleSheets[i];
        let cssRules = styleSheet.cssRules || styleSheet.rules;
        if (!cssRules) continue;

        for (let j = 0; j < cssRules.length; j++) {
            let cssRule = cssRules[j];

            if (cssRule.selectorText === targetSelector) {
                // スタイルを無効化するため、プロパティを削除
                cssRule.style.borderBottomLeftRadius = "5px";
                cssRule.style.borderBottomRightRadius = "5px";
                cssRule.style.borderTopLeftRadius = "5px";
                cssRule.style.borderTopRightRadius = "5px";
            }
        }
    }
})();