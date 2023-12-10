// ==UserScript==
// @name         テイワットマップ補助ツール
// @version      2023.12.11.0
// @description  テイワットマップにいくつか手を加えます
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/hoyolab-map-assistant/hoyolab-map-assistant.user.js
// @match        https://act.hoyolab.com/ys/app/interactive-map/index.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hoyolab.com
// ==/UserScript==


(async function () {

    const teyvat_map = () => {
        const work = () => {
            let img_elm = document.querySelector('img.map-popup__img')
            if (!img_elm) {
                return
            }
            const parent = img_elm.parentNode
            const a_elm = document.createElement('a')
            a_elm.href = img_elm.src
            a_elm.appendChild(img_elm.cloneNode(true))
            parent.replaceChild(a_elm, img_elm)
        }

        // 新しいピンを開くたびに変更を適用する
        const observer = new MutationObserver(function (e) {
            if (e[0].target.className === 'expand-popup') {
                work()
            }
        })
        observer.observe(document.querySelector("#root"), {attributes: true})
    }

    const GenshinImpact_daily = async () => {
        const MAX_RETRY_TIME = 3000
        const RETRY_DELAY = 200
        const count = 0

        while ((count * RETRY_DELAY) < MAX_RETRY_TIME) {
            const sign_list = document.querySelector('div[class^="components-home-assets-__sign-content-test_---sign-list"]')
            if (!sign_list) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            } else {
                for (let elm of sign_list.children) {
                    elm.classList.forEach(class_name => {
                        if (class_name.startsWith('components-home-assets-__sign-content-test_---sign-wrapper')) {
                            elm.click()
                        }
                    })
                }
                break
            }
        }
    }


    if (location.href.startsWith('https://act.hoyolab.com/ys/app/interactive-map/index.html')) {
        teyvat_map()
    }
    if (location.href.startsWith('https://act.hoyolab.com/ys/event/signin-sea-v3/index.html')) {
        await GenshinImpact_daily()
    }

})();