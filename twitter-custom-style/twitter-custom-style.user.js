// ==UserScript==
// @name            Twitter custom style
// @namespace       https://twitter.com/oz0820
// @version         2023.11.14.0
// @description     Twitterにオレオレスタイルを適用します．
// @author          oz0820
// @match           https://twitter.com/*
// @match           https://tweetdeck.twitter.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/twitter-custom-style/twitter-custom-style.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// ==/UserScript==

(function() {
    const add_style = `<style>div.css-1dbjc4n.r-1kihuf0.r-13qz1uu {display: none;}</style>`;
    document.head.insertAdjacentHTML('beforeend', add_style);
})();