// ==UserScript==
// @name         ホヨバ補助ツール
// @version      2023.12.13.1
// @description  テイワットマップのピン画像を新しいタブで開く機能と，『Genshin Impact』『Honkai: Star Rail』のデイリーボタンを押す機能を追加します
// @namespace    https://twitter.com/oz0820
// @author       oz0820
// @updateURL    https://github.com/oz0820/browser-userscript/raw/main/hoyolab-map-assistant/hoyolab-map-assistant.user.js
// @match        https://act.hoyolab.com/ys/app/interactive-map/index.html*
// @match        https://act.hoyolab.com/ys/event/signin-sea-v3/index.html*
// @match        https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hoyolab.com
// ==/UserScript==


(async function () {

    const teyvat_map = () => {

        const style_html =
            `<style>
                div.map-popup__switch {
                    height: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.30rem;
                }
                
                /* ピンの画像の縦幅を制限する
                img.map-popup__img {
                    max-height: 2rem;
                }
                div.map-popup__info {
                    text-align: center;
                }
                 */
                
                div.map-popup__btn-edit {
                    height: 1rem;
                    text-align: left;
                    align-items: center;
                    display: flex;
                }
            </style>`;
        (document.head || document.querySelector('head')).insertAdjacentHTML('beforeend', style_html)

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
        const MAX_RETRY_TIME = 5000
        const RETRY_DELAY = 200
        const count = 0

        while ((count * RETRY_DELAY) < MAX_RETRY_TIME) {
            const sign_list = document.querySelector('div[class^="components-home-assets-__sign-content-test_---sign-list"]')
            if (!sign_list) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            } else {
                await new Promise(resolve => setTimeout(resolve, 200))  // ちょいと待つ
                for (let elm of sign_list.children) {
                    elm.classList.forEach(class_name => {
                        if (class_name.startsWith('components-home-assets-__sign-content-test_---sign-wrapper')) {
                            elm.click()
                            console.log('Genshin button find')
                            return true
                        }
                    })
                }
                console.warn('Genshin button not find')
            }
        }
        return false
    }

    const StarRail_daily = async () => {
        const MAX_RETRY_TIME = 5000
        const RETRY_DELAY = 200
        const count = 0

        while ((count * RETRY_DELAY) < MAX_RETRY_TIME) {
            const sign_list = document.querySelector('div[class^="components-pc-assets-__prize-list_---list"]')
            if (!sign_list) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            } else {
                await new Promise(resolve => setTimeout(resolve, 200))  // ちょいと待つ
                if (!sign_list.children[0].querySelector('img[class^="components-pc-assets-__prize-list_---received"]')) {
                    console.log('Not initialized yet')
                    continue
                }
                for (let elm of sign_list.children) {
                    if (elm.childElementCount === 3) {
                        elm.click()
                        console.log('StarRail button find')
                        return true
                    }
                }
                console.warn('StarRail button not find')
                return false
            }
        }
        console.warn('StarRail button not find')
        return false
    }


    if (location.href.startsWith('https://act.hoyolab.com/ys/app/interactive-map/index.html')) {
        console.info('start teyvat_map script')
        teyvat_map()
    }
    if (location.href.startsWith('https://act.hoyolab.com/ys/event/signin-sea-v3/index.html')) {
        console.info('start GenshinImpact_daily script')
        await GenshinImpact_daily()
    }
    if (location.href.startsWith('https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html')) {
        console.info('start StarRail_daily script')
        await StarRail_daily()
    }

})();