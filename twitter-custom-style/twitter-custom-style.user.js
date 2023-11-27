// ==UserScript==
// @name            Twitter custom style
// @namespace       https://twitter.com/oz0820
// @version         2023.11.28.0
// @description     Twitterにオレオレスタイルを適用します．
// @author          oz0820
// @match           https://twitter.com/*
// @match           https://tweetdeck.twitter.com/*
// @match           https://pro.twitter.com/*
// @updateURL       https://github.com/oz0820/browser-userscript/raw/main/twitter-custom-style/twitter-custom-style.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// ==/UserScript==

(function() {
    const add_style = `<style>
div.css-1dbjc4n.r-1kihuf0.r-13qz1uu {
    display: none;
}
/* twitter web 2023-11-25 */
div.css-175oi2r.r-1kihuf0.r-13qz1uu {
    display: none;
}

div.css-18t94o4.css-1dbjc4n.r-1777fci.r-1pl7oy7.r-1ny4l3l.r-o7ynqc.r-6416eg.r-13qz1uu {
    background-color: aqua;
}
</style>`;

    document.head.insertAdjacentHTML('beforeend', add_style);



    /* 画像を拡大表示したときに，画像の外側を白っぽくして境界線を見やすくする */

    const selector = {
        'tweetdeck.twitter.com': 'div[class="css-1dbjc4n r-1pi2tsx r-11yh6sk r-buy8e9 r-bnwqim r-13qz1uu"]',
        'pro.twitter.com': 'div[class="css-175oi2r r-1pi2tsx r-11yh6sk r-buy8e9 r-13qz1uu"]',
        'twitter.com': 'div[class="css-175oi2r r-1pi2tsx r-11yh6sk r-buy8e9 r-13qz1uu"]'
    }
    let path = location.pathname
    const observer = new MutationObserver(async function (e) {
        if (path !== location.pathname) {
            path = location.pathname

            // 画像を拡大表示しているときだけ実行
            if (location.pathname.match(/\/\w+\/status\/\d+\/photo\/\d/)) {
                e.forEach(elm => {
                    const target_elm = elm.target.querySelector(selector[location.hostname])
                    if (!!target_elm) {
                        target_elm.style.backgroundColor = 'rgba(80, 80, 80, 0.9)'

                    }
                })
            }
        }
    })

    /*　
    新しいタブを裏側で開いたとき，onloadが発火しない問題あり．要対応
    */
    window.onload = async () => {
        while (true) {
            try {
                observer.observe(document.querySelector("#layers"), {
                    childList: true,
                    subtree: true,
                })
                break
            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, 200))
            }
        }
    }

})();