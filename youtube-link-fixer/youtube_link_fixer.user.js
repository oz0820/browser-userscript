// ==UserScript==
// @name         YouTube Link Fixer
// @namespace    https://twitter.com/oz0820
// @version      2023.6.10.1
// @description  「○○週間」とか言って左上のYoutubeトップへのリンクを書き換えられて困っている方向け。
// @author       oz0820
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube_link_fixer/youtube_link_fixer.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function() {
    let elm = document.getElementsByClassName('yt-simple-endpoint style-scope ytd-topbar-logo-renderer')[0];
    elm.href = 'https://www.youtube.com/';
    elm.title = 'YouTube ホーム';
    elm.innerHTML = '<div class="style-scope ytd-topbar-logo-renderer"><ytd-logo class="style-scope ytd-topbar-logo-renderer" is-red-logo=""></ytd-logo></div>';
})();