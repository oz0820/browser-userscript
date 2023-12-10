// ==UserScript==
// @name         テイワットマップ補助ツール
// @version      2023.12.10.0
// @description  テイワットマップにいくつか手を加えます
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/hoyolab-map-assistant/hoyolab-map-assistant.user.js
// @match        https://act.hoyolab.com/ys/app/interactive-map/index.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hoyolab.com
// ==/UserScript==


(function() {

    const work = () => {
        let elm = document.querySelector('img.map-popup__img');
        if (!elm) {
            return;
        }
        if (!elm.classList.contains('new_window')){
            elm.addEventListener('click', function (e) {
                const a = document.createElement('a');
                a.href = e.target.src;
                a.target = '_blank';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
            elm.classList.add('new_window');
        }
    }

    // 画像にカーソルインしたときにクリックできそうな見た目にしたいので
    window.onload = () => {
        (document.head || document.querySelector('head'))?.insertAdjacentHTML('beforeend', `<style> div.map-popup__info { cursor: pointer; }</style>`)
    }

    // 新しいピンを開くたびに変更を適用する
    const observer = new MutationObserver(function (e) {
        if (e[0].target.className === 'expand-popup') {
            work()
        }
    })
    observer.observe(document.querySelector("#root"), { attributes: true })

})();