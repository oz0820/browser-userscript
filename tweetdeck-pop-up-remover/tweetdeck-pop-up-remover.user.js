// ==UserScript==
// @name         TweetDeck PopUpRemover
// @namespace    https://twitter.com/oz0820
// @version      2023.07.08.0
// @description  旧Deckのポップアップを消し去る
// @author       oz0820
// @match        https://tweetdeck.twitter.com/*
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/tweetdeck-pop-up-remover/tweetdeck-pop-up-remove.user.js
// @icon         data:image/png;base64,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
// ==/UserScript==

(function() {
    function wait() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 5000); // 10秒待機
        });
    }

    // 待機後に監視を開始
    wait().then(function() {

        // Cookieの値を取得する関数
        function getCookieValue(cookieName) {
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                if (cookie.startsWith(cookieName + '=')) {
                    return cookie.substring(cookieName.length + 1);
                }
            }
            return null;
        }

        // 旧Deck以外だったら停止
        if (getCookieValue('tweetdeck_version') === 'legacy') {
            // 対象の要素を取得
            let targetElements = document.getElementsByClassName("js-gryphon-beta-btn gryphon-beta-btn-container");
            // 要素を削除
            for (let i = targetElements.length - 1; i >= 0; i--) {
                let element = targetElements[i];
                element.parentNode.removeChild(element);
            }
        }
    });

})();