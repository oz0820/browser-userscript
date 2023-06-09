// ==UserScript==
// @name         YouTube Link Fixer
// @namespace    https://twitter.com/oz0820
// @version      2023.6.10.3
// @description  「○○週間」とか言って左上のYoutubeトップへのリンクを書き換えられて困っている方向け。強引な実装なので重たいです。
// @author       oz0820
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-link-fixer/youtube_link_fixer.user.js
// @downloadURL  https://github.com/oz0820/browser-userscript/raw/main/youtube-link-fixer/youtube_link_fixer.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function() {
    let elm = document.getElementsByClassName('yt-simple-endpoint style-scope ytd-topbar-logo-renderer')[0];
    if (elm.href !== "https://www.youtube.com/") {
        elm.href = '/';
        elm.setAttribute("onclick", "window.location.href = '/'");
        // ロゴを無理矢理戻すなら実行する
        // elm.innerHTML = '<div class="style-scope ytd-topbar-logo-renderer"><ytd-logo class="style-scope ytd-topbar-logo-renderer" is-red-logo=""></ytd-logo></div>';
    }

})();