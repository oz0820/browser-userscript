// ==UserScript==
// @name         Youtube chat mode changer
// @namespace    https://twitter.com/oz0820
// @version      2023.08.08.2
// @description  Youtubeのチャットのリプレイを常に全て表示します．
// @author       oz0820
// @match        https://www.youtube.com/watch*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/youtube-chat-mode-changer/youtube-chat-mode-changer.user.js
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTU5IiBoZWlnaHQ9IjExMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHBhdGggZD0ibTE1NCAxNy41Yy0xLjgyLTYuNzMtNy4wNy0xMi0xMy44LTEzLjgtOS4wNC0zLjQ5LTk2LjYtNS4yLTEyMiAwLjEtNi43MyAxLjgyLTEyIDcuMDctMTMuOCAxMy44LTQuMDggMTcuOS00LjM5IDU2LjYgMC4xIDc0LjkgMS44MiA2LjczIDcuMDcgMTIgMTMuOCAxMy44IDE3LjkgNC4xMiAxMDMgNC43IDEyMiAwIDYuNzMtMS44MiAxMi03LjA3IDEzLjgtMTMuOCA0LjM1LTE5LjUgNC42Ni01NS44LTAuMS03NXoiIGZpbGw9IiNmMDAiIC8+DQogIDxwYXRoIGQ9Im0xMDUgNTUtNDAuOC0yMy40djQ2Ljh6IiBmaWxsPSIjZmZmIiAvPg0KPC9zdmc+
// ==/UserScript==

(function() {
    const logger = function (message) {
        console.log('【YT-CmC】 ' + message);
    }

    function fuga() {
        let yt_live_chat_app = document.querySelector('yt-live-chat-app');

        if (null != yt_live_chat_app) {

            setTimeout(() => {
                yt_live_chat_app.querySelector('tp-yt-paper-listbox').children[1].click();
                logger('change LiveChat');

                if (getComputedStyle(document.querySelector('yt-live-chat-renderer')).getPropertyValue('--yt-live-chat-item-timestamp-display') === 'none') {
                    document.querySelector('yt-live-chat-renderer').removeAttribute('hide-timestamps');
                    logger('change TimeStamp')
                }
            }, 500);

        } else {
            setTimeout(fuga, 500);
        }
    }

    fuga();
})();