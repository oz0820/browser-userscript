// ==UserScript==
// @name            Twitter custom style
// @namespace       https://twitter.com/oz0820
// @version         2023.11.15.0
// @description     Twitterにオレオレスタイルを適用します．
// @author          oz0820
// @match           https://twitter.com/*
// @match           https://tweetdeck.twitter.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/twitter-custom-style/twitter-custom-style.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// ==/UserScript==

(function() {
    const add_style = `<style>
div.css-1dbjc4n.r-1kihuf0.r-13qz1uu {
    display: none;
}
div.css-18t94o4.css-1dbjc4n.r-1777fci.r-1pl7oy7.r-1ny4l3l.r-o7ynqc.r-6416eg.r-13qz1uu {
    background-color: aqua;
}
</style>`;

    document.head.insertAdjacentHTML('beforeend', add_style);
})();